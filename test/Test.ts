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

    beforeEach(async () => {
      const Sarco = await ethers.getContractFactory("Sarco");
      const Collection = await ethers.getContractFactory("Collection");
      [sarcoDao, tokenOwner, voter1, voter2] = await ethers.getSigners()

      // ASK SETH
      sarco = await Sarco.connect(tokenOwner).deploy(tokenOwner.address); 
      collection = await Collection.connect(sarcoDao).deploy(sarco.address);

      await sarco.connect(tokenOwner).transfer(collection.address, ethers.utils.parseEther('100'))
    });

    it("should initiate contract with a balance of 100 SARCO", async () => {
      expect(await sarco.balanceOf(collection.address)).to.equal(ethers.utils.parseEther('100'))
    })

    async function distribute() {
      let voters = [voter1.address, voter2.address]
      let amount = ethers.utils.parseEther('10')
      let amounts = [amount, amount]

      await collection.connect(sarcoDao).distribute(voters, amounts)
    }

    describe("Distribution", () => {
      it("should distribute incentives among voters", async () => {
        await distribute()

        expect(await collection.balanceOf(voter1.address)).to.equal(ethers.utils.parseEther('10').toString())
        expect(await collection.balanceOf(voter2.address)).to.equal(ethers.utils.parseEther('10').toString())
      })

      it("should revert if function not called by owner", async () => {
        let voters = [voter1.address, voter2.address]
        let amount = ethers.utils.parseEther('10')
        let amounts = [amount, amount]
  
        await expect(collection.connect(voter1).distribute(voters, amounts)).to.be.revertedWith('Ownable: caller is not the owner');
      })

      it("should have same legth arrays for voters and amounts to be distributed", async () => {
        let voters = [voter1.address, voter2.address]
        let amount = ethers.utils.parseEther('10')
        let amounts = [amount, amount, amount]
  
        await expect(collection.connect(sarcoDao).distribute(voters, amounts)).to.be.revertedWith('Arguments array length not equal');
      
        voters = [voter1.address, voter2.address, voter2.address]
        amounts = [amount, amount]
        await expect(collection.connect(sarcoDao).distribute(voters, amounts)).to.be.revertedWith('Arguments array length not equal');
      })

      it("claimable tokens by voters should be the sum of individual amounts distributed to voters", async () => {
        let amount = ethers.utils.parseEther('10')
        let amounts = [amount, amount]
        await distribute()
        let sum = BigNumber.from(0);
        for (const i in amounts) {
          console.log(amounts[i].toString())
          sum.add(amounts[i]);
        }
        console.log(sum.toString()) // ASK SETH

        expect(await collection.toBeClaimed()).to.equal(ethers.utils.parseEther('20').toString())
      })

      it("should update amount to be distributed by netting what still needs to be claimed", async () => {
        await distribute()
        await sarco.connect(tokenOwner).transfer(collection.address, ethers.utils.parseEther('100'))        
        await distribute()

        expect(await collection.toBeDistributed()).to.equal(ethers.utils.parseEther('160').toString())
      })
    })

    describe("Claim", () => {
      it("should receive SARCO", async () => {
        await distribute()
        let amount = ethers.utils.parseEther('10')
        const balanceVoter1Before = await sarco.balanceOf(voter1.address)
        const balanceVoter2Before = await sarco.balanceOf(voter2.address)
        
        await collection.connect(voter1).claim()
        await collection.connect(voter2).claim()

        expect(await sarco.balanceOf(voter1.address)).to.equal(balanceVoter1Before.add(amount))
        expect(await sarco.balanceOf(voter2.address)).to.equal(balanceVoter2Before.add(amount))
      })

      it("should set to 0 the voters balance in collection contract", async () => {
        await distribute()
        let amount = ethers.utils.parseEther('10')
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
        let voters = [voter1.address, voter2.address]
        let amount = ethers.utils.parseEther('50')
        let amounts = [amount, amount]

        await collection.connect(sarcoDao).distribute(voters, amounts)

        await expect(collection.connect(sarcoDao).withdraw()).to.be.revertedWith('Withdraw unsuccessful: all tokens are claimable by voters');
      })
    })
  });