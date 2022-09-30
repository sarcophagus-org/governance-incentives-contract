import { BigNumber, ethers } from 'ethers'

let zero = ethers.constants.Zero;   


interface VoterReward {
  _address: string;
  _amount: BigNumber; 
}

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

  export const randomSigners = (amount: number): any => {
  const signers: ethers.Wallet[] = []
  for (let i = 0; i < amount; i++) {
    signers.push(ethers.Wallet.createRandom())
  }
  return signers
}

  export function distribute(length: number, value: BigNumber): any {
    // if (length <= 1)
    //     return [value];

    let half: number = Math.floor(length / 2)
    let random = Math.random() * 100
    let valueBN: BigNumber = value.mul(random)
    let dist: number = Math.floor(valueBN.div(100));
    return distribute(half, dist).concat(distribute(length-half, valueBN-dist));
    // change logic to use big number
    // value.mul
    // take big numbers and do arithmetics

    // let half = Math.floor(length / 2),
    //     dist: BigNumber = Math.floor(Math.random() * value) as any;
    // return distribute(half, dist).concat(distribute(length-half, value-dist));


  }

  export function randomRewards(numberSigners: number, totalRewardAmount: BigNumber): VoterReward[] {
    let signers = randomSigners(numberSigners)
    let amounts = distribute(numberSigners, totalRewardAmount)

    let votersArray: VoterReward[] = [];

    for (let i = 0; i < numberSigners; i++) {
      let voter: VoterReward = {} as VoterReward
      voter._address = signers[i].address
      voter._amount = amounts[i]
      votersArray.push(voter)
    }

    return votersArray
  }


