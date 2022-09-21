import { describe } from 'mocha';
import { expect } from 'chai';
import { ethers } from 'hardhat'
import { Collection } from "../typechain-types";
import { Sarco } from "../typechain-types";

describe("Collection Contract", function () {
    let collection: Collection;
    let sarco: Sarco;
  
    beforeEach(async () => {
      const Sarco = await ethers.getContractFactory("Sarco");
      const Collection = await ethers.getContractFactory("Collection");
      const [tokenOwner] = await ethers.getSigners()
      sarco = await Sarco.deploy(tokenOwner.address);
      collection = await Collection.deploy(sarco.address);

      await Promise.all([
        await sarco.transfer(collection.address, ethers.utils.parseEther('1000'), { from: tokenOwner.address })
      ])
    });

    it("Should run a simple scenario", async function () {
        
      expect(await sarco.balanceOf(collection.address)).to.equal(ethers.utils.parseEther('1000'))
      const [voter1, voter2, voter3] = await ethers.getSigners()

      let voters = [voter1.address, voter2.address, voter3.address]
      let amounts = [ethers.utils.parseEther('10'), ethers.utils.parseEther('10'), ethers.utils.parseEther('10')]

      await collection.distribute(voters, amounts) //onlyOwner not working
      expect(await collection.balanceOf(voter1.address)).to.equal(ethers.utils.parseEther('10').toString())
      expect(await collection.balanceOf(voter2.address)).to.equal(ethers.utils.parseEther('10').toString())
      expect(await collection.balanceOf(voter3.address)).to.equal(ethers.utils.parseEther('10').toString())
      expect(await collection.toBeClaimed()).to.equal(ethers.utils.parseEther('30').toString())

      //collection.address is not a signer
      await sarco.connect(collection.address).approve(voter1.address, ethers.utils.parseEther('100'))
      console.log("claim start")
      console.log(await sarco.allowance(collection.address, voter1.address))
      // await collection.connect(voter1).claim()
      // expect(await sarco.balanceOf(voter1.address)).to.equal(ethers.utils.parseEther('10'))
      



    });





    

  });