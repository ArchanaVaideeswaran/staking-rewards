import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import { config as dotenv } from "dotenv";

dotenv();

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.17",
                settings: {
                    optimizer: { enabled: true, runs: 200 },
                },
            },
        ],
    },
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545/",
        },
        truffle: {
            url: "http://localhost:24012/rpc",
        },
    },
    etherscan: {
        apiKey: {
            goerli: `${process.env.ETHERSCAN_API}`,
        },
    },
};

export default config;
