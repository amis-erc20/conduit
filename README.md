#  [![Conduit](https://storage.googleapis.com/material-icons/external-assets/v4/icons/svg/ic_blur_circular_black_24px.svg)](#) Conduit - 0x Relayer API

[![CircleCI](https://circleci.com/gh/johnrjj/conduit.svg?style=svg)](https://circleci.com/gh/johnrjj/conduit/)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## Overview

[Work in progress, PR/Contributions welcome! Testing on Kovan test network]

ZeroEx Open Source Relayer using the [Open Orderbook](https://0xproject.com/wiki#Open-Orderbook) strategy.

Follows ZeroEx [Standard Relayer API V0 Draft](https://github.com/0xProject/standard-relayer-api) specification.

## Getting started


- Tested on ubuntu 16.04 LTS
- Install Nodejs: v10.11.0
git clone https://github.com/nionix/npm

- Install yarn:
```curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list```
```sudo apt-get update && sudo apt-get install yarn```

- Install redis-server:
```sudo apt-get install redis-server```
- then run command to confirm that everything ok:
```sudo service redis-server status```

- Install docker-compose:
sudo curl -L https://github.com/docker/compose/releases/download/1.18.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version

- Test connection to db port and other:
netstat -p tcp | grep $PORT
lsof -nP -iTCP:$PORT | grep LISTEN
lsof -nP -i:$PORT | grep LISTEN


- Install docker:
```curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -```

- Add the Docker repository to APT sources:

```sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"```
- Next, update the package database with the Docker packages from the newly added repo:

```sudo apt-get update```

```apt-cache policy docker-ce```

- Finally, install Docker:
```sudo apt-get install -y docker-ce```

- Docker should now be installed, the daemon started, and the process enabled to start on boot. Check that it's running:

```sudo systemctl status docker```

sudo docker-compose

- Install docker-machine
```curl -L https://github.com/docker/machine/releases/download/v0.15.0/docker-machine-$(uname -s)-$(uname -m) >/tmp/docker-machine &&
    chmod +x /tmp/docker-machine &&
    sudo cp /tmp/docker-machine /usr/local/bin/docker-machine```
- verify install: ```docker-machine -v```

yarn start
yarn run v1.9.4
$ node dist/index
2018-09-25T21:45:42.248Z - info: Conduit starting...
2018-09-25T21:45:42.262Z - verbose: Connected to Web3 Provider Engine
2018-09-25T21:45:42.340Z - verbose: ZeroEx client set up
2018-09-25T21:45:42.348Z - verbose: Redis Publisher setup
2018-09-25T21:45:42.349Z - verbose: Redis Subscriber setup
2018-09-25T21:45:42.349Z - debug: Connected to Redis instance
2018-09-25T21:45:42.391Z - error: Error connecting to Postgres Error: connect ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1113:14)
2018-09-25T21:45:42.391Z - error: Error starting app Error: connect ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1113:14)

yarn dev
$ ts-node src/index
2018-09-25T22:00:47.690Z - info: Conduit starting...
2018-09-25T22:00:47.708Z - verbose: Connected to Web3 Provider Engine
2018-09-25T22:00:47.823Z - verbose: ZeroEx client set up
2018-09-25T22:00:47.834Z - verbose: Redis Publisher setup
2018-09-25T22:00:47.835Z - verbose: Redis Subscriber setup
2018-09-25T22:00:47.835Z - debug: Connected to Redis instance
2018-09-25T22:00:47.915Z - error: Error connecting to Postgres error: password authentication failed for user "johnjohnson"



### Local dev setup

To start the local dev server: 

```
yarn install
yarn start
```
The server is hosted at `http://localhost:3000`

To make sure it is working, make a GET request to `http://localhost:3000/api/v0/token_pairs` 

### Configure
change feerecipient (kovan): 0x13cF20B0a6053bA53855e5574AD049323109B0C4

### Architecture
                                                                    
	                                                                     
	                                                                     
	                              ┌──────────────┐                       
	                              │              │                       
	                              │    Client    │                       
	                              │              │                       
	                              └──────────────┘                       
	                                    ▲  ▲                             
	                            ┌───────┘  └───────┐                     
	                            │                  ▼                     
	                     ┌─────────────┐    ┌─────────────┐              
	                     │             │    │             │              
	                     │  WebSocket  │    │  HTTP API   │              
	                     │             │    │             │              
	                     └─────────────┘    └─────────────┘              
	                            ▲                  ▲                     
	                            │ emits            │                     
	                            └─events┐   ┌──────┘                     
	                                    │   │                            
	                                    │   ▼                            
	    ┌──────────────────┐      ┌──────────────┐       ┌──────────────┐
	    │  Relevant event  │      │              │       │◦◦◦◦◦◦◦◦◦◦◦◦◦◦│
	    │     streams      │─────▶│  App Engine  │◀─────▶│◦◦◦◦0x.js◦◦◦◦◦│
	    │ (includes 0x.js) │      │              │       │◦◦◦◦◦◦◦◦◦◦◦◦◦◦│
	    └──────────────────┘      └──────────────┘       └──────────────┘
	                                      ▲                              
	                                      │                              
	                                      ▼                              
	                              ┌──────────────┐                       
	                              │              │                       
	                              │  Orderbook   │                       
	                              │              │                       
	                              └──────────────┘                       
	                                      ▲                              
	                                      │                              
	                                      ▼                              
	                              ┌──────────────┐                       
	                              │              │                       
	                              │  Data store  │                       
	                              │              │                       
	                              └──────────────┘                       
### Roadmap

I'll be adding support for [Matching](https://0xproject.com/wiki#Matching) as soon as [this proposal](https://github.com/0xProject/ZEIPs/issues/2) is implemented. I personally think the matching strategy will lead to a better UX (atomic, no race conditions, faster relay feedback), but currently requires large upfront capital. Matching engine will use sorted sets on top of red-black trees and will be configured as a separate strategy.
