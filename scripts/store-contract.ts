import { ethers } from "hardhat";
import * as fs from "fs";

export async function storeContract(
  address: string,
  abi: string | string[],
  name: string
) {
  // ----------------- MODIFIED FOR SAVING DEPLOYMENT DATA ----------------- //

  /**
   * @summary A build folder will be created in the root directory of the project
   * where the ABI, bytecode and the deployed address will be saved inside a JSON file.
   */

  let res = await ethers.provider.getNetwork();
  let network = {
    name: res.name == "unknown" ? "localhost" : res.name,
    chainId: res.chainId,
  };

  const output = {
    address,
    network,
    abi,
  };

  fs.mkdir(`./build/${network.name}/`, { recursive: true }, (err) => {
    if (err) console.error(err);
  });
  try {
    fs.writeFileSync(
      `./build/${network.name}/${name}.json`,
      JSON.stringify(output, null, 2)
    );
  } catch (error) {
    console.log(error);
  }

  // ----------------------------------------------------------------------- //
}
