import { describe } from 'mocha';
import { expect } from 'chai';
import { ethers } from 'hardhat'
import { Collection } from "../typechain-types";
import { Sarco } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from 'ethers';
import { sum, Reward, zero, randomRewards} from "./utils/helpers"

let collection: Collection;
let sarco: Sarco;
let tokenOwner: SignerWithAddress;
let sarcoDao: SignerWithAddress;
let voter1: SignerWithAddress;
let voter2: SignerWithAddress;

describe("Contract: Collection", function () {
    let initialContractBalance: BigNumber = ethers.utils.parseEther('100');

    beforeEach(async () => {
      const Sarco = await ethers.getContractFactory("Sarco");
      const Collection = await ethers.getContractFactory("Collection");
      // initialising signers, with 2 voters
      [sarcoDao, tokenOwner, voter1, voter2] = await ethers.getSigners()
      // deplying contracts
      sarco = await Sarco.connect(tokenOwner).deploy(tokenOwner.address) as Sarco; 
      collection = await Collection.connect(sarcoDao).deploy(sarco.address) as Collection;

      // funding the Collection contract with 100 SARCO
      await sarco.connect(tokenOwner).transfer(collection.address, initialContractBalance)
    });

    describe("allocateRewards()", () => {
      context("Successfully allocates rewards to voters", () => {
        let voterReward = ethers.utils.parseEther('10');

        it("should allocate rewards among 2 voters", async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]
          await collection.connect(sarcoDao).allocateRewards(rewards)
        
          // confirm voters have increased their balance in the contract internal accounting
          expect(await collection.balanceOf(voter1.address)).to.equal(voterReward)
          expect(await collection.balanceOf(voter2.address)).to.equal(voterReward)
        })

        it("should set claimable tokens as the sum of individual amounts allocated to voters", async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]

          await collection.connect(sarcoDao).allocateRewards(rewards)

          expect(await collection.claimableByVoters()).to.equal(sum(rewards))
        })

        it("should set unallocatedRewards to match rewards that have not been allocated to voters", async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]
          // allocate initial rewards
          await collection.connect(sarcoDao).allocateRewards(rewards)
          // sending additional rewards to the Collection contract to check if internal accounting works as expected
          await sarco.connect(tokenOwner).transfer(collection.address, ethers.utils.parseEther('100')) 
          // allocate rewards again
          await collection.connect(sarcoDao).allocateRewards(rewards)

          let contractBalanceAfter = await sarco.balanceOf(collection.address)
          let claimableByVoters = await collection.claimableByVoters()
          let leftToDistribute = contractBalanceAfter.sub(claimableByVoters) 

          // confirm unallocatedRewards matches excess rewards that have not been yet allocated to voters
          expect(await collection.unallocatedRewards()).to.equal(leftToDistribute)
        })

        it("emit Rewards", async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]
          
          expect(await collection.connect(sarcoDao).allocateRewards(rewards))
          .to.emit(rewards, "Rewards")
        })
      })

      context("Successfully randomly allocates initial contract balance as rewards to 50 voters", () => {
        it("Should update internal accounting, set claimableByVoters to sum of each reward and set unallocated rewards to 0", async () => {
          let votersNumber = 50
          // helper function to distribute rewards randomly among a number of voters
          let rewards = await randomRewards(votersNumber, initialContractBalance)
          await collection.connect(sarcoDao).allocateRewards(rewards)

          // confirm voters have increased their balance in the contract internal accounting
          for (let i = 0; i < rewards.length; i++) {
            expect(await collection.balanceOf(rewards[i]._address)).to.equal(rewards[i]._amount)
          }

          expect(await collection.claimableByVoters()).to.equal(sum(rewards))

          // confirm unallocatedRewards equals 0 as all have been allocated to voters
          expect(await collection.unallocatedRewards()).to.equal(zero)
        })
      })

      context("Failed setRewards", () => {
        it("should revert when function not called by owner", async () => {
          let voterReward = ethers.utils.parseEther('10');
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]
          
          await expect(collection.connect(voter1).allocateRewards(rewards)).to.be.revertedWith('Ownable: caller is not the owner')
        })

        it("should revert if distributing more than contract token balance", async () => {
          let voterReward = initialContractBalance
          // allocating initial contract balance to both voters, 
          // implying it is trying to allocate twice the balance of the contract as there are 2 voters
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]

          await expect(collection.connect(sarcoDao).allocateRewards(rewards)).to.be.revertedWith("InsufficientContractBalance")
        })
      })
    })

    describe("claim()", () => {
      context("Successfully claim the SARCO by 2 voters", () => {
        let voterReward = ethers.utils.parseEther('10');

        beforeEach(async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]
          await collection.connect(sarcoDao).allocateRewards(rewards)
        });

        it("SARCO balance of each voter should increase by their allocated reward", async () => {
          const balanceVoter1Before = await sarco.balanceOf(voter1.address)
          const balanceVoter2Before = await sarco.balanceOf(voter2.address)

          await collection.connect(voter1).claim()
          await collection.connect(voter2).claim()

          // confirm claimed SARCO has reached voters' wallets
          expect(await sarco.balanceOf(voter1.address)).to.equal(balanceVoter1Before.add(voterReward))
          expect(await sarco.balanceOf(voter2.address)).to.equal(balanceVoter2Before.add(voterReward))
        })

        it("should reset the voters internal accounting mapping balanceOf[]", async () => {
          await collection.connect(voter1).claim()
          await collection.connect(voter2).claim()

          // check internal accounting clears balances of voters once rewards are claimed
          expect(await collection.balanceOf(voter1.address)).to.equal(zero)
          expect(await collection.balanceOf(voter1.address)).to.equal(zero)
        })

        it("should reset total claimable tokens by voters once all have been claimed", async () => {
          await collection.connect(voter1).claim()
          await collection.connect(voter2).claim()

          // check internal accounting clears total claimable tokens by voters
          expect(await collection.claimableByVoters()).to.equal(zero)
        })

        it("emit Claim", async () => {
          expect(await collection.connect(voter1).claim())
          .to.emit(voterReward, "Claim")
        })
      })

      context("Successfully claim the SARCO randomly allocated to 50 voters", () => {
        it("SARCO balance of each voter should increase by their allocated reward", async () => {
          let votersNumber = 50
          // helper function to distribute rewards randomly among a number of voters
          let rewards = await randomRewards(votersNumber, initialContractBalance)
          await collection.connect(sarcoDao).allocateRewards(rewards)
          
          // voters claim their rewards if they have been allocated any
          for (let i = 0; i < rewards.length; i++) {
            const balanceVoterBefore = await sarco.balanceOf(rewards[i]._address)
            let signer = rewards[i]._signer as SignerWithAddress

            rewards[i]._amount.eq(zero) 
            ? await expect(collection.connect(signer).claim()).to.be.revertedWith('NoClaimableReward') 
            : await collection.connect(signer).claim()
            
            // check voters received their reward
            expect(await sarco.balanceOf(rewards[i]._address)).to.equal(balanceVoterBefore.add(rewards[i]._amount))
            // check internal accounting clears balances of voters after rewards are claimed
            expect(await collection.balanceOf(rewards[i]._address)).to.equal(zero)
          }

          // check internal accounting clears total claimable tokens by voters
          expect(await collection.claimableByVoters()).to.equal(zero)

          // check DAO has no unallocated rewards to withdraw
          await expect(collection.connect(sarcoDao).daoWithdraw()).to.be.revertedWith("NoUnallocatedRewards")
        })
      })

      context("Failed claim", () => {
        let voterReward = ethers.utils.parseEther('10');

        it("should revert if voter has no rewards left to claim", async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]
          await collection.connect(sarcoDao).allocateRewards(rewards)

          await collection.connect(voter1).claim()
          // Calling claim() again will revert as balance of voter is empty after initial claim() call
          await expect(collection.connect(voter1).claim()).to.be.revertedWith('NoClaimableReward')
        })
      })
    })

    describe("daoWithdraw()", () => {
      context("Successfully withdraw any unallocated rewards by DAO/Owner", () => {
        let voterReward = ethers.utils.parseEther('10');

        beforeEach(async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]
          await collection.connect(sarcoDao).allocateRewards(rewards)
        });

        it("should transfer remaining balance of the contract", async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]

          const withdrawableByDao = await collection.unallocatedRewards()
          // DAO withdraws unallocated rewards
          await collection.connect(sarcoDao).daoWithdraw()

          // confirm the DAO/Owner receives only what is withdrawable, excluding what is claimable by voters
          expect(await sarco.balanceOf(sarcoDao.address)).to.equal(withdrawableByDao)

          // verify the contract's claimable rewards have been untouched
          expect(await collection.claimableByVoters()).to.equal(sum(rewards))
        })

        it("should withdraw multiple times correctly when additional rewards are sent and remain unallocated", async () => {
          const withdrawableByDao = await collection.unallocatedRewards()
          // DAO withdraws unallocated rewards
          await collection.connect(sarcoDao).daoWithdraw()
  
          // collection contract receives additional fees from the protocol
          let additionalFeesReceived = ethers.utils.parseEther('10')
          await sarco.connect(tokenOwner).transfer(collection.address, additionalFeesReceived) 
          
          // DAO withdraws unallocated funds again, while voters have not yet claimed their allocated rewards
          await collection.connect(sarcoDao).daoWithdraw()

          // confirm the DAO balance after the withdraw is increased by the additional fees received as they have not been distributed as rewards
          expect(await sarco.balanceOf(sarcoDao.address)).to.equal(withdrawableByDao.add(additionalFeesReceived))
 
          // verify the internal accounting has no unallocated rewards left
          expect(await collection.unallocatedRewards()).to.be.equal(zero)
          
        })

        it("emit Withdraw", async () => {
          expect(await collection.connect(sarcoDao).daoWithdraw()).to.emit(voterReward, "Withdraw")
        })
      })

      context("Fail daoWithdraw", () => {
        let voterReward = ethers.utils.parseEther('10');

        beforeEach(async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]
          await collection.connect(sarcoDao).allocateRewards(rewards)
        });

        it("should revert when function not called by owner", async () => {
          await expect(collection.connect(voter1).daoWithdraw())
          .to.be.revertedWith('Ownable: caller is not the owner')
        })

        it("should revert if all rewards have been allocated", async () => {
          const toBeAllocated = await collection.unallocatedRewards()
          // setting voter rewards as what can still be allocated to voters, divided by number of voters
          voterReward = toBeAllocated.div(2);
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]

          await collection.connect(sarcoDao).allocateRewards(rewards)

          // verify the internal accounting has no unallocated rewards left
          expect(await collection.unallocatedRewards()).to.be.equal(zero)

          // confirm the DAO/Owner is unable to withdraw as all the tokens have been allocated to voters
          await expect(collection.connect(sarcoDao).daoWithdraw()).to.be.revertedWith("NoUnallocatedRewards")
        })
      })
    })
})

