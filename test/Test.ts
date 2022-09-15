import { describe } from 'mocha';
import { expect } from 'chai';
import { ethers } from 'hardhat'
import { Collection } from "../typechain-types";

describe("Greeter", function () {
    let contract: Collection;
  
    beforeEach(async () => {
      const Collection = await ethers.getContractFactory("Collection");
      const [deployer] = await ethers.getSigners()
      const contract = await Collection.connect(deployer).deploy();
      
    });
  
    describe("deploy", () => {
      it("should set owner", async function () {
        const collection = await contract.deployed();
        const [deployer] = await ethers.getSigners()
        expect(await collection.owner()).to.equal(deployer.address)
  
      });
    });
  });