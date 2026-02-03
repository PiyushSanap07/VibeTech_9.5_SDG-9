import hre from "hardhat";

async function main() {
    const ProjectFactory = await hre.ethers.getContractFactory("ProjectFactory");
    const factory = await ProjectFactory.deploy();

    await factory.waitForDeployment();

    console.log(`ProjectFactory deployed to ${factory.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
