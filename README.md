# Voting incentive rewards distribution script

[![Discord](https://img.shields.io/discord/753398645507883099?color=768AD4&label=discord)](https://discord.com/channels/753398645507883099/)
[![Twitter](https://img.shields.io/twitter/follow/sarcophagusio?style=social)](https://twitter.com/sarcophagusio)

## Overview

This repository contains the smart contract and scripts that allow to compute and allocate the rewards to voters that have participated in a Sarco DAO proposal.

The rewards per voter are weighted based on the Sarco-VR holding at the time of the snapshot blocknumber.

## Prerequisites

First, clone the repository

```
git clone ...
```

then, install the necessary dependencies:

```
npm install
```

At the time of this writing, the project currently uses Node v16.17.0. It is recommended to use `nvm use` in root directory to switch to the correct version of Node.

Also Windows users will need to add .npmrc file with the contents script-shell=powershell

## Environment Variables

Copy `.env.example` into `.env` in root directory and update your environment variables.

In `.env` set the VOTE_ID string to the Sarco DAO vote number.

## Reward Distribution Script Execution

For mainnet in `.env` set ETHEREUM_NETWORK="mainnet" as well as your INFURA_API_KEY and TOTAL_REWARDS_WEI as the amount to distribute as rewards. To simulate the actual reward distribution, set TOTAL_REWARDS_WEI to the unallocated rewards of the Collection contract.

For test environment set in `.env` set ETHEREUM_NETWORK to an empty string.

To console.log the simulation of the reward distribution allocation based on TOTAL_REWARDS_WEI, run in the terminal:

```
npm run start
```

## Deploy Collection Contract

To deploy on the hardhat local chain, in two separate terminals run each of the following commands:

```
npm run chain
npm run deploy
```

## Distribute Rewards

For mainnet in `.env` set ETHEREUM_NETWORK="mainnet" as well as your INFURA_API_KEY and TOTAL_REWARDS_WEI as the amount to distribute as rewards.

The script is executed on the deployed Sarco Collection Contract, so its address needs to be added in `.env` COLLECTION_CONTRACT_ADDRESS.

Any unallocated rewards in the Collection Contract will be distributed as rewards to the voters of the selected VOTE_ID in `.env`.

For test environment set in `.env` set ETHEREUM_NETWORK to an empty string.

To conole log the allocation in the terminal run:

```
npm run distribution
```

## Execute Test

For testing with mock data set in `.env` ETHEREUM_NETWORK to an empty string, then run:

```
npm run test
```
