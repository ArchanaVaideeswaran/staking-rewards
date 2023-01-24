/* global ethers */

import { Contract } from "ethers";
import { FunctionFragment, ErrorFragment } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { IDiamondLoupe } from "../../typechain-types";
export const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 };

// get function selectors from ABI
export function getSelectors(contract: Contract) {
  const signatures = Object.keys(contract.interface.functions);
  const selectors = signatures.reduce((acc: any, val) => {
    if (val !== "init(bytes)") {
      acc.push(contract.interface.getSighash(val));
    }
    return acc;
  }, []);
  selectors.contract = contract;
  selectors.remove = remove;
  selectors.get = get;
  return selectors;
}

// get function selector from function signature
export function getSelector(func: string) {
  const abiInterface = new ethers.utils.Interface([func]);
  return abiInterface.getSighash(ethers.utils.Fragment.from(func));
}

// used with getSelectors to remove selectors from an array of selectors
// functionNames argument is an array of function signatures
export function remove(contract: Contract, functionNames: string[]) {
  const selectors = contract.filter((v: string) => {
    for (const functionName of functionNames) {
      if (v === contract.contract.interface.getSighash(functionName)) {
        return false;
      }
    }
    return true;
  });
  selectors.contract = contract.contract;
  selectors.remove = contract.remove;
  selectors.get = contract.get;
  return selectors;
}

// used with getSelectors to get selectors from an array of selectors
// functionNames argument is an array of function signatures
export function get(contract: Contract, functionNames: string[]) {
  const selectors = contract.filter((v: string) => {
    for (const functionName of functionNames) {
      if (v === contract.contract.interface.getSighash(functionName)) {
        return true;
      }
    }
    return false;
  });
  selectors.contract = contract.contract;
  selectors.remove = contract.remove;
  selectors.get = contract.get;
  return selectors;
}

// remove selectors using an array of signatures
export function removeSelectors(selectors: string[], signatures: string[]) {
  const iface = new ethers.utils.Interface(
    signatures.map((v: string) => "function " + v)
  );
  const removeSelectors = signatures.map(
    (v: string | FunctionFragment | ErrorFragment) => iface.getSighash(v)
  );
  selectors = selectors.filter((v: string) => !removeSelectors.includes(v));
  return selectors;
}

// find a particular address position in the return value of diamondLoupeFacet.facets()
export function findAddressPositionInFacets(
  facetAddress: string,
  facets: IDiamondLoupe.FacetStruct[]
) {
  for (let i = 0; i < facets.length; i++) {
    if (facets[i].facetAddress === facetAddress) {
      return i;
    }
  }
}
