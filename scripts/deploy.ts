import { ethers } from 'hardhat';

async function main() {
  const signers = await ethers.getSigners();

  const SarcoFactory = await ethers.getContractFactory('Sarco');
  const CollectionFactory = await ethers.getContractFactory('Collection');

  const sarco = await SarcoFactory.deploy(signers[0].address);
  await sarco.deployed();
  console.log('Sarco contract deployed to:', sarco.address);

  const collection = await CollectionFactory.deploy(sarco.address);
  await collection.deployed();
  console.log('Collection contract deployed to:', collection.address);

  //funding contract with SARCO
  const initialSarcoAmount = ethers.utils.parseEther('100');
  await sarco.connect(signers[0]).approve(collection.address, initialSarcoAmount);
  await collection.connect(signers[0]).deposit(initialSarcoAmount);
  console.log(await collection.getContractBalance());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
