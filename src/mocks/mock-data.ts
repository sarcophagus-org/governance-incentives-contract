import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { VotingData } from '../queries/voting-data';

export interface Staking {
  voterAddress: string;
  stakingAmount: BigNumber;
}

// Mock addressess and blocknumbers
export async function mockVotingData() {
  const voteDataObject: VotingData = {
    addresses: [
      '0x0000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000002',
    ],
    executedBlockNumber: 1655495417,
    snapshotBlockNumber: 14968124,
  };
  return voteDataObject;
}

// Sarco-Vr balance of the mock voters
export const mockStakingAmount: Map<string, BigNumber> = new Map();
mockStakingAmount.set(
  '0x0000000000000000000000000000000000000001',
  BigNumber.from(ethers.utils.parseEther('4'))
);
mockStakingAmount.set(
  '0x0000000000000000000000000000000000000002',
  BigNumber.from(ethers.utils.parseEther('12'))
);

export const totalStakingAmount = ethers.utils.parseEther('16');
