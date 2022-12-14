import { describe } from 'mocha';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Collection, Sarco } from '../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber } from 'ethers';
import { getSum, Reward, zero, randomRewards } from './utils/helpers';

let collection: Collection;
let sarco: Sarco;
let tokenOwner: SignerWithAddress;
let sarcoDao: SignerWithAddress;
let voter1: SignerWithAddress;
let voter2: SignerWithAddress;

describe('Contract: Collection', function () {
  let initialContractBalance: BigNumber = ethers.utils.parseEther('100');

  beforeEach(async () => {
    const SarcoFactory = await ethers.getContractFactory('Sarco');
    const CollectionFactory = await ethers.getContractFactory('Collection');
    // initialising signers, with 2 voters
    [sarcoDao, tokenOwner, voter1, voter2] = await ethers.getSigners();
    // deploying contracts
    sarco = (await SarcoFactory.connect(tokenOwner).deploy(tokenOwner.address)) as Sarco;
    collection = (await CollectionFactory.connect(sarcoDao).deploy(sarco.address)) as Collection;

    // funding the Collection contract with 100 SARCO
    await sarco.connect(tokenOwner).transfer(collection.address, initialContractBalance);
  });

  describe('deposit()', () => {
    context('Successfully deposit SARCO to Collection contract', () => {
      let depositAmount = ethers.utils.parseEther('50');

      it('updates contract balance', async () => {
        let collectionBalanceBefore = await collection.getContractBalance();
        await sarco.connect(tokenOwner).approve(collection.address, depositAmount);
        await collection.connect(tokenOwner).deposit(depositAmount);

        expect(await collection.getContractBalance()).to.equal(
          collectionBalanceBefore.add(depositAmount)
        );
      });

      it('updates unallocated rewards considering any amounts claimable by voters', async () => {
        let collectionBalanceBefore = await collection.getContractBalance();

        let voterReward = ethers.utils.parseEther('20');
        let rewards: Reward[] = [
          { voterAddress: voter1.address, rewardAmount: voterReward },
          { voterAddress: voter2.address, rewardAmount: voterReward },
        ];

        // rewards get allocated to voters, increasing amounts claimable by voters
        await collection.connect(sarcoDao).allocateRewards(rewards);
        // an additional SARCO deposit takes place
        await sarco.connect(tokenOwner).approve(collection.address, depositAmount);
        await collection.connect(tokenOwner).deposit(depositAmount);

        let claimableByVoters = await collection.claimableByVoters();

        expect(await collection.unallocatedRewards()).to.equal(
          collectionBalanceBefore.add(depositAmount).sub(claimableByVoters)
        );
      });

      it('emit DepositRewards', async () => {
        await sarco.connect(tokenOwner).approve(collection.address, depositAmount);

        expect(await collection.connect(tokenOwner).deposit(depositAmount)).to.emit(
          depositAmount,
          'DepositRewards'
        );
      });
    });

    context('Fail deposit', () => {
      it('should revert if msg.sender has no SARCO', async () => {
        let depositAmount = ethers.utils.parseEther('50');
        // confirm voter1 holds no SARCO
        expect(await sarco.balanceOf(voter1.address)).to.equal(zero);

        await expect(collection.connect(voter1).deposit(depositAmount)).to.be.revertedWith(
          'SARCO balance is 0'
        );
      });
    });
  });

  describe('allocateRewards()', () => {
    context('Successfully allocates rewards to voters', () => {
      let voterReward = ethers.utils.parseEther('15');
      let rewards: Reward[] = [];

      beforeEach(() => {
        rewards = [
          { voterAddress: voter1.address, rewardAmount: voterReward },
          { voterAddress: voter2.address, rewardAmount: voterReward },
        ];
      });

      it('should allocate rewards among 2 voters', async () => {
        await collection.connect(sarcoDao).allocateRewards(rewards);

        // confirm voters have increased their balance in the contract internal accounting
        expect(await collection.balanceOf(voter1.address)).to.equal(voterReward);
        expect(await collection.balanceOf(voter2.address)).to.equal(voterReward);
      });

      it('should set claimable tokens as the sum of individual amounts allocated to voters', async () => {
        await collection.connect(sarcoDao).allocateRewards(rewards);

        expect(await collection.claimableByVoters()).to.equal(getSum(rewards));
      });

      it('should set unallocatedRewards to match rewards that have not been allocated to voters', async () => {
        // allocate initial rewards
        await collection.connect(sarcoDao).allocateRewards(rewards);
        // sending additional rewards to the Collection contract to check if internal accounting works as expected
        await sarco
          .connect(tokenOwner)
          .transfer(collection.address, ethers.utils.parseEther('100'));
        // allocate rewards again
        await collection.connect(sarcoDao).allocateRewards(rewards);

        let contractBalanceAfter = await sarco.balanceOf(collection.address);
        let claimableByVoters = await collection.claimableByVoters();
        let leftToDistribute = contractBalanceAfter.sub(claimableByVoters);

        // confirm unallocatedRewards matches excess rewards that have not been yet allocated to voters
        expect(await collection.unallocatedRewards()).to.equal(leftToDistribute);
      });

      it('emit AllocateRewards', async () => {
        expect(await collection.connect(sarcoDao).allocateRewards(rewards)).to.emit(
          rewards,
          'AllocateRewards'
        );
      });
    });

    context(
      'Successfully randomly allocates initial contract balance as rewards to 50 voters',
      () => {
        it('Should update internal accounting, set claimableByVoters to sum of each reward and set unallocated rewards to 0', async () => {
          let votersNumber = 50;
          // helper function to distribute rewards randomly among voters
          let rewards = await randomRewards(votersNumber, initialContractBalance);
          await collection.connect(sarcoDao).allocateRewards(rewards);

          // confirm voters have increased their balance in the contract internal accounting
          for (let i = 0; i < rewards.length; i++) {
            expect(await collection.balanceOf(rewards[i].voterAddress)).to.equal(
              rewards[i].rewardAmount
            );
          }

          expect(await collection.claimableByVoters()).to.equal(getSum(rewards));

          // confirm unallocatedRewards = 0 as all have been allocated to voters
          expect(await collection.unallocatedRewards()).to.equal(zero);

          // check DAO has no unallocated rewards to withdraw
          await expect(collection.connect(sarcoDao).daoWithdraw()).to.be.revertedWith(
            'NoUnallocatedRewards'
          );
        });
      }
    );

    context('Failed setRewards', () => {
      it('should revert when function not called by owner', async () => {
        let voterReward = ethers.utils.parseEther('21');
        let rewards: Reward[] = [
          { voterAddress: voter1.address, rewardAmount: voterReward },
          { voterAddress: voter2.address, rewardAmount: voterReward },
        ];

        await expect(collection.connect(voter1).allocateRewards(rewards)).to.be.revertedWith(
          'Ownable: caller is not the owner'
        );
      });

      it('should revert if distributing more than contract token balance', async () => {
        let voterReward = initialContractBalance;
        // allocating initial contract balance to both voters,
        // implying it is trying to allocate twice the balance of the contract as there are 2 voters
        let rewards: Reward[] = [
          { voterAddress: voter1.address, rewardAmount: voterReward },
          { voterAddress: voter2.address, rewardAmount: voterReward },
        ];

        await expect(collection.connect(sarcoDao).allocateRewards(rewards)).to.be.revertedWith(
          'InsufficientContractBalance'
        );
      });
    });
  });

  describe('claim()', () => {
    context('Successfully claim the SARCO by 2 voters', () => {
      let voterReward = ethers.utils.parseEther('18');

      beforeEach(async () => {
        let rewards: Reward[] = [
          { voterAddress: voter1.address, rewardAmount: voterReward },
          { voterAddress: voter2.address, rewardAmount: voterReward },
        ];
        await collection.connect(sarcoDao).allocateRewards(rewards);
      });

      it('SARCO balance of each voter should increase by their allocated reward', async () => {
        const balanceVoter1Before = await sarco.balanceOf(voter1.address);
        const balanceVoter2Before = await sarco.balanceOf(voter2.address);

        await collection.connect(voter1).claim();
        await collection.connect(voter2).claim();

        // confirm claimed SARCO has reached voters' wallets
        expect(await sarco.balanceOf(voter1.address)).to.equal(
          balanceVoter1Before.add(voterReward)
        );
        expect(await sarco.balanceOf(voter2.address)).to.equal(
          balanceVoter2Before.add(voterReward)
        );
      });

      it('should reset the voters internal accounting mapping balanceOf[]', async () => {
        await collection.connect(voter1).claim();
        await collection.connect(voter2).claim();

        // check internal accounting clears balances of voters once rewards are claimed
        expect(await collection.balanceOf(voter1.address)).to.equal(zero);
        expect(await collection.balanceOf(voter1.address)).to.equal(zero);
      });

      it('should reset total claimable tokens by voters once all have been claimed', async () => {
        await collection.connect(voter1).claim();
        await collection.connect(voter2).claim();

        // check internal accounting clears total claimable tokens by voters
        expect(await collection.claimableByVoters()).to.equal(zero);
      });

      it('emit ClaimRewards', async () => {
        expect(await collection.connect(voter1).claim()).to.emit(voterReward, 'ClaimRewards');
      });
    });

    context('Successfully claim the SARCO randomly allocated to 50 voters', () => {
      it('SARCO balance of each voter should increase by their allocated reward and internal accounting gets updated', async () => {
        let votersNumber = 50;
        // helper function to distribute rewards randomly among a number of voters
        let rewards = await randomRewards(votersNumber, initialContractBalance);
        await collection.connect(sarcoDao).allocateRewards(rewards);

        // voters claim their rewards if they have been allocated any
        for (let i = 0; i < rewards.length; i++) {
          const balanceVoterBefore = await sarco.balanceOf(rewards[i].voterAddress);
          let signer = rewards[i]._signer as SignerWithAddress;

          if (!rewards[i].rewardAmount.eq(zero)) {
            await collection.connect(signer).claim();
          }
          // check voters received their reward
          expect(await sarco.balanceOf(rewards[i].voterAddress)).to.equal(
            balanceVoterBefore.add(rewards[i].rewardAmount)
          );
          // check internal accounting clears balances of voters after rewards are claimed
          expect(await collection.balanceOf(rewards[i].voterAddress)).to.equal(zero);
        }

        // check internal accounting clears total claimable rewards
        expect(await collection.claimableByVoters()).to.equal(zero);
        // check DAO has no unallocated rewards to withdraw
        await expect(collection.connect(sarcoDao).daoWithdraw()).to.be.revertedWith(
          'NoUnallocatedRewards'
        );
      });
    });

    context('Failed claim', () => {
      let voterReward = ethers.utils.parseEther('33');

      it('should revert if voter has no rewards left to claim', async () => {
        let rewards: Reward[] = [
          { voterAddress: voter1.address, rewardAmount: voterReward },
          { voterAddress: voter2.address, rewardAmount: voterReward },
        ];
        await collection.connect(sarcoDao).allocateRewards(rewards);

        await collection.connect(voter1).claim();
        // Calling claim() again will revert as balance of voter is empty after initial claim() call
        await expect(collection.connect(voter1).claim()).to.be.revertedWith('NoClaimableReward');
      });
    });
  });

  describe('daoWithdraw()', () => {
    context('Successfully withdraw any unallocated rewards by DAO/Owner', () => {
      let voterReward = ethers.utils.parseEther('16');

      beforeEach(async () => {
        let rewards: Reward[] = [
          { voterAddress: voter1.address, rewardAmount: voterReward },
          { voterAddress: voter2.address, rewardAmount: voterReward },
        ];
        await collection.connect(sarcoDao).allocateRewards(rewards);
      });

      it('should transfer remaining balance of the contract', async () => {
        let rewards: Reward[] = [
          { voterAddress: voter1.address, rewardAmount: voterReward },
          { voterAddress: voter2.address, rewardAmount: voterReward },
        ];
        const withdrawableByDao = await collection.unallocatedRewards();
        // DAO withdraws unallocated rewards
        await collection.connect(sarcoDao).daoWithdraw();

        // confirm the DAO/Owner receives only what is withdrawable, excluding what is claimable by voters
        expect(await sarco.balanceOf(sarcoDao.address)).to.equal(withdrawableByDao);

        // verify the contract's claimable rewards are untouched
        expect(await collection.claimableByVoters()).to.equal(getSum(rewards));
      });

      it('should withdraw multiple times correctly when additional rewards are sent and remain unallocated', async () => {
        const withdrawableByDao = await collection.unallocatedRewards();
        // DAO withdraws unallocated rewards
        await collection.connect(sarcoDao).daoWithdraw();

        // collection contract receives additional fees from the protocol
        let additionalFeesReceived = ethers.utils.parseEther('21');
        await sarco.connect(tokenOwner).transfer(collection.address, additionalFeesReceived);

        // DAO withdraws unallocated funds again, while voters have not yet claimed their allocated rewards
        await collection.connect(sarcoDao).daoWithdraw();

        // confirm the DAO balance after the withdraw is increased by the additional fees received as they have not been distributed as rewards
        expect(await sarco.balanceOf(sarcoDao.address)).to.equal(
          withdrawableByDao.add(additionalFeesReceived)
        );

        // verify the internal accounting has no unallocated rewards left
        expect(await collection.unallocatedRewards()).to.be.equal(zero);
      });

      it('emit WithdrawUnallocatedRewards', async () => {
        expect(await collection.connect(sarcoDao).daoWithdraw()).to.emit(
          voterReward,
          'WithdrawUnallocatedRewards'
        );
      });
    });

    context('Fail daoWithdraw', () => {
      let voterReward = ethers.utils.parseEther('9');

      beforeEach(async () => {
        let rewards: Reward[] = [
          { voterAddress: voter1.address, rewardAmount: voterReward },
          { voterAddress: voter2.address, rewardAmount: voterReward },
        ];
        await collection.connect(sarcoDao).allocateRewards(rewards);
      });

      it('should revert when function not called by owner', async () => {
        await expect(collection.connect(voter1).daoWithdraw()).to.be.revertedWith(
          'Ownable: caller is not the owner'
        );
      });

      it('should revert if all rewards have been allocated', async () => {
        const toBeAllocated = await collection.unallocatedRewards();
        // setting voter rewards as what can still be allocated to voters, divided by number of voters
        voterReward = toBeAllocated.div(2);
        let rewards: Reward[] = [
          { voterAddress: voter1.address, rewardAmount: voterReward },
          { voterAddress: voter2.address, rewardAmount: voterReward },
        ];

        await collection.connect(sarcoDao).allocateRewards(rewards);

        // verify the internal accounting has no unallocated rewards left
        expect(await collection.unallocatedRewards()).to.be.equal(zero);

        // confirm the DAO/Owner is unable to withdraw as all the tokens have been allocated to voters
        await expect(collection.connect(sarcoDao).daoWithdraw()).to.be.revertedWith(
          'NoUnallocatedRewards'
        );
      });
    });
  });
});
