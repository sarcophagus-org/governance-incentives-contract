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
 * @notice   
 * @param rewards  
 */

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


/**
 * @notice   
 * @param rewards  
 */
export async function randomSigners(amount: number): Promise<SignerWithAddress[][]>  {
   let signers = []

   for (let i = 0; i < amount; i++) {
    let dummySigner = await ethers.getSigners()

    signers.push(dummySigner)
   }
   return signers
}

/**
 * @notice   
 * @param rewards  
 */
export async function randomRewards(numberSigners: number, totalRewardAmount: BigNumber): Promise<Reward[]> {
   let signers = await randomSigners(numberSigners)
   let totalRewardAmountNumber = +ethers.utils.formatEther(totalRewardAmount)
   let randomAmounts = distributeBN(numberSigners, totalRewardAmountNumber)
 
   let votersArray: Reward[] = [];
 
   for (let i = 0; i < numberSigners; i++) {
     let voter: Reward = {} as Reward
     // is this correct? consol log singer
     voter._signer = signers[0][i]
     voter._address = signers[0][i].address
     voter._amount = randomAmounts[i]
     votersArray.push(voter)
   }
 
   return votersArray
}


 