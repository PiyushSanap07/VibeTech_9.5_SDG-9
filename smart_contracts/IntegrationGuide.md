# Smart Contract Integration Guide

## 1. System Overview

The system consists of two main contracts:
- **ProjectFactory**: The entry point. Used to create new project agreements and find existing ones.
- **ProjectAgreement**: The contract for a specific project. Handles funding, milestones, and disputes.

## 2. ABI & Addresses
*After deployment, you will need:*
1.  **Factory Address**: The address where `ProjectFactory` is deployed.
2.  **Factory ABI**: JSON interface for `ProjectFactory`.
3.  **Agreement ABI**: JSON interface for `ProjectAgreement`.

## 3. Workflow Examples (Ethers.js / Web3.js)

### A. Deploying a New Project (Innovator)
**Goal**: Create a new on-chain project linked to a Firebase ID.

```javascript
// 1. Connect to Factory
const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, innovatorSigner);

// 2. Call createProject
// Params: projectId (string), totalFunding (Wei), milestoneAmounts (Wei[]), deadlines (Unix timestamp[])
const tx = await factory.createProject(
  "firebase_project_123", 
  ethers.utils.parseEther("10"), 
  [ethers.utils.parseEther("2"), ethers.utils.parseEther("8")],
  [1735689600, 1740000000] // Example timestamps
);
await tx.wait();

// 3. Listen for event to get the new Agreement Address
// Event: ProjectCreated(string projectId, address agreementAddress, address innovator)
```

### B. Funding a Project (Funder)
**Goal**: Contribute ETH to a project.

```javascript
// 1. Get Project Address (from your DB or Factory)
const projectAddress = await factory.getProjectAddress("firebase_project_123");

// 2. Connect to Agreement Contract
const agreement = new ethers.Contract(projectAddress, AGREEMENT_ABI, funderSigner);

// 3. Fund
const tx = await agreement.fundProject({
  value: ethers.utils.parseEther("1.0")
});
await tx.wait();
```

### C. Submitting a Milestone (Innovator)
**Goal**: Mark a milestone as complete.

```javascript
// 1. Connect as Innovator
const agreement = new ethers.Contract(projectAddress, AGREEMENT_ABI, innovatorSigner);

// 2. Submit Milestone (Index 0)
const tx = await agreement.submitMilestone(0);
await tx.wait();
```

### D. Approving a Milestone (Funder)
**Goal**: Approve work and release funds.

```javascript
// 1. Connect as Funder
const agreement = new ethers.Contract(projectAddress, AGREEMENT_ABI, funderSigner);

// 2. Approve Milestone (Index 0)
// WARNING: This will transfer ETH. Ensure contract has funds.
const tx = await agreement.approveMilestone(0);
await tx.wait();
```

### E. Raising a Dispute (Funder)
**Goal**: Freeze funds if something goes wrong.

```javascript
const tx = await agreement.raiseDispute();
await tx.wait();
```

## 4. Events to Watch

Sync your database by listening to these events:

- `ProjectFactory`: `ProjectCreated`
- `ProjectAgreement`: 
    - `ProjectFunded(funder, amount)`
    - `MilestoneSubmitted(index)`
    - `MilestoneApproved(index, approver)` -> **Update Milestone status in DB**
    - `FundsReleased(recipient, amount)`
    - `DisputeRaised(raiser)` -> **Pause Project in DB**

## 5. Deployment Commands (Hardhat)

```bash
npx hardhat run scripts/deploy.js --network localhost
```
