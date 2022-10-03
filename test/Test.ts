import { describe } from 'mocha';
import { expect } from 'chai';
import { ethers } from 'hardhat'
import { Collection } from "../typechain-types";
import { Sarco } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from 'ethers';
import { sum, Reward} from "./utils/helpers"

let collection: Collection;
let sarco: Sarco;
let tokenOwner: SignerWithAddress;
let sarcoDao: SignerWithAddress;
let voter1: SignerWithAddress;
let voter2: SignerWithAddress;
const zero = ethers.constants.Zero;

// REVIEW TEST NAMES - DO THEY MATCH NEW FUNCTIONS / ERRORS NAMES?

describe("Contract: Collection", function () {
    let initialContractBalance: BigNumber = ethers.utils.parseEther('100');

    beforeEach(async () => {
      const Sarco = await ethers.getContractFactory("Sarco");
      const Collection = await ethers.getContractFactory("Collection");
      // initialising signers
      [sarcoDao, tokenOwner, voter1, voter2] = await ethers.getSigners()
      // deplying contracts
      sarco = await Sarco.connect(tokenOwner).deploy(tokenOwner.address) as Sarco; 
      collection = await Collection.connect(sarcoDao).deploy(sarco.address) as Collection;

      // funding the Collection contract with 100 SARCO
      await sarco.connect(tokenOwner).transfer(collection.address, initialContractBalance)
    });

    describe("allocateRewards()", () => {
      context("Successfully allocates rewards of 10 SARCO to 2 voters", () => {
        let voterReward = ethers.utils.parseEther('10');

        it("should allocate rewards among voters", async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]

          //let rewards: Reward = {[_address: voter1.address, _amount: voterReward], [voter2.address, voterReward]}
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

        it("should set withdrawableByDao to match rewards that have not been allocated to voters", async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]

          await collection.connect(sarcoDao).allocateRewards(rewards)
          // sending additional rewards to the Collection contract to check if internal accounting works as expected
          await sarco.connect(tokenOwner).transfer(collection.address, ethers.utils.parseEther('100')) 
          await collection.connect(sarcoDao).allocateRewards(rewards)

          let contractBalanceAfter: BigNumber = await sarco.balanceOf(collection.address)
          let claimableByVoters = await collection.claimableByVoters()
          let leftToDistribute = contractBalanceAfter.sub(claimableByVoters) 

          // confirm that what is withdrawable by DAO matches excess rewards that have not been yet allocated to voters
          expect(await collection.unallocatedRewards()).to.equal(leftToDistribute)
        })

        it("emit Rewards", async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]
          
          expect(await collection.connect(sarcoDao).allocateRewards(rewards))
          .to.emit(rewards, "Rewards")
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
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]

          await expect(collection.connect(sarcoDao).allocateRewards(rewards)).to.be.revertedWith("InsufficientContractBalance")
        })
      })
    })

    describe("claim()", () => {
      context("2 voters successfully claim the SARCO allocated to them", () => {
        let voterReward = ethers.utils.parseEther('10');

        beforeEach(async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]
          await collection.connect(sarcoDao).allocateRewards(rewards)
        });

        it("SARCO balance of each voter should increase by 10 SARCO", async () => {
          const balanceVoter1Before = await sarco.balanceOf(voter1.address)
          const balanceVoter2Before = await sarco.balanceOf(voter2.address)

          await collection.connect(voter1).claim()
          await collection.connect(voter2).claim()

          // confirm claimed SARCO has reached voters' addresses
          expect(await sarco.balanceOf(voter1.address)).to.equal(balanceVoter1Before.add(voterReward))
          expect(await sarco.balanceOf(voter2.address)).to.equal(balanceVoter2Before.add(voterReward))
        })

        it("should reset the voters internal accounting mapping balanceOf[]", async () => {
          await collection.connect(voter1).claim()
          await collection.connect(voter2).claim()

          // check internal accounting clears balances of voters once they have claimed rewards
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

      context("Failed claim", () => {
        let voterReward = ethers.utils.parseEther('10');

        it("should revert if voter has no rewards left to claim", async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]
          await collection.connect(sarcoDao).allocateRewards(rewards)

          await collection.connect(voter1).claim()
          // Try to call claim() again but will revert as balance of voter has been set to 0 after initial claim() call
          await expect(collection.connect(voter1).claim()).to.be.revertedWith('NoClaimableReward')
        })
      })
    })

    describe("daoWithdraw()", () => {
      context("Successfully withdraw any excess rewards by DAO/Owner", () => {
        let voterReward = ethers.utils.parseEther('10');

        beforeEach(async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]
          await collection.connect(sarcoDao).allocateRewards(rewards)
        });

        it("should transfer remaining balance of the contract", async () => {
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]

          const withdrawableByDao = await collection.unallocatedRewards()

          await collection.connect(sarcoDao).daoWithdraw()

          // confirm the DAO/Owner receives only what is withdrawable, excluding what is claimable by voters
          expect(await sarco.balanceOf(sarcoDao.address)).to.equal(withdrawableByDao)

          // verify the contract's claimable rewards have been untouched
          expect(await collection.claimableByVoters()).to.equal(sum(rewards))
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

        //TODO: further test new logic
        it("should revert if all rewards are allocated", async () => {
          const withdrawableByDao = await collection.unallocatedRewards()
          // setting voter rewards as the amount of SARCO left in the contract that can still be distributed for rewards
          voterReward = withdrawableByDao.div(2);
          let rewards: Reward[] = [{_address: voter1.address, _amount: voterReward}, {_address: voter2.address, _amount: voterReward}]

          await collection.connect(sarcoDao).allocateRewards(rewards)

          // confirm the DAO/Owner is unable to withdraw SARCO as all the tokens in the contract are claimable by voters
          await expect(collection.connect(sarcoDao).daoWithdraw()).to.be.revertedWith("NoUnallocatedRewards")
        })
      })
    })
})

