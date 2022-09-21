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

      await sarco.transfer(collection.address, ethers.utils.parseEther('1000'), { from: tokenOwner.address })
    });

    // wrap this in a describe
    it("Should run a simple scenario", async function () {
        
      expect(await sarco.balanceOf(collection.address)).to.equal(ethers.utils.parseEther('1000'))
      const [sarcoDao, voter1, voter2, voter3] = await ethers.getSigners()

      let voters = [voter1.address, voter2.address, voter3.address]
      let amounts = [ethers.utils.parseEther('10'), ethers.utils.parseEther('10'), ethers.utils.parseEther('10')]

      await collection.connect(sarcoDao).distribute(voters, amounts)
      // onlyOwner: should reject if connect other address 
      // check if length of arrays is the same
      // check if toBeClaimed is the sum of the individual amounts
      // check if additional transfer is made to the contract if toBeDistributed is correct

      expect(await collection.balanceOf(voter1.address)).to.equal(ethers.utils.parseEther('10').toString())
      expect(await collection.balanceOf(voter2.address)).to.equal(ethers.utils.parseEther('10').toString())
      expect(await collection.balanceOf(voter3.address)).to.equal(ethers.utils.parseEther('10').toString())
      expect(await collection.toBeClaimed()).to.equal(ethers.utils.parseEther('30').toString())


      const balanceVoter1Before = await sarco.balanceOf(voter1.address)
      const balanceVoter2Before = await sarco.balanceOf(voter2.address)
      const balanceVoter3Before = await sarco.balanceOf(voter3.address)
      await collection.connect(voter1).claim()
      await collection.connect(voter2).claim()
      await collection.connect(voter3).claim()
      // claim  fail when balance is 0
      // toBeClaimed is 0
      
      expect(await sarco.balanceOf(voter1.address)).to.equal(balanceVoter1Before.add(ethers.utils.parseEther('10')))
      expect(await sarco.balanceOf(voter2.address)).to.equal(balanceVoter2Before.add(ethers.utils.parseEther('10')))
      expect(await sarco.balanceOf(voter3.address)).to.equal(balanceVoter3Before.add(ethers.utils.parseEther('10')))

      const balanceSarcoDaoBefore = await sarco.balanceOf(sarcoDao.address)
      await collection.connect(sarcoDao).withdraw()
      // onlyOwner: should reject if connect other address 
      // reject if toBeClaimed is equal to toBeDistributed
      expect(await sarco.balanceOf(sarcoDao.address)).to.equal(ethers.utils.parseEther('970').add(balanceSarcoDaoBefore))
    });

  });