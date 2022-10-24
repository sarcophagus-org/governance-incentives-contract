import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { VotingData } from '../queries/voting-data';

export interface Staking {
  voterAddress: string;
  stakingAmount: BigNumber;
}

export async function mockVotingData() {
  const voteDataObject: VotingData = {
    addresses: [
      '0x19fd3927ffe5f49c19e0c722290adba674bf52a3',
      '0x244265a76901b8030b140a2996e6dd4703cbf20f',
    ],
    executedBlockNumber: 1655495417,
    snapshotBlockNumber: 14968124,
  };
  return voteDataObject;
}

export const mockStakingAmount: Map<string, BigNumber> = new Map();
mockStakingAmount.set(
  '0x19fd3927ffe5f49c19e0c722290adba674bf52a3',
  BigNumber.from(ethers.utils.parseEther('4'))
);
mockStakingAmount.set(
  '0x244265a76901b8030b140a2996e6dd4703cbf20f',
  BigNumber.from(ethers.utils.parseEther('12'))
);

export const totalStakingAmount = ethers.utils.parseEther('16');
