import "@nomicfoundation/hardhat-toolbox";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    solidity: "0.8.19",
    paths: {
        sources: "./smart_contracts",
        tests: "./smart_contracts/test",
        cache: "./smart_contracts/cache",
        artifacts: "./smart_contracts/artifacts"
    },
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545"
        }
    }
};
