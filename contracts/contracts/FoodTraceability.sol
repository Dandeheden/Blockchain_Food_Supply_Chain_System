// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FoodTraceability
 * @dev Smart contract for tracking food products through the supply chain.
 * Records are immutable once written. Corrections must be new entries.
 */
contract FoodTraceability {
    // ─── Roles ─────────────────────────────────────────────────────────────────
    enum Role { None, Farmer, Processor, Distributor, Retailer, Admin }

    // ─── Structs ────────────────────────────────────────────────────────────────
    struct Batch {
        string  batchId;
        address owner;
        bytes32 dataHash;   // keccak256 hash of full JSON stored off-chain
        bool    spoiled;
        uint256 createdAt;
        bool    exists;
    }

    struct StageRecord {
        string  stage;       // "Farmer", "Processor", "Distributor", "Retailer"
        address participant;
        uint256 timestamp;
        string  location;
        string  condition;   // "Good", "Warning", "Spoiled"
        int256  temperature; // in tenths of a degree Celsius (e.g., 225 = 22.5°C)
        bytes32 dataHash;
        string  notes;
    }

    // ─── State ──────────────────────────────────────────────────────────────────
    address public admin;
    mapping(address => Role) public roles;
    mapping(string  => Batch) private batches;
    mapping(string  => StageRecord[]) private stageHistory;
    string[] public batchIds; // for enumeration

    // ─── Events ─────────────────────────────────────────────────────────────────
    event ParticipantRegistered(address indexed participant, Role role);
    event BatchRegistered(string indexed batchId, address indexed farmer, bytes32 dataHash);
    event StageUpdated(string indexed batchId, string stage, address indexed participant, bytes32 dataHash);
    event SpoilageReported(string indexed batchId, string stage, address indexed reporter);

    // ─── Modifiers ──────────────────────────────────────────────────────────────
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyAuthorized() {
        require(roles[msg.sender] != Role.None, "Not authorized");
        _;
    }

    modifier batchExists(string calldata batchId) {
        require(batches[batchId].exists, "Batch not found");
        _;
    }

    // ─── Constructor ────────────────────────────────────────────────────────────
    constructor() {
        admin = msg.sender;
        roles[msg.sender] = Role.Admin;
    }

    // ─── Admin Functions ─────────────────────────────────────────────────────────
    function registerParticipant(address participant, Role role) external onlyAdmin {
        require(role != Role.None, "Invalid role");
        roles[participant] = role;
        emit ParticipantRegistered(participant, role);
    }

    function removeParticipant(address participant) external onlyAdmin {
        roles[participant] = Role.None;
    }

    // ─── Batch Functions ─────────────────────────────────────────────────────────
    function registerBatch(
        string calldata batchId,
        bytes32 dataHash
    ) external onlyAuthorized {
        require(!batches[batchId].exists, "Batch already registered");
        require(roles[msg.sender] == Role.Farmer || roles[msg.sender] == Role.Admin, "Only farmers can register batches");

        batches[batchId] = Batch({
            batchId:   batchId,
            owner:     msg.sender,
            dataHash:  dataHash,
            spoiled:   false,
            createdAt: block.timestamp,
            exists:    true
        });
        batchIds.push(batchId);

        // Record initial stage
        stageHistory[batchId].push(StageRecord({
            stage:       "Farmer",
            participant: msg.sender,
            timestamp:   block.timestamp,
            location:    "",
            condition:   "Good",
            temperature: 0,
            dataHash:    dataHash,
            notes:       "Batch registered"
        }));

        emit BatchRegistered(batchId, msg.sender, dataHash);
    }

    function updateStage(
        string calldata batchId,
        string calldata stage,
        string calldata location,
        string calldata condition,
        int256          temperature,
        bytes32         dataHash,
        string calldata notes
    ) external onlyAuthorized batchExists(batchId) {
        require(!batches[batchId].spoiled, "Cannot update a spoiled batch");

        stageHistory[batchId].push(StageRecord({
            stage:       stage,
            participant: msg.sender,
            timestamp:   block.timestamp,
            location:    location,
            condition:   condition,
            temperature: temperature,
            dataHash:    dataHash,
            notes:       notes
        }));

        emit StageUpdated(batchId, stage, msg.sender, dataHash);
    }

    function reportSpoilage(
        string calldata batchId,
        string calldata stage,
        string calldata notes
    ) external onlyAuthorized batchExists(batchId) {
        batches[batchId].spoiled = true;

        stageHistory[batchId].push(StageRecord({
            stage:       stage,
            participant: msg.sender,
            timestamp:   block.timestamp,
            location:    "",
            condition:   "Spoiled",
            temperature: 0,
            dataHash:    bytes32(0),
            notes:       notes
        }));

        emit SpoilageReported(batchId, stage, msg.sender);
    }

    // ─── View Functions ───────────────────────────────────────────────────────────
    function getBatch(string calldata batchId) external view batchExists(batchId)
        returns (Batch memory)
    {
        return batches[batchId];
    }

    function getStageHistory(string calldata batchId) external view batchExists(batchId)
        returns (StageRecord[] memory)
    {
        return stageHistory[batchId];
    }

    function getBatchCount() external view returns (uint256) {
        return batchIds.length;
    }

    function getParticipantRole(address participant) external view returns (Role) {
        return roles[participant];
    }
}
