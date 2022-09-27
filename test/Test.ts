import { describe, Context} from 'mocha';
import { expect } from 'chai';
import { ethers } from 'hardhat'
import { Collection } from "../typechain-types";
import { Sarco } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from 'ethers';
import { sum } from "./utils/helpers"

describe.skip("Contract: Collection", function () {
    let collection: Collection;
    let sarco: Sarco;
    let tokenOwner: SignerWithAddress;
    let sarcoDao: SignerWithAddress;
    let voter1: SignerWithAddress;
    let voter2: SignerWithAddress;
    let zero = ethers.constants.Zero;
    let initialContractBalance: BigNumber = ethers.utils.parseEther('100');
    // TODO: put the amounts and voters as consts on the top of the file


    beforeEach(async () => {
      const Sarco = await ethers.getContractFactory("Sarco");
      const Collection = await ethers.getContractFactory("Collection");
      [sarcoDao, tokenOwner, voter1, voter2] = await ethers.getSigners()

      // TODO: look in to this further: why must we add as Sarco/Collection
      sarco = await Sarco.connect(tokenOwner).deploy(tokenOwner.address) as Sarco; 
      collection = await Collection.connect(sarcoDao).deploy(sarco.address) as Collection;

      await sarco.connect(tokenOwner).transfer(collection.address, initialContractBalance)
    });

    describe.skip("distribute()", () => {
      //context("Successfully manages internal accounting for 2 voters to claim 10 SARCO", async () => {

      let voterIncentive = ethers.utils.parseEther('10');
      //let rewards: any = [[ voter1.address, voterIncentive], [voter2.address, voterIncentive]]
      
      
        beforeEach(async () => {
          console.log("before each start")
        });
        
        it.skip("should distribute incentives among voters", async () => {
          await collection.connect(sarcoDao).distribute(rewards)
          expect(await collection.balanceOf(voter1.address)).to.equal(voterIncentive)
          expect(await collection.balanceOf(voter2.address)).to.equal(voterIncentive)
        })

        // it("set claimable tokens as the sum of individual amounts distributed to voters", async () => {
        //   expect(await collection.toBeClaimed()).to.equal(sum(rewards))
        // })

        // // add comment for context
        // it("set amount to be distributed correctly by netting what still needs to be claimed by voters", async () => {
        //   await sarco.connect(tokenOwner).transfer(collection.address, ethers.utils.parseEther('100'))  
        //   await collection.connect(sarcoDao).distribute(rewards)
        //   let ContractBalanceAfter: BigNumber = await sarco.balanceOf(collection.address)
        //   let toBeClaimed = await collection.toBeClaimed()
        //   let leftToDistribute = ContractBalanceAfter.sub(toBeClaimed)
        //   expect(await collection.toBeDistributed()).to.equal(leftToDistribute)
        // })
      //})

      // context("Failed distribute", async () => {

      //   it.skip("should revert when function not called by owner", async () => {
      //     let voterIncentive = ethers.utils.parseEther('10');
      //     let rewards: any = [(voter1.address, voterIncentive), (voter2.address, voterIncentive)]
      //     await expect(collection.connect(voter1.address).distribute(rewards)).to.be.revertedWith('Ownable: caller is not the owner');
      //   })

      //   it("should revert if distributing more than its token balance", async () => {
      //     let voterIncentive = initialContractBalance;
      //     let rewards: any = [(voter1.address, voterIncentive), (voter2.address, voterIncentive)]
    
      //     await expect(collection.connect(sarcoDao).distribute(rewards)).to.be.revertedWith("Distributing more than contract balance");
      //   })


       })
   
    })

  //   describe.skip("Claim", () => {
  //     // add context
  //     // before each distribute (even part of the context)
  //     it("should receive SARCO", async () => {
  //       await distribute()
  //       const balanceVoter1Before = await sarco.balanceOf(voter1.address)
  //       const balanceVoter2Before = await sarco.balanceOf(voter2.address)
        
  //       await collection.connect(voter1).claim()
  //       await collection.connect(voter2).claim()

  //       expect(await sarco.balanceOf(voter1.address)).to.equal(balanceVoter1Before.add(voterIncentive))
  //       expect(await sarco.balanceOf(voter2.address)).to.equal(balanceVoter2Before.add(voterIncentive))
  //     })

  //     it("should set to 0 the voters balance in collection contract", async () => {
  //       let amounts = [voterIncentive, voterIncentive]
  //       await distribute(amounts)

  //       const balanceVoter1Before = await sarco.balanceOf(voter1.address)
  //       const balanceVoter2Before = await sarco.balanceOf(voter2.address)
        
  //       await collection.connect(voter1).claim()
  //       await collection.connect(voter2).claim()

  //       expect(await collection.balanceOf(voter1.address)).to.equal(zero)
  //       expect(await collection.balanceOf(voter1.address)).to.equal(zero)
  //     })

  //     it("should fail if voter has no balance", async () => {
  //       await distribute()

  //       await collection.connect(voter1).claim()

  //       await expect(collection.connect(voter1).claim()).to.be.revertedWith('Claim unsuccessful: your balance is 0');
  //     })

  //     it("should set tokens to be claimed to 0 once all amounts have been claimed", async () => {
  //       await distribute()
  //       await collection.connect(voter1).claim()
  //       await collection.connect(voter2).claim()

  //       expect(await collection.toBeClaimed()).to.equal(zero)
  //     })
  //   })

  //   describe.skip("Dao Withdraw", () => {
  //     // Contex
  //     it("should transfer remaining balance of the contract, netting the claimable tokens", async () => {
  //       await distribute()
   
  //       const balanceToStillBeDistributed = await collection.toBeDistributed()

  //       await collection.connect(sarcoDao).withdraw()

  //       expect(await sarco.balanceOf(sarcoDao.address)).to.equal(balanceToStillBeDistributed)
  //     })

  //     it("should reject if called by non owner", async () => {
  //       // is the following necessary?
  //       // await distribute()
  //       // await collection.connect(voter1).claim()
  //       // await collection.connect(voter2).claim()

  //       await expect(collection.connect(voter1).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
  //     })

  //     it("should reject if tokens balance of contract is equal to claimable amounts by voters", async () => {
  //       let amount = initialContractBalance.div(2);
  //       let amounts = [amount, amount]
  //       await distribute(amounts)

  //       await expect(collection.connect(sarcoDao).withdraw()).to.be.revertedWith('Withdraw unsuccessful: all tokens are claimable by voters');
  //     })
  //   })
  // });

  // it('reverts with a null token', async function () {
  //   await expectRevert(