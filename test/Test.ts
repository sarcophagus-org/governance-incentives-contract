import { describe } from 'mocha';
import { expect } from 'chai';
import { ethers } from 'hardhat'
import { Collection } from "../typechain-types";
import { Sarco } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from 'ethers';

describe("Collections Contract", function () {
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

    it("should initiate contract with a balance of 100 SARCO", async () => {
      expect(await sarco.balanceOf(collection.address)).to.equal(initialContractBalance)
    })

    // TODO: put in a helper file
    // put the amounts and voters as consts on the top of the file
    // do we need the distribute function?
    async function distribute(amounts = [voterIncentive, voterIncentive], voters = [voter1.address, voter2.address]) {
      // TODO: make this get the address inputs only - test needs to pre-populate amounts (rewards mapping in collections contract or v2?)
      await collection.connect(sarcoDao).distribute(voters, amounts)
    }

    // TODO: put in a helper file
    function sum(amounts: BigNumber[]) {
      let sum = zero;
      for (let i in amounts) {
        sum = sum.add(amounts[i]);
      }
      return sum
     }

    describe("Distribute", () => {
      // look at sarco tests to see how context is used
      context("where voter incentive is the 10 SARCO for 2 voters", () => {
      let voterIncentive: BigNumber = ethers.utils.parseEther('10');
      let amounts = [voterIncentive, voterIncentive]
      let voters = [voter1.address, voter2.address]
      // then call the distribute function
      
      it("should distribute incentives among voters", async () => {
        await collection.connect(sarcoDao).distribute(voters, amounts)

        expect(await collection.balanceOf(voter1.address)).to.equal(voterIncentive)
        expect(await collection.balanceOf(voter2.address)).to.equal(voterIncentive)
      })

      it("should revert if function not called by owner", async () => {
        await expect(collection.connect(voter1).distribute(voters, amounts)).to.be.revertedWith('Ownable: caller is not the owner');
      })

      // TODO: add in the solidity
      it("should revert if distributing more than its token balance", async () => {
        let voters = [voter1.address, voter2.address]
        let amount = initialContractBalance
        let amounts = [amount, amount]
  
        await expect(collection.connect(sarcoDao).distribute(voters, amounts)).to.be.revertedWith("");
      })

      it("should have same legth arrays for voters and amounts to be distributed", async () => {
        // TODO: mappings address to amount? this would remove this test
        let voters = [voter1.address, voter2.address]
        let amount = voterIncentive
        let amounts = [amount, amount, amount]
  
        await expect(collection.connect(sarcoDao).distribute(voters, amounts)).to.be.revertedWith('Arguments array length not equal');
      
        voters = [voter1.address, voter2.address, voter2.address]
        amounts = [amount, amount]
        await expect(collection.connect(sarcoDao).distribute(voters, amounts)).to.be.revertedWith('Arguments array length not equal');
      })

      it("claimable tokens by voters should be the sum of individual amounts distributed to voters", async () => {
        await distribute(amounts)
        expect(await collection.toBeClaimed()).to.equal(sum(amounts))
      })

      it("should update amount to be distributed by netting what still needs to be claimed", async () => {
        await collection.connect(sarcoDao).distribute(voters, amounts)
        await sarco.connect(tokenOwner).transfer(collection.address, ethers.utils.parseEther('100'))  
        await collection.connect(sarcoDao).distribute(voters, amounts)
        let ContractBalanceAfter: BigNumber = await sarco.balanceOf(collection.address)
        let toBeClaimed
        let leftToDistribute = ContractBalanceAfter.sub(sum(amounts)).sub(sum(amounts)) // minus to be claimed
        expect(await collection.toBeDistributed()).to.equal(leftToDistribute)
      })

    })
    })

    describe("Claim", () => {
      // add context
      // before each distribute (even part of the context)
      it("should receive SARCO", async () => {
        await distribute()
        const balanceVoter1Before = await sarco.balanceOf(voter1.address)
        const balanceVoter2Before = await sarco.balanceOf(voter2.address)
        
        await collection.connect(voter1).claim()
        await collection.connect(voter2).claim()

        expect(await sarco.balanceOf(voter1.address)).to.equal(balanceVoter1Before.add(voterIncentive))
        expect(await sarco.balanceOf(voter2.address)).to.equal(balanceVoter2Before.add(voterIncentive))
      })

      it("should set to 0 the voters balance in collection contract", async () => {
        let amounts = [voterIncentive, voterIncentive]
        await distribute(amounts)

        const balanceVoter1Before = await sarco.balanceOf(voter1.address)
        const balanceVoter2Before = await sarco.balanceOf(voter2.address)
        
        await collection.connect(voter1).claim()
        await collection.connect(voter2).claim()

        expect(await collection.balanceOf(voter1.address)).to.equal(zero)
        expect(await collection.balanceOf(voter1.address)).to.equal(zero)
      })

      it("should fail if voter has no balance", async () => {
        await distribute()

        await collection.connect(voter1).claim()

        await expect(collection.connect(voter1).claim()).to.be.revertedWith('Claim unsuccessful: your balance is 0');
      })

      it("should set tokens to be claimed to 0 once all amounts have been claimed", async () => {
        await distribute()
        await collection.connect(voter1).claim()
        await collection.connect(voter2).claim()

        expect(await collection.toBeClaimed()).to.equal(zero)
      })
    })

    describe("Dao Withdraw", () => {
      // Contex
      it("should transfer remaining balance of the contract, netting the claimable tokens", async () => {
        await distribute()
   
        const balanceToStillBeDistributed = await collection.toBeDistributed()

        await collection.connect(sarcoDao).withdraw()

        expect(await sarco.balanceOf(sarcoDao.address)).to.equal(balanceToStillBeDistributed)
      })

      it("should reject if called by non owner", async () => {
        // is this necessary?
        // await distribute()
        // await collection.connect(voter1).claim()
        // await collection.connect(voter2).claim()

        await expect(collection.connect(voter1).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
      })

      it("should reject if tokens balance of contract is equal to claimable amounts by voters", async () => {
        let amount = initialContractBalance.div(2);
        let amounts = [amount, amount]
        await distribute(amounts)

        await expect(collection.connect(sarcoDao).withdraw()).to.be.revertedWith('Withdraw unsuccessful: all tokens are claimable by voters');
      })
    })
  });
