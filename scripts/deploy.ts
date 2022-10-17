import { ethers } from 'hardhat';

async function main() {
  //   const Greeter = await ethers.getContractFactory('Greeter');
  //   const greeter = await Greeter.deploy('Hello, Hardhat!');

  //   await greeter.deployed();

  //   console.log('Greeter deployed to:', greeter.address);

  const signers = await ethers.getSigners();

  const SarcoFactory = await ethers.getContractFactory('Sarco');
  const CollectionFactory = await ethers.getContractFactory('Collection');

  const sarco = await SarcoFactory.deploy(signers[0].address);
  await sarco.deployed();
  console.log('Sarco contract deployed to:', sarco.address);

  const collection = await CollectionFactory.deploy(sarco.address);
  await collection.deployed();
  console.log('Collection contract deployed to:', collection.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
