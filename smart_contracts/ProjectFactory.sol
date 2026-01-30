// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ProjectAgreement.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProjectFactory
 * @dev Deploys new ProjectAgreement contracts and maintains a registry.
 */
contract ProjectFactory is Ownable {
    
    // Mapping from off-chain Project ID (string) to the deployed Contract Address
    mapping(string => address) public projectRegistry;
    
    // Array to keep track of all deployed projects
    address[] public allProjects;

    event ProjectCreated(
        string indexed projectId,
        address indexed agreementAddress,
        address indexed innovator
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Deploys a new ProjectAgreement contract.
     * @param _projectId Unique ID from the backend (e.g., Firebase ID).
     * @param _totalFundingNeeded Total funding amount in Wei.
     * @param _milestoneAmounts Array of milestone amounts.
     * @param _milestoneDeadlines Array of milestone deadlines (Unix timestamp).
     */
    function createProject(
        string memory _projectId,
        uint256 _totalFundingNeeded,
        uint256[] memory _milestoneAmounts,
        uint256[] memory _milestoneDeadlines
    ) external {
        require(projectRegistry[_projectId] == address(0), "Project ID already exists");
        
        // Deploy new ProjectAgreement
        // The factory becomes the `owner` of the Agreement (for dispute resolution privileges)
        // msg.sender is passed as the `innovator`
        ProjectAgreement newProject = new ProjectAgreement(
            _projectId,
            msg.sender, // Innovator
            _totalFundingNeeded,
            _milestoneAmounts,
            _milestoneDeadlines
        );

        address projectAddress = address(newProject);
        
        // Register the project
        projectRegistry[_projectId] = projectAddress;
        allProjects.push(projectAddress);

        emit ProjectCreated(_projectId, projectAddress, msg.sender);
    }

    /**
     * @dev Returns the contract address for a given project ID.
     */
    function getProjectAddress(string memory _projectId) external view returns (address) {
        return projectRegistry[_projectId];
    }

    /**
     * @dev Returns the total number of projects deployed.
     */
    function getProjectCount() external view returns (uint256) {
        return allProjects.length;
    }
}
