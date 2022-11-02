# Collection Contract and Voting Rewards Distribution Script

[![Discord](https://img.shields.io/discord/753398645507883099?color=768AD4&label=discord)](https://discord.com/channels/753398645507883099/)
[![Twitter](https://img.shields.io/twitter/follow/sarcophagusio?style=social)](https://twitter.com/sarcophagusio)

## Overview

This repository contains the scripts to compute the Sarcophagus DAO voting rewards and the smart contract that collects protocol fees and allocates them to voters as rewards.

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

Copy `.env.example` into `.env` in root directory and update your environment variables as follows.

# MOCK DATA

RUNS THE DISTRIBUTION SCRIPT USING MOCK DATA.

## Environment Variables

For testing with mock data set in `.env` ETHEREUM_NETWORK to an empty string, VOTE_ID to any number cast as a string (ex "21"), and TOTAL_REWARDS_WEI as the total amount of rewards to be distributed to voters.

## Distribution Script

To console.log the mock reward distribution allocation run in the terminal:

```
npm run start
```

## Tests

For complete testing:

```
npm run test
```

# LOCAL ENVIRONMENT

DEPLOYS THE COLLECTION CONTRACT LOCALLY ON HARDHAT AND RUNS THE SCRIPTS USING REAL WORLD INPUT DATA SUCH AS VOTER ADDRESSES AND THEIR SARCO VR HOLDING AT THE TIME OF VOTING.

## Environment Variables

In the `.env` file set the ETHEREUM_NETWORK to "mainnet", VOTE_ID to the Sarco DAO vote number (ex "21"), set your INFURA_API_KEY, and set TOTAL_REWARDS_WEI as the total amount to be distributed to voters.

## Local deploy commands

To deploy the Collection Contract on the hardhat local chain and fund it with 100 SARCO, in two separate terminals run each of the following commands:

```
npm run chain
npm run deploy
```

This last command will console log the Collection Contract address deployed locally. Add this address in the `.env` on COLLECTION_CONTRACT_ADDRESS.

## Distribution Script

To console.log the preview of the reward distribution allocation based on TOTAL_REWARDS_WEI run in the terminal:

```
npm run start
```

## Distribute Rewards

At the time of this writing, the total unallocated rewards in the Collection Contract will be distributed to voters when the distribution script is executed. To execute the reward distribution on the locally deployed Collection Contract run:

```
npm run distribution
```

# TESTNET AND MAINNET ENVIRONMENT

DISTRIBUTE REWARDS TO VOTERS USING REAL WORLD INPUT DATA AND THE COLLECTION CONTRACT ALREADY DEPLOYED ON TESTNET OR MAINNET.

## Environment Variables

In addition to the variables included in the local environment above, once the Collection Contract is deployed on the chain of choice, update its address in COLLECTION_CONTRACT_ADDRESS.

Also include MAINNET_DEPLOYER_PRIVATE_KEY or GOERLI_DEPLOYER_PRIVATE_KEY and GOERLI_PROVIDER based on the chain where the Collection Contract has been deployed.

## Preview Distribution Results

At the time of this writing, the total unallocated rewards in the Collection Contract will be distributed to voters when the distribution script is executed. To preview the distribution results prior to executing the distribution, set in the .env file TOTAL_REWARDS_WEI to the unallocated rewards of the Collection contract, then run:

```
npm run start
```

## Distribute Rewards

To distribute all unallocated rewards held in the Collection Contract to voters, run:

```
npm run distribution
```
