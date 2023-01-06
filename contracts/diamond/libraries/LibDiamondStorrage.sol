//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library LibDiamondStorage {
  bytes32 internal constant DEFAULT_NAMESPACE =
    keccak256("diamond.standard.diamond.storage");

  struct DiamondStorage {
    mapping(bytes4 => mapping(bytes32 => uint8)) allowedNamespaces;
  }

  function getStorage() internal pure returns (DiamondStorage storage l) {
    bytes32 slot = DEFAULT_NAMESPACE;
    assembly {
      l.slot := slot
    }
  }

  function getStorageOf(
    bytes32 _slot
  ) internal pure returns (DiamondStorage storage l) {
    bytes32 slot = _slot;
    assembly {
      l.slot := slot
    }
  }
}
