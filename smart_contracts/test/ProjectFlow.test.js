import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("RDFunding System", function () {
    let ProjectFactory, ProjectAgreement;
    let factory, agreement;
    let owner, innovator, funder1, funder2;

    beforeEach(async function () {
        [owner, innovator, funder1, funder2] = await ethers.getSigners();

        factory = await ethers.deployContract("ProjectFactory");
        await factory.waitForDeployment();
    });

    describe("Project Creation", function () {
        it("Should allow innovator to create a project", async function () {
            const projectId = "proj_001";
            const totalFunding = ethers.parseEther("10"); // 10 ETH
            const milestoneAmounts = [ethers.parseEther("4"), ethers.parseEther("6")];
            const deadlines = [Math.floor(Date.now() / 1000) + 3600, Math.floor(Date.now() / 1000) + 7200];

            await expect(factory.connect(innovator).createProject(
                projectId,
                totalFunding,
                milestoneAmounts,
                deadlines
            )).to.emit(factory, "ProjectCreated");

            const projectAddress = await factory.getProjectAddress(projectId);
            expect(projectAddress).to.not.equal(ethers.ZeroAddress);
        });
    });

    describe("Full Project Flow", function () {
        let projectAddress;

        beforeEach(async function () {
            // Create project
            const projectId = "proj_flow";
            const totalFunding = ethers.parseEther("10");
            const milestoneAmounts = [ethers.parseEther("4"), ethers.parseEther("6")];
            const deadlines = [Math.floor(Date.now() / 1000) + 3600, Math.floor(Date.now() / 1000) + 7200];

            const tx = await factory.connect(innovator).createProject(projectId, totalFunding, milestoneAmounts, deadlines);
            await tx.wait();

            projectAddress = await factory.getProjectAddress(projectId);

            const ProjectAgreement = await ethers.getContractFactory("ProjectAgreement");
            agreement = ProjectAgreement.attach(projectAddress);
        });

        it("Should accept funds from funder", async function () {
            await agreement.connect(funder1).fundProject({ value: ethers.parseEther("5") });
            const raised = await agreement.totalRaised();
            expect(raised).to.equal(ethers.parseEther("5"));
        });

        it("Should execute milestone lifecycle: Submit -> Approve -> Release", async function () {
            // 1. Fund the project completely
            await agreement.connect(funder1).fundProject({ value: ethers.parseEther("10") });

            // 2. Innovator submits Milestone 0
            await expect(agreement.connect(innovator).submitMilestone(0))
                .to.emit(agreement, "MilestoneSubmitted")
                .withArgs(0);

            // 3. Funder approves Milestone 0
            await expect(agreement.connect(funder1).approveMilestone(0))
                .to.changeEtherBalances(
                    [agreement, innovator],
                    [-ethers.parseEther("4"), ethers.parseEther("4")]
                );
        });
    });
});
