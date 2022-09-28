import { describe } from 'mocha';
import { expect } from 'chai';
import { ethers } from 'hardhat'
import { Collection } from "../typechain-types";
import { Sarco } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from 'ethers';
import { sum } from "./utils/helpers"

describe("Contract: Collection", function () {
    let collection: Collection;
    let sarco: Sarco;
    let tokenOwner: SignerWithAddress;
    let sarcoDao: SignerWithAddress;
    let voter1: SignerWithAddress;
    let voter2: SignerWithAddress;
    let zero = ethers.constants.Zero;
    let initialContractBalance: BigNumber = ethers.utils.parseEther('100');

    beforeEach(async () => {
      const Sarco = await ethers.getContractFactory("Sarco");
      const Collection = await ethers.getContractFactory("Collection");
      [sarcoDao, tokenOwner, voter1, voter2] = await ethers.getSigners()

      // TODO: look in to this further: why must we add as Sarco/Collection
      sarco = await Sarco.connect(tokenOwner).deploy(tokenOwner.address) as Sarco; 
      collection = await Collection.connect(sarcoDao).deploy(sarco.address) as Collection;

      await sarco.connect(tokenOwner).transfer(collection.address, initialContractBalance)
    });

    describe("setRewards()", () => {
      context("Successfully allocates rewards of 10 SARCO to 2 voters", () => {
        let voterIncentive = ethers.utils.parseEther('10');

        it("should allocate rewards among voters", async () => {
          let rewards: any = [[voter1.address, voterIncentive], [voter2.address, voterIncentive]]
          await collection.connect(sarcoDao).setRewards(rewards)
          
          expect(await collection.balanceOf(voter1.address)).to.equal(voterIncentive)
          expect(await collection.balanceOf(voter2.address)).to.equal(voterIncentive)
        })

        it("should set claimable tokens as the sum of individual amounts allocated to voters", async () => {
          let rewards: any = [[voter1.address, voterIncentive], [voter2.address, voterIncentive]]
          await collection.connect(sarcoDao).setRewards(rewards)

          expect(await collection.claimableByVoters()).to.equal(sum(rewards))
        })

        it("should set withdrawableByDao by netting what still needs to be claimed", async () => {
          let rewards: any = [[voter1.address, voterIncentive], [voter2.address, voterIncentive]]
          await collection.connect(sarcoDao).setRewards(rewards)
          await sarco.connect(tokenOwner).transfer(collection.address, ethers.utils.parseEther('100')) 
          await collection.connect(sarcoDao).setRewards(rewards)
          let ContractBalanceAfter: BigNumber = await sarco.balanceOf(collection.address)
          let claimableByVoters = await collection.claimableByVoters()
          let leftToDistribute = ContractBalanceAfter.sub(claimableByVoters) 
          expect(await collection.withdrawableByDao()).to.equal(leftToDistribute)
        })

        it("emit Rewards", async () => {
          let rewards: any = [[voter1.address, voterIncentive], [voter2.address, voterIncentive]]
          
          expect(await collection.connect(sarcoDao).setRewards(rewards))
          .to.emit(rewards, "Rewards")
        })
      })

      context("Failed setRewards", () => {
        it("should revert when function not called by owner", async () => {
          let voterIncentive = ethers.utils.parseEther('10');
          let rewards: any = [[voter1.address, voterIncentive], [voter2.address, voterIncentive]]

          await expect(collection.connect(voter1).setRewards(rewards)).to.be.revertedWith('Ownable: caller is not the owner')
        })

        it("should revert if distributing more than its token balance", async () => {
          let voterIncentive = initialContractBalance
          let rewards: any = [[voter1.address, voterIncentive], [voter2.address, voterIncentive]]

          await expect(collection.connect(sarcoDao).setRewards(rewards)).to.be.revertedWith("InsufficientBalance")
        })
      })
    })

    describe("claim()", () => {
      context("2 voters successfully claim 10 SARCO each", () => {
        let voterIncentive = ethers.utils.parseEther('10');

        beforeEach(async () => {
          let rewards: any = [[voter1.address, voterIncentive], [voter2.address, voterIncentive]]
          await collection.connect(sarcoDao).setRewards(rewards)
        });

        it("SARCO balance of voters should increase by 10 SARCO each ", async () => {
          const balanceVoter1Before = await sarco.balanceOf(voter1.address)
          const balanceVoter2Before = await sarco.balanceOf(voter2.address)

          await collection.connect(voter1).claim()
          await collection.connect(voter2).claim()

          expect(await sarco.balanceOf(voter1.address)).to.equal(balanceVoter1Before.add(voterIncentive))
          expect(await sarco.balanceOf(voter2.address)).to.equal(balanceVoter2Before.add(voterIncentive))
        })

        it("Should reset the voters internal accounting mapping balanceOf[]", async () => {
          await collection.connect(voter1).claim()
          await collection.connect(voter2).claim()

          expect(await collection.balanceOf(voter1.address)).to.equal(zero)
          expect(await collection.balanceOf(voter1.address)).to.equal(zero)
        })


        it("should set tokens claimableByVoters too 0 once all have been claimed", async () => {
          await collection.connect(voter1).claim()
          await collection.connect(voter2).claim()

          expect(await collection.claimableByVoters()).to.equal(zero)
        })

        it("emit Claim", async () => {
          expect(await collection.connect(voter1).claim())
          .to.emit(voterIncentive, "Claim")
        })
      })

      context("Failed claim", () => {
        it("should revert if voter has no rewards to claim", async () => {
          await collection.connect(voter1).claim()
          // as claim() lets the voter withdraw all its balance, calling the function again will give the folling error
          await expect(collection.connect(voter1).claim()).to.be.revertedWith("InsufficientBalance")

        })
      })
    })

    describe("daoWithdraw()", () => {
      context("Successfully withdraw any excess rewards", () => {
        let voterIncentive = ethers.utils.parseEther('10');

        beforeEach(async () => {
          let rewards: any = [[voter1.address, voterIncentive], [voter2.address, voterIncentive]]
          await collection.connect(sarcoDao).setRewards(rewards)
        });

        it("should transfer remaining balance of the contract", async () => {
          const withdrawableByDao = await collection.withdrawableByDao()

          await collection.connect(sarcoDao).daoWithdraw()

          expect(await sarco.balanceOf(sarcoDao.address)).to.equal(withdrawableByDao)
        })
      })

      context("Fail daoWithdraw", () => {
        let voterIncentive = ethers.utils.parseEther('10');

        beforeEach(async () => {
          let rewards: any = [[voter1.address, voterIncentive], [voter2.address, voterIncentive]]
          await collection.connect(sarcoDao).setRewards(rewards)
        });

        it("should revert when function not called by owner", async () => {
          await expect(collection.connect(voter1).daoWithdraw())
          .to.be.revertedWith('Ownable: caller is not the owner')
        })

        it.skip("should reject if tokens balance of contract is equal to claimable amounts by voters", async () => {
          const withdrawableByDao = await collection.withdrawableByDao()
          let amount = withdrawableByDao.div(2);
          let rewards: any = [[voter1.address, voterIncentive], [voter2.address, voterIncentive]]
          await collection.connect(sarcoDao).setRewards(rewards)

          await expect(collection.connect(sarcoDao).daoWithdraw()).to.be.revertedWith("InsufficientBalance")
        })
      })
    })
})

