import { ethers } from 'hardhat'
let zero = ethers.constants.Zero;   

/**
 * @notice Sums rewards amounts that are due to voters 
 * @param rewards Array of structs of voters' addresses and amounts 
 * to be transfered 
 */

export function sum(rewards: any) {
    let sum = zero;
    for (let i in rewards) {
      sum = sum.add(rewards[i][1]);
    }
    return sum
   }