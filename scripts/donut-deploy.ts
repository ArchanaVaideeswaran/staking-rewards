import { ethers } from "hardhat";
import { storeContract } from "./store-contract";

export const donutTokenDecimals = 12;
export const initialSupply = ethers.utils.parseUnits(
  "1000000",
  donutTokenDecimals
);

export async function deployDonut(): Promise<string> {
  const Donut = await ethers.getContractFactory("Donut");
  const donut = await Donut.deploy(initialSupply);
  await donut.deployed();
  console.log(
    `Donut deployed at: ${donut.address}`
  );

  await storeContract(
    donut.address,
    JSON.parse(String(donut.interface.format("json"))),
    "Donut"
  );

  return donut.address;
}

if (require.main === module) {
  deployDonut()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}