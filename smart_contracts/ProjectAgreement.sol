// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProjectAgreement
 * @dev Handles escrow, milestones, and funding for a specific R&D project.
 */
contract ProjectAgreement is Ownable, ReentrancyGuard {
    
    enum MilestoneStatus { Pending, Submitted, Approved, Rejected }

    struct Milestone {
        uint256 amount;
        uint256 deadline;
        MilestoneStatus status;
        string description; // Optional: brief description or hash
    }

    string public projectId;
    address public innovator;
    uint256 public totalFundingNeeded;
    uint256 public totalRaised;
    bool public isDisputed;

    Milestone[] public milestones;
    mapping(address => uint256) public contributions;
    address[] public funders;

    // Events
    event ProjectFunded(address indexed funder, uint256 amount);
    event MilestoneSubmitted(uint256 indexed milestoneIndex);
    event MilestoneApproved(uint256 indexed milestoneIndex, address indexed approvedBy);
    event MilestoneRejected(uint256 indexed milestoneIndex, address indexed rejectedBy);
    event FundsReleased(address indexed recipient, uint256 amount);
    event DisputeRaised(address indexed raisedBy);
    event DisputeResolved(bool fundsReleased);

    modifier onlyInnovator() {
        require(msg.sender == innovator, "Caller is not the innovator");
        _;
    }

    modifier onlyFunder() {
        require(contributions[msg.sender] > 0, "Caller is not a funder");
        _;
    }

    modifier notDisputed() {
        require(!isDisputed, "Project is currently in dispute");
        _;
    }

    /**
     * @dev Constructor is called by the ProjectFactory
     * @param _projectId Off-chain project identifier
     * @param _innovator Wallet address of the innovator
     * @param _totalFundingNeed Total amount required in Wei
     * @param _milestoneAmounts Array of milestone amounts
     * @param _milestoneDeadlines Array of milestone deadlines
     */
    constructor(
        string memory _projectId,
        address _innovator,
        uint256 _totalFundingNeed,
        uint256[] memory _milestoneAmounts,
        uint256[] memory _milestoneDeadlines
    ) Ownable(msg.sender) {
        require(_milestoneAmounts.length == _milestoneDeadlines.length, "Milestone data mismatch");
        
        projectId = _projectId;
        innovator = _innovator;
        totalFundingNeeded = _totalFundingNeed;

        uint256 sumMilestones = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            milestones.push(Milestone({
                amount: _milestoneAmounts[i],
                deadline: _milestoneDeadlines[i],
                status: MilestoneStatus.Pending,
                description: "" 
            }));
            sumMilestones += _milestoneAmounts[i];
        }
        
        // Sanity check: intended milestones should roughly match funding needed, 
        // though we allow funding > milestones (as buffer/profit) or < if partial.
        // For now, we just enforce that milestones don't exceed the requested total slightly?
        // Actually best to enforce sumMilestones <= _totalFundingNeed or exactly equal.
        // Let's rely on Factory to validation or strict check here.
        require(sumMilestones <= _totalFundingNeed, "Milestone amounts exceed total funding");
    }

    /**
     * @dev Fund function for funders to contribute to the project.
     * Funds are held in this contract address (Escrow).
     */
    function fundProject() external payable notDisputed {
        require(msg.value > 0, "Contribution must be greater than 0");
        require(totalRaised + msg.value <= totalFundingNeeded, "Funding exceeds required amount");

        if (contributions[msg.sender] == 0) {
            funders.push(msg.sender);
        }
        contributions[msg.sender] += msg.value;
        totalRaised += msg.value;

        emit ProjectFunded(msg.sender, msg.value);
    }

    /**
     * @dev Innovator submits a milestone completion proof.
     * @param _milestoneIndex Index of the milestone to submit.
     */
    function submitMilestone(uint256 _milestoneIndex) external onlyInnovator notDisputed {
        require(_milestoneIndex < milestones.length, "Invalid milestone index");
        Milestone storage m = milestones[_milestoneIndex];
        require(m.status == MilestoneStatus.Pending || m.status == MilestoneStatus.Rejected, "Milestone not pending/rejected");
        
        m.status = MilestoneStatus.Submitted;
        emit MilestoneSubmitted(_milestoneIndex);
    }

    /**
     * @dev Funder approves a milestone, releasing funds to the Innovator.
     * @param _milestoneIndex Index of the milestone to approve.
     */
    function approveMilestone(uint256 _milestoneIndex) external onlyFunder notDisputed nonReentrant {
        require(_milestoneIndex < milestones.length, "Invalid milestone index");
        Milestone storage m = milestones[_milestoneIndex];
        require(m.status == MilestoneStatus.Submitted, "Milestone not submitted");
        require(address(this).balance >= m.amount, "Insufficient escrow balance");

        m.status = MilestoneStatus.Approved;
        
        // Release funds
        (bool success, ) = innovator.call{value: m.amount}("");
        require(success, "Transfer failed");

        emit MilestoneApproved(_milestoneIndex, msg.sender);
        emit FundsReleased(innovator, m.amount);
    }

    /**
     * @dev Funder rejects a milestone.
     * @param _milestoneIndex Index of the milestone to reject.
     */
    function rejectMilestone(uint256 _milestoneIndex) external onlyFunder notDisputed {
        require(_milestoneIndex < milestones.length, "Invalid milestone index");
        Milestone storage m = milestones[_milestoneIndex];
        require(m.status == MilestoneStatus.Submitted, "Milestone not submitted");

        m.status = MilestoneStatus.Rejected;
        emit MilestoneRejected(_milestoneIndex, msg.sender);
    }

    /**
     * @dev Funder moves the project to Dispute state, freezing all funds.
     */
    function raiseDispute() external onlyFunder notDisputed {
        isDisputed = true;
        emit DisputeRaised(msg.sender);
    }

    /**
     * @dev Resolves a dispute. Can only be called by the owner (likely the Factory or Admin).
     * @param _releaseFundsToInnovator If true, releases remaining balance to Innovator. If false, returns to Funders.
     */
    function resolveDispute(bool _releaseFundsToInnovator) external onlyOwner {
        require(isDisputed, "No active dispute");

        isDisputed = false;
        uint256 balance = address(this).balance;

        if (_releaseFundsToInnovator) {
            (bool success, ) = innovator.call{value: balance}("");
            require(success, "Transfer to innovator failed");
            emit FundsReleased(innovator, balance);
        } else {
            // Refund mechanism (Simplified Pro-rata for MVP)
            // Realistically, we need to handle "PullPayments" to avoid gas limits iterating funders.
            // But for this MVP requirement, assuming low funder count, we iterate.
            // WARNING: Do not use unlimited loops in production with many funders.
            uint256 _totalRaised = totalRaised;
            for (uint256 i = 0; i < funders.length; i++) {
                address funder = funders[i];
                uint256 contributed = contributions[funder];
                if (contributed > 0) {
                     // Calculate share: (contributed / totalRaised) * balance
                     // Note: This logic assumes 'balance' is what's left. 
                     // If milestones were already paid, 'balance' is smaller than 'totalRaised'.
                     // We refund the proportional share of the *remaining* balance.
                     uint256 refundAmount = (contributed * balance) / _totalRaised;
                     (bool success, ) = funder.call{value: refundAmount}("");
                     require(success, "Refund failed"); // In prod, use PullPayment
                }
            }
        }
        
        emit DisputeResolved(_releaseFundsToInnovator);
    }

    // Fallback to receive ETH
    receive() external payable {
        revert("Use fundProject to send ETH");
    }
}
