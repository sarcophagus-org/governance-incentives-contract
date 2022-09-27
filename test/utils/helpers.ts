import { ethers } from 'hardhat'
import { BigNumber } from 'ethers';
let zero = ethers.constants.Zero;   


/**
 * Sums amounts in an array
 */

export function sum(rewards: any) {
    let sum = zero;
    for (let i in rewards) {
      sum = sum.add(rewards[i][1]);
    }
    return sum
   }