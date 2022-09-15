const { expect } = require("chai");

describe('Collection', function(){
  beforeEach(async function(){
      [signer] = await ethers.getSigners();  

      Collection = await ethers.getContractFactory('Collection', signer);

      collection = await Collection.deploy()
  })

  describe('deploy', function() {
      it('should set owner', async function() {
          expect(await collection.owner()).to.equal(signer.address)
      })
  });
})
