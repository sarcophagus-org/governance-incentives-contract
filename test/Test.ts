import { describe } from 'mocha';
import { expect } from 'chai';
import { ethers } from 'hardhat'
import { Collection } from "../typechain-types";
import { Sarco } from "../typechain-types";

describe("Greeter", function () {
    let contract: Collection;
  
    beforeEach(async () => {
      const Sarco = await ethers.getContractFactory("Sarco");
      const Collection = await ethers.getContractFactory("Collection");
      const [deployer] = await ethers.getSigners()
      sarco = await Sarco.connect(deployer).deploy();
      contract = await Collection.connect(deployer).deploy();
    });
  
    describe("deploy", () => {
      it("should set owner", async function () {
        const [deployer] = await ethers.getSigners()
        expect(await contract.owner()).to.equal(deployer.address)
  
      });
    });
  });