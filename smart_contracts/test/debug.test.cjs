const { expect } = require("chai");
const hre = require("hardhat");
const { ethers } = hre;

describe("Debug Factory", function () {
    it("Should deploy factory", async function () {
        const ProjectFactory = await ethers.getContractFactory("ProjectFactory");
        const factory = await ProjectFactory.deploy();
        await factory.waitForDeployment();
        console.log("Factory deployed at:", factory.target);
    });
});
