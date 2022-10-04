import { BigNumber, ethers } from 'ethers';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
export const zero = ethers.constants.Zero; 

export interface Reward {
  _address: string;
  _amount: BigNumber;
}

/**
 * @notice Sums rewards amounts that are due to voters 
 * @param rewards Array of structs of voters' addresses and amounts 
 * to be transfered 
 */

export function sum(rewards: Reward[]): BigNumber {
  let sum = zero;
  for (let i in rewards) {
    sum = sum.add(rewards[i]._amount);
  }
  return sum
 }


function distributeBN(length:number, value:number): BigNumber[] {

  function distribute(length:number, value:number): number[] {
      if (length <= 1)
          return [value];
      const half = Math.floor(length / 2)
      const dist = Math.floor(Math.random() * value);
      let result = distribute(half, dist).concat(distribute(length-half, value-dist));
      return result
  }

  let distributeArray = distribute(length, value)

  let distributeArrayBN: BigNumber[] = []
  for (let i = 0; i < distributeArray.length; i++) {
    let numberWei = ethers.utils.parseEther(distributeArray[i].toString())
    let BN = BigNumber.from(numberWei)
    distributeArrayBN.push(BN)
    }

  return distributeArrayBN
 }

const randomSigners = (amount: number): ethers.Wallet[] => {
   let signers: ethers.Wallet[] = []
   for (let i = 0; i < amount; i++) {
     signers.push(ethers.Wallet.createRandom())
   }
   return signers
  }

export function randomRewards(numberSigners: number, totalRewardAmount: BigNumber): Reward[] {
   let signers = randomSigners(numberSigners)
   let totalRewardAmountNumber = +ethers.utils.formatEther(totalRewardAmount)
   let amounts = distributeBN(numberSigners, totalRewardAmountNumber)
 
   let votersArray: Reward[] = [];
 
   for (let i = 0; i < numberSigners; i++) {
     let voter: Reward = {} as Reward
     voter._address = signers[i].address
     voter._amount = amounts[i]
     votersArray.push(voter)
   }
 
   return votersArray
 }


 