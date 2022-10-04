import { BigNumber } from 'ethers';
import { ethers } from 'hardhat'  


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

 