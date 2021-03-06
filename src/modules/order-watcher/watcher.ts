import { ZeroEx, SignedOrder, OrderState, OrderStateValid } from '0x.js';
import { RedisClient } from 'redis';
import { Relay } from '../client/types';
import { Logger } from '../../util/logger';
import { serializeSignedOrder } from '../../util/order';

// convenience type
type OrderHash = string;

export class OrderWatcher {
  private watchedOrders: Set<OrderHash> = new Set();

  constructor(
    private zeroEx: ZeroEx,
    private relay: Relay,
    private redisPublisher: RedisClient,
    private redisSubscriber: RedisClient,
    private logger: Logger
  ) {
    this.setupOrderWatcher();
  }

  async watchOrderBatch(orders: Array<SignedOrder>) {
    return await Promise.all(orders.map(this.watchOrder.bind(this)));
  }

  async watchOrder(order: SignedOrder) {
    const orderHash = ZeroEx.getOrderHashHex(order);
    if (this.watchedOrders.has(orderHash)) {
      return;
    }
    this.watchedOrders.add(orderHash);
    return await this.zeroEx.orderStateWatcher.addOrder(order);
  }

  private setupOrderWatcher() {
    const orderStateWatcher = this.zeroEx.orderStateWatcher;
    this.zeroEx.orderStateWatcher.subscribe(this.handleOrderStateUpdate);
  }

  private handleOrderStateUpdate = async (orderState: OrderState) => {
    this.log(
      'debug',
      `Received an order update for order hash ${orderState.orderHash}`,
      orderState
    );
    if (isOrderStateValid(orderState)) {
      const { orderHash, orderRelevantState } = orderState;
      this.log(
        'verbose',
        `Order ${orderHash} update is in a valid state, updating order using relay conduit client`,
        orderRelevantState
      );
      const updatedSignedOrder: SignedOrder = await this.relay.updateOrder(
        orderHash,
        orderRelevantState
      );
      this.log('verbose', `Order ${orderHash} updated in data store`);
      const { makerTokenAddress, takerTokenAddress } = updatedSignedOrder;
      const { baseToken, quoteToken } = await this.relay.getBaseTokenAndQuoteTokenFromMakerAndTaker(
        makerTokenAddress,
        takerTokenAddress
      );
      const serializedUpdatedSignedOrder = serializeSignedOrder(updatedSignedOrder);
      const messageChannel = `orderbook:fill:${baseToken}:${quoteToken}`;
      const messageContents = JSON.stringify(serializedUpdatedSignedOrder);
      this.redisPublisher.publish(messageChannel, messageContents);
      this.log(
        'verbose',
        `Order ${orderHash} update complete, emiting event ${messageChannel}`,
        messageContents
      );
      return;
    } else {
      const { orderHash, error } = orderState;
      this.log(
        'verbose',
        `Order ${orderHash} update is in an invalid state. Not doing anythign right now`
      );
      return;
    }
  };

  private log(level: string, message: string, meta?: any) {
    if (!this.logger) {
      return;
    }
    this.logger.log(level, message, meta);
  }
}

const isOrderStateValid = (orderState: OrderState): orderState is OrderStateValid =>
  orderState.isValid;
