import { expect } from 'chai';
import { calculateRewardsAmounts, zero, Reward } from '../src/index';
import { describe } from 'mocha';
import { BigNumber, ethers } from 'ethers';
import { mockStakingAmount, totalStakingAmount } from '../src/mocks/mock-data';
import dotenv from 'dotenv';
dotenv.config();

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
  if (process.env.ETHEREUM_NETWORK != 'mainnet') {
    it('Reward per voter should be distributed as per relative weight of their Sarco-VR balance', async () => {
      const TOTAL_REWARDS_AMOUNT = ethers.utils.parseEther('100');
      const rewardsObject = await calculateRewardsAmounts(TOTAL_REWARDS_AMOUNT);
      const rewardsSum = getSum(rewardsObject);

      for (let i = 0; i < rewardsObject.length; i++) {
        let rewardWeight = rewardsObject[i].rewardAmount.div(rewardsSum);
        let sarcoBalanceWeight = mockStakingAmount
          .get(rewardsObject[i].voterAddress)
          ?.div(totalStakingAmount);

        expect(rewardWeight).to.equal(sarcoBalanceWeight);
      }
    });
  }
});
