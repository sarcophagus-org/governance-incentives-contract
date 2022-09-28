import { ethers } from 'hardhat'
let zero = ethers.constants.Zero;   


/**
 * Sums incentive amounts that is due to voters 
 * in the rewards array
 */

export function sum(rewards: any) {
    let sum = zero;
    for (let i in rewards) {
      sum = sum.add(rewards[i][1]);
    }
    return sum
   }