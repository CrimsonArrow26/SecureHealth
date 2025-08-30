// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title HealthRecordRegistry
 * @dev Production-ready smart contract for managing health record access and audit trails
 * @custom:security-contact security@yourcompany.com
 */
contract HealthRecordRegistry is Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;

    // ===== EVENTS =====
    event RecordCommitted(address indexed owner, bytes32 indexed recordHash, uint256 indexed committedAt);
    event AccessGranted(address indexed owner, address indexed grantee, bytes32 indexed recordHash, uint64 expiry);
    event AccessRevoked(address indexed owner, address indexed grantee, bytes32 indexed recordHash);
    event RecordViewed(address indexed viewer, address indexed owner, bytes32 indexed recordHash, uint256 timestamp, string viewerType);
    event RecordDownloaded(address indexed downloader, address indexed owner, bytes32 indexed recordHash, uint256 timestamp, string downloaderType);
    event PermissionChanged(address indexed owner, address indexed grantee, bytes32 indexed recordHash, string action, uint256 timestamp);
    event AuditLogCreated(bytes32 indexed auditId, address indexed actor, string action, bytes32 indexed recordHash, uint256 timestamp);
    event EmergencyPaused(address indexed pauser, uint256 timestamp);
    event EmergencyUnpaused(address indexed unpauser, uint256 timestamp);

    // ===== STRUCTS =====
    struct AuditEntry {
        bytes32 auditId;
        address actor;
        string action;
        bytes32 recordHash;
        uint256 timestamp;
        string metadata;
    }

    struct AccessControl {
        uint64 expiry;
        uint256 grantedAt;
        bool isActive;
    }

    // ===== STATE VARIABLES =====
    Counters.Counter private _auditCounter;
    
    // owner => recordHash => exists
    mapping(address => mapping(bytes32 => bool)) private _recordExists;
    
    // owner => recordHash => grantee => access control
    mapping(address => mapping(bytes32 => mapping(address => AccessControl))) private _accessControls;
    
    // Audit trail storage with pagination
    mapping(bytes32 => AuditEntry[]) private _auditTrail;
    
    // Rate limiting for audit events
    mapping(address => uint256) private _lastAuditEvent;
    
    // ===== CONSTANTS =====
    uint256 public constant MAX_AUDIT_ENTRIES_PER_RECORD = 1000;
    uint256 public constant MIN_AUDIT_INTERVAL = 1 seconds;
    uint256 public constant MAX_METADATA_LENGTH = 1000;
    uint256 public constant MAX_VIEWER_TYPE_LENGTH = 100;

    // ===== MODIFIERS =====
    modifier onlyRecordOwner(bytes32 recordHash) {
        require(_recordExists[msg.sender][recordHash], "HealthRecordRegistry: record not found");
        _;
    }

    modifier onlyWithAccess(address owner, bytes32 recordHash) {
        require(_hasValidAccess(owner, recordHash, msg.sender), "HealthRecordRegistry: access denied");
        _;
    }

    modifier validRecordHash(bytes32 recordHash) {
        require(recordHash != bytes32(0), "HealthRecordRegistry: invalid record hash");
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0), "HealthRecordRegistry: invalid address");
        _;
    }

    modifier rateLimited() {
        require(block.timestamp >= _lastAuditEvent[msg.sender] + MIN_AUDIT_INTERVAL, "HealthRecordRegistry: rate limited");
        _lastAuditEvent[msg.sender] = block.timestamp;
        _;
    }

    // ===== CONSTRUCTOR =====
    constructor() Ownable(msg.sender) {
        // Initialize with security settings
    }

    // ===== CORE FUNCTIONS =====
    
    /**
     * @dev Commit a new health record hash to the blockchain
     * @param recordHash The hash of the health record
     */
    function commitRecord(bytes32 recordHash) 
        external 
        whenNotPaused 
        nonReentrant 
        validRecordHash(recordHash) 
    {
        require(!_recordExists[msg.sender][recordHash], "HealthRecordRegistry: record already exists");
        
        _recordExists[msg.sender][recordHash] = true;
        emit RecordCommitted(msg.sender, recordHash, block.timestamp);
        
        _createAuditEntry(msg.sender, "RECORD_COMMITTED", recordHash, "Record committed to blockchain");
    }

    /**
     * @dev Grant access to a specific record for a grantee
     * @param grantee The address to grant access to
     * @param recordHash The hash of the record
     * @param expiry Unix timestamp when access expires (0 for no expiry)
     */
    function grantAccess(address grantee, bytes32 recordHash, uint64 expiry) 
        external 
        whenNotPaused 
        nonReentrant 
        onlyRecordOwner(recordHash) 
        validAddress(grantee) 
    {
        require(grantee != msg.sender, "HealthRecordRegistry: cannot grant access to self");
        
        _accessControls[msg.sender][recordHash][grantee] = AccessControl({
            expiry: expiry,
            grantedAt: block.timestamp,
            isActive: true
        });
        
        emit AccessGranted(msg.sender, grantee, recordHash, expiry);
        _createAuditEntry(msg.sender, "ACCESS_GRANTED", recordHash, 
            string(abi.encodePacked("Access granted to ", _addressToString(grantee), " until ", _uint64ToString(expiry))));
    }

    /**
     * @dev Revoke access for a specific grantee
     * @param grantee The address to revoke access from
     * @param recordHash The hash of the record
     */
    function revokeAccess(address grantee, bytes32 recordHash) 
        external 
        whenNotPaused 
        nonReentrant 
        onlyRecordOwner(recordHash) 
        validAddress(grantee) 
    {
        require(_accessControls[msg.sender][recordHash][grantee].isActive, "HealthRecordRegistry: access not granted");
        
        delete _accessControls[msg.sender][recordHash][grantee];
        
        emit AccessRevoked(msg.sender, grantee, recordHash);
        _createAuditEntry(msg.sender, "ACCESS_REVOKED", recordHash, 
            string(abi.encodePacked("Access revoked from ", _addressToString(grantee))));
    }

    /**
     * @dev Record a view event for audit purposes
     * @param owner The owner of the record
     * @param recordHash The hash of the record
     * @param viewerType The type of viewer (e.g., "Physician", "Hospital")
     */
    function recordView(address owner, bytes32 recordHash, string memory viewerType) 
        external 
        whenNotPaused 
        nonReentrant 
        onlyWithAccess(owner, recordHash) 
        rateLimited 
    {
        require(bytes(viewerType).length <= MAX_VIEWER_TYPE_LENGTH, "HealthRecordRegistry: viewer type too long");
        
        emit RecordViewed(msg.sender, owner, recordHash, block.timestamp, viewerType);
        _createAuditEntry(msg.sender, "RECORD_VIEWED", recordHash, 
            string(abi.encodePacked("Viewed by ", viewerType)));
    }

    /**
     * @dev Record a download event for audit purposes
     * @param owner The owner of the record
     * @param recordHash The hash of the record
     * @param downloaderType The type of downloader
     */
    function recordDownload(address owner, bytes32 recordHash, string memory downloaderType) 
        external 
        whenNotPaused 
        nonReentrant 
        onlyWithAccess(owner, recordHash) 
        rateLimited 
    {
        require(bytes(downloaderType).length <= MAX_VIEWER_TYPE_LENGTH, "HealthRecordRegistry: downloader type too long");
        
        emit RecordDownloaded(msg.sender, owner, recordHash, block.timestamp, downloaderType);
        _createAuditEntry(msg.sender, "RECORD_DOWNLOADED", recordHash, 
            string(abi.encodePacked("Downloaded by ", downloaderType)));
    }

    // ===== VIEW FUNCTIONS =====
    
    /**
     * @dev Check if a record exists for an owner
     * @param owner The owner address
     * @param recordHash The record hash
     * @return True if record exists
     */
    function hasRecord(address owner, bytes32 recordHash) external view returns (bool) {
        return _recordExists[owner][recordHash];
    }

    /**
     * @dev Get access information for a grantee
     * @param owner The owner address
     * @param grantee The grantee address
     * @param recordHash The record hash
     * @return hasAccess Whether access is granted
     * @return expiry When access expires
     */
    function accessInfo(address owner, address grantee, bytes32 recordHash) 
        external 
        view 
        returns (bool hasAccess, uint64 expiry) 
    {
        AccessControl storage control = _accessControls[owner][recordHash][grantee];
        if (!control.isActive) return (false, 0);
        
        if (control.expiry > 0 && control.expiry < block.timestamp) {
            return (false, control.expiry);
        }
        
        return (true, control.expiry);
    }

    /**
     * @dev Get audit trail for a specific record
     * @param recordHash The record hash
     * @return Array of audit entries
     */
    function getAuditTrail(bytes32 recordHash) external view returns (AuditEntry[] memory) {
        return _auditTrail[recordHash];
    }

    /**
     * @dev Get paginated audit trail for a record
     * @param recordHash The record hash
     * @param page The page number (0-based)
     * @param pageSize The size of each page
     * @return Array of audit entries for the page
     */
    function getAuditTrailPaginated(bytes32 recordHash, uint256 page, uint256 pageSize) 
        external 
        view 
        returns (AuditEntry[] memory) 
    {
        require(pageSize <= 100, "HealthRecordRegistry: page size too large");
        
        AuditEntry[] storage allEntries = _auditTrail[recordHash];
        uint256 start = page * pageSize;
        
        if (start >= allEntries.length) {
            return new AuditEntry[](0);
        }
        
        uint256 end = start + pageSize;
        if (end > allEntries.length) {
            end = allEntries.length;
        }
        
        uint256 resultSize = end - start;
        AuditEntry[] memory result = new AuditEntry[](resultSize);
        
        for (uint256 i = 0; i < resultSize; i++) {
            result[i] = allEntries[start + i];
        }
        
        return result;
    }

    /**
     * @dev Get total count of audit entries for a record
     * @param recordHash The record hash
     * @return Total count of audit entries
     */
    function getAuditTrailCount(bytes32 recordHash) external view returns (uint256) {
        return _auditTrail[recordHash].length;
    }

    // ===== ADMIN FUNCTIONS =====
    
    /**
     * @dev Emergency pause function (only owner)
     */
    function emergencyPause() external onlyOwner {
        _pause();
        emit EmergencyPaused(msg.sender, block.timestamp);
    }

    /**
     * @dev Emergency unpause function (only owner)
     */
    function emergencyUnpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpaused(msg.sender, block.timestamp);
    }

    /**
     * @dev Clean up old audit entries to save gas (only owner)
     * @param recordHash The record hash
     * @param entriesToKeep Number of recent entries to keep
     */
    function cleanupOldAuditEntries(bytes32 recordHash, uint256 entriesToKeep) external onlyOwner {
        require(entriesToKeep <= MAX_AUDIT_ENTRIES_PER_RECORD, "HealthRecordRegistry: entries to keep too high");
        
        AuditEntry[] storage entries = _auditTrail[recordHash];
        if (entries.length <= entriesToKeep) return;
        
        uint256 entriesToRemove = entries.length - entriesToKeep;
        
        for (uint256 i = 0; i < entriesToRemove; i++) {
            entries.pop();
        }
    }

    // ===== INTERNAL FUNCTIONS =====
    
    function _hasValidAccess(address owner, bytes32 recordHash, address grantee) internal view returns (bool) {
        AccessControl storage control = _accessControls[owner][recordHash][grantee];
        if (!control.isActive) return false;
        
        if (control.expiry > 0 && control.expiry < block.timestamp) return false;
        
        return true;
    }

    function _createAuditEntry(address actor, string memory action, bytes32 recordHash, string memory metadata) internal {
        require(bytes(metadata).length <= MAX_METADATA_LENGTH, "HealthRecordRegistry: metadata too long");
        
        _auditCounter.increment();
        bytes32 auditId = keccak256(abi.encodePacked(
            actor, 
            action, 
            recordHash, 
            block.timestamp, 
            block.number,
            _auditCounter.current()
        ));
        
        AuditEntry memory entry = AuditEntry({
            auditId: auditId,
            actor: actor,
            action: action,
            recordHash: recordHash,
            timestamp: block.timestamp,
            metadata: metadata
        });
        
        _auditTrail[recordHash].push(entry);
        
        // Prevent unlimited growth
        if (_auditTrail[recordHash].length > MAX_AUDIT_ENTRIES_PER_RECORD) {
            _auditTrail[recordHash][0] = _auditTrail[recordHash][_auditTrail[recordHash].length - 1];
            _auditTrail[recordHash].pop();
        }
        
        emit AuditLogCreated(auditId, actor, action, recordHash, block.timestamp);
    }

    function _addressToString(address addr) internal pure returns (string memory) {
        return string(abi.encodePacked(addr));
    }

    function _uint64ToString(uint64 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }

    // ===== RECEIVE FUNCTION =====
    receive() external payable {
        revert("HealthRecordRegistry: contract does not accept ETH");
    }

    // ===== FALLBACK FUNCTION =====
    fallback() external payable {
        revert("HealthRecordRegistry: function not found");
    }
}
