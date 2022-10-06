import { BigNumber } from 'ethers';
import { ethers } from 'hardhat'
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

export const zero = ethers.constants.Zero; 

export interface Reward {
  _address: string;
  _amount: BigNumber;
  _signer?: SignerWithAddress;
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

/**
 * @notice Distributes a value randomly to a given array length such that
 * the sum adds back to that initial value 
 * @param length array length which gets the value randomly distributed to
 * @param value value we want to distribute randomly
 */

function distributeBN(length:number, value:number): BigNumber[] {
  // internal function used for math computations in number type
  function distribute(length:number, value:number): number[] {
      if (length <= 1)
          return [value];
      const half = Math.floor(length / 2)
      const dist = Math.floor(Math.random() * value);
      let result = distribute(half, dist).concat(distribute(length-half, value-dist));
      return result
  }
  let distributeArray = distribute(length, value)
  
  // set up BN type array for function output
  let distributeArrayBN: BigNumber[] = []
  // loop through each number in the array generated by the internal function and convert to BN
  for (let i = 0; i < distributeArray.length; i++) {
    let numberWei = ethers.utils.parseEther(distributeArray[i].toString())
    let BN = BigNumber.from(numberWei)
    distributeArrayBN.push(BN)
    }
  return distributeArrayBN
}


/**
 * @notice Generates an amount of ethers signers  
 */
export async function Signers(amount: number): Promise<SignerWithAddress[][]>  {
   let signers = []
   for (let i = 0; i < amount; i++) {
    let signer = await ethers.getSigners()
    signers.push(signer)
   }
   return signers
}

/**
 * @notice Generates a random array of structs of voters' addresses and amounts to be claimed as rewards, as well as 
 * the signers used to sign transactions
 * @param numberOfVoters number of voters/signers
 * @param totalRewardAmount total value that will get randomly distributed to voters, such that
 * the sum adds back to total
 */
export async function randomRewards(numberOfVoters: number, totalRewardAmountBN: BigNumber): Promise<Reward[]> {
   let signers = await Signers(numberOfVoters)
   let totalRewardAmountNumber = +ethers.utils.formatEther(totalRewardAmountBN)
   let randomDistributionAmounts = distributeBN(numberOfVoters, totalRewardAmountNumber)
 
   let votersArray: Reward[] = [];
   for (let i = 0; i < numberOfVoters; i++) {
     let voter: Reward = {} as Reward
     voter._signer = signers[0][i] // used to sign blockchain transactions
     voter._address = signers[0][i].address
     voter._amount = randomDistributionAmounts[i]
     votersArray.push(voter)
   }
   return votersArray
}


 