import { expect } from 'chai';
import { calculateRewardsAmounts, zero, Reward } from '../src/index';
import { describe } from 'mocha';
import { BigNumber, ethers } from 'ethers';
import { mockStakingAmount, totalStakingAmount } from '../src/mocks/mock-data';
require('dotenv').config();

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
  if (process.env.ETHEREUM_NETWORK === 'mainnet') {
    it('Sum distributed to voters should be equal to initial amount set to distribute', async () => {
      const TOTAL_REWARDS_AMOUNT = ethers.utils.parseEther('100');
      const rewardsObject = await calculateRewardsAmounts(TOTAL_REWARDS_AMOUNT);
      const rewardsSum = getSum(rewardsObject);
      expect(Number(rewardsSum)).closeTo(Number(TOTAL_REWARDS_AMOUNT), 1000000);
    });
  } else {
    it('Reward per voter should equate their Sarco-VR balance distribution', async () => {
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
