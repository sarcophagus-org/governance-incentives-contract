import { expect } from 'chai';
import { calculateRewardsAmounts, zero, Reward } from '../src/index';
import { describe } from 'mocha';
import { BigNumber, ethers } from 'ethers';
import { mockStakingAmount, totalStakingAmount } from '../src/mocks/mock-data';

// helper function that sums the BN values of the array of objects Rewards
function getSum(distributions: Reward[]): BigNumber {
  let sum = zero;
  for (let d of distributions) {
    let value: BigNumber = d.rewardAmount;
    sum = sum.add(value);
  }
  return sum;
}

describe('Script: rewards distribution ', () => {
  it.skip('Sum distributed to voters should be equal to initial amount set to distribute', async () => {
    const TOTAL_REWARDS_AMOUNT = ethers.utils.parseEther('100');
    const rewardsObject = await calculateRewardsAmounts(TOTAL_REWARDS_AMOUNT);
    const rewardsSum = getSum(rewardsObject);
    expect(Number(rewardsSum)).closeTo(Number(TOTAL_REWARDS_AMOUNT), 1000000);
  });

  it('Weights should be equal', async () => {
    const TOTAL_REWARDS_AMOUNT = ethers.utils.parseEther('100');
    const rewardsObject = await calculateRewardsAmounts(TOTAL_REWARDS_AMOUNT);
    const rewardsSum = getSum(rewardsObject);

    for (let i = 0; i < rewardsObject.length; i++) {
      let rewardWeight = rewardsObject[i].rewardAmount.div(rewardsSum);
      let sarcoWeight = mockStakingAmount
        .get(rewardsObject[i].voterAddress)
        ?.div(totalStakingAmount);
      expect(rewardWeight).to.equal(sarcoWeight);
    }
  });
});

// weights maps
// use weights to test this
