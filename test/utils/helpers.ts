import { ethers } from 'ethers'

let zero = ethers.constants.Zero;   

interface Signer {}

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

  export const randomSigners = (amount: number): Signer[] => {
  const signers: Signer[] = []
  for (let i = 0; i < amount; i++) {
    signers.push(ethers.Wallet.createRandom())
  }
  return signers
}