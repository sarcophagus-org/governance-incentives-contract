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
      const [tokenOwner, sarcoDao, voter1, voter2, voter3] = await ethers.getSigners()
      sarco = await Sarco.deploy(tokenOwner.address);
      collection = await Collection.deploy(sarco.address);

      await Promise.all([
        await sarco.transfer(collection.address, ethers.utils.parseEther('1000'), { from: tokenOwner.address })
      ])
    });
  
    describe("test", () => {
      it("SARCO Collections contract balance", async function () {
        
        expect(await sarco.balanceOf(collection.address)).to.equal(ethers.utils.parseEther('1000'))



      });
    });
  });