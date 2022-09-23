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
    const zero = ethers.constants.Zero;
    const initialContractBalance = ethers.utils.parseEther('100');
    const voterIncentive = ethers.utils.parseEther('10');

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

    async function distribute(amounts = [voterIncentive, voterIncentive], voters = [voter1.address, voter2.address]) {
      await collection.connect(sarcoDao).distribute(voters, amounts)
    }

    function sum(amounts: BigNumber[]) {
      let sum = zero;
      for (let i in amounts) {
        sum = sum.add(amounts[i]);
      }
      return sum
     }

    describe("Distribution", () => {
      it("should distribute incentives among voters", async () => {
        await distribute()

        expect(await collection.balanceOf(voter1.address)).to.equal(voterIncentive)
        expect(await collection.balanceOf(voter2.address)).to.equal(voterIncentive)
      })

      it("should revert if function not called by owner", async () => {
        let voters = [voter1.address, voter2.address]
        let amount = ethers.utils.parseEther('10')
        let amounts = [amount, amount]
  
        await expect(collection.connect(voter1).distribute(voters, amounts)).to.be.revertedWith('Ownable: caller is not the owner');
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
        let amounts = [voterIncentive, voterIncentive]
        await distribute(amounts)
        // TODO: edge cases with large amounts and use sum
        expect(await collection.toBeClaimed()).to.equal(sum(amounts))
      })

      it("should update amount to be distributed by netting what still needs to be claimed", async () => {
        let amounts = [voterIncentive, voterIncentive]
        await distribute(amounts)
        await sarco.connect(tokenOwner).transfer(collection.address, ethers.utils.parseEther('100'))        
        await distribute(amounts)

        //TODO: use sum function
        expect(await collection.toBeDistributed()).to.equal(ethers.utils.parseEther('160').toString())
      })
    })

    describe("Claim", () => {
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

        expect(await collection.balanceOf(voter1.address)).to.equal(BigNumber.from(0))
        expect(await collection.balanceOf(voter1.address)).to.equal(BigNumber.from(0))
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

        expect(await collection.toBeClaimed()).to.equal(BigNumber.from(0))
      })
    })

    describe("Dao Withdraw", () => {
      it("should transfer remaining balance of the contract, netting the claimable tokens", async () => {
        await distribute()
   
        const balanceToStillBeDistributed = await collection.toBeDistributed()

        await collection.connect(sarcoDao).withdraw()

        expect(await sarco.balanceOf(sarcoDao.address)).to.equal(balanceToStillBeDistributed)
      })

      it("should reject if called by non owner", async () => {
        await distribute()
        await collection.connect(voter1).claim()
        await collection.connect(voter2).claim()

        await expect(collection.connect(voter1).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
      })

      it("should reject if tokens balance of contract is equal to claimable amounts by voters", async () => {
        let amount = ethers.utils.parseEther('50') // TODO: initial balance /2
        let amounts = [amount, amount]
        await distribute(amounts)

        await expect(collection.connect(sarcoDao).withdraw()).to.be.revertedWith('Withdraw unsuccessful: all tokens are claimable by voters');
      })
    })
  });