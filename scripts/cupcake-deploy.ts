import { ethers } from "hardhat";
import { storeContract } from "./store-contract";

export const cupcakeTokenDecimals = 8;
export const totalSupply = ethers.utils.parseUnits(
  "1000000000",
  cupcakeTokenDecimals
);

export async function deployCupcake(): Promise<string> {
  const Cupcake = await ethers.getContractFactory("Cupcake");
  const cupcake = await Cupcake.deploy(totalSupply);
  await cupcake.deployed();
  console.log(
    `Cupcake deployed at: ${cupcake.address}`
  );

  await storeContract(
    cupcake.address,
    JSON.parse(String(cupcake.interface.format("json"))),
    "Cupcake"
  );

  return cupcake.address;
}

if (require.main === module) {
  deployCupcake()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
