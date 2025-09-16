// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract KaiaSparkFactory is Ownable, ReentrancyGuard, Pausable {
    
    // ============ STRUCTS ============
    
    struct BusinessProfile {
        address businessAddress;
        string name;
        string category;
        string location;
        address owner;
        bool isVerified;
        uint256 trustScore;
        uint256 totalVolume;
        uint256 createdAt;
        string metadataURI; // IPFS hash for business details
    }
    
    struct BusinessMetrics {
        uint256 totalTransactions;
        uint256 totalRevenue;
        uint256 activeUsers;
        uint256 nftCouponsCreated;
        uint256 loansTaken;
        uint256 lastActivity;
    }
    
    // ============ STATE VARIABLES ============
    
    // Core contracts
    IERC20 public immutable usdtToken;
    
    // Business management
    mapping(address => BusinessProfile) public businesses;
    mapping(address => BusinessMetrics) public businessMetrics;
    mapping(address => address) public businessToHub; // business owner => hub contract
    mapping(address => bool) public registeredBusinesses;
    
    // Factory state
    address[] public allBusinesses;
    uint256 public totalBusinesses;
    uint256 public totalVolume;
    
    // Fees and economics
    uint256 public registrationFee = 0.01 ether; // KAIA tokens
    uint256 public platformFee = 250; // 2.5% (250/10000)
    address public feeRecipient;
    
    // Verification system
    mapping(address => bool) public verifiers;
    uint256 public verificationThreshold = 3; // votes needed for verification
    
    // ============ EVENTS ============
    
    event BusinessRegistered(
        address indexed businessOwner,
        address indexed businessHub,
        string name,
        string category,
        uint256 timestamp
    );
    
    event BusinessVerified(
        address indexed businessOwner,
        bool verified,
        uint256 trustScore,
        uint256 timestamp
    );
    
    event BusinessMetricsUpdated(
        address indexed businessOwner,
        uint256 totalVolume,
        uint256 totalTransactions,
        uint256 timestamp
    );
    
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event RegistrationFeeUpdated(uint256 oldFee, uint256 newFee);
    
    // ============ MODIFIERS ============
    
    modifier onlyRegisteredBusiness(address businessOwner) {
        require(registeredBusinesses[businessOwner], "Business not registered");
        _;
    }
    
    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Not authorized verifier");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _usdtToken,
        address _feeRecipient
    ) {
        usdtToken = IERC20(_usdtToken);
        feeRecipient = _feeRecipient;
        
        // Add deployer as initial verifier
        verifiers[msg.sender] = true;
    }
    
    // ============ BUSINESS REGISTRATION ============
    
    /**
     * @dev Register a new business and deploy its Neural Hub
     * @param name Business name
     * @param category Business category (Food, Tech, etc.)
     * @param location Business location
     * @param metadataURI IPFS hash for business details
     */
    function registerBusiness(
        string memory name,
        string memory category,
        string memory location,
        string memory metadataURI
    ) external payable whenNotPaused nonReentrant {
        require(msg.value >= registrationFee, "Insufficient registration fee");
        require(!registeredBusinesses[msg.sender], "Business already registered");
        require(bytes(name).length > 0, "Name cannot be empty");
        
        // For now, we'll create a placeholder business address
        // In the next step, we'll create the actual BusinessNeuralHub contract
        address businessHub = address(uint160(uint256(keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            block.prevrandao
        )))));
        
        // Create business profile
        BusinessProfile memory profile = BusinessProfile({
            businessAddress: businessHub,
            name: name,
            category: category,
            location: location,
            owner: msg.sender,
            isVerified: false,
            trustScore: 0,
            totalVolume: 0,
            createdAt: block.timestamp,
            metadataURI: metadataURI
        });
        
        // Store business data
        businesses[msg.sender] = profile;
        businessToHub[msg.sender] = businessHub;
        registeredBusinesses[msg.sender] = true;
        allBusinesses.push(msg.sender);
        totalBusinesses++;
        
        // Initialize metrics
        businessMetrics[msg.sender] = BusinessMetrics({
            totalTransactions: 0,
            totalRevenue: 0,
            activeUsers: 0,
            nftCouponsCreated: 0,
            loansTaken: 0,
            lastActivity: block.timestamp
        });
        
        // Transfer registration fee to fee recipient
        if (msg.value > 0) {
            payable(feeRecipient).transfer(msg.value);
        }
        
        emit BusinessRegistered(
            msg.sender,
            businessHub,
            name,
            category,
            block.timestamp
        );
    }
    
    // ============ BUSINESS VERIFICATION ============
    
    /**
     * @dev Verify a business (only by authorized verifiers)
     * @param businessOwner Address of business owner to verify
     * @param verified Whether to verify or unverify
     */
    function verifyBusiness(
        address businessOwner,
        bool verified
    ) external onlyVerifier {
        require(registeredBusinesses[businessOwner], "Business not registered");
        
        businesses[businessOwner].isVerified = verified;
        
        // Update trust score based on verification
        if (verified) {
            businesses[businessOwner].trustScore = calculateTrustScore(businessOwner);
        } else {
            businesses[businessOwner].trustScore = 0;
        }
        
        emit BusinessVerified(
            businessOwner,
            verified,
            businesses[businessOwner].trustScore,
            block.timestamp
        );
    }
    
    // ============ METRICS MANAGEMENT ============
    
    /**
     * @dev Update business metrics (called by BusinessNeuralHub)
     * @param businessOwner Business owner address
     * @param volume Volume of transaction
     * @param isNewUser Whether this is a new user
     */
    function updateBusinessMetrics(
        address businessOwner,
        uint256 volume,
        bool isNewUser
    ) external {
        require(
            msg.sender == businessToHub[businessOwner],
            "Only business hub can update metrics"
        );
        
        BusinessMetrics storage metrics = businessMetrics[businessOwner];
        BusinessProfile storage profile = businesses[businessOwner];
        
        metrics.totalTransactions++;
        metrics.totalRevenue += volume;
        metrics.lastActivity = block.timestamp;
        
        if (isNewUser) {
            metrics.activeUsers++;
        }
        
        profile.totalVolume += volume;
        totalVolume += volume;
        
        emit BusinessMetricsUpdated(
            businessOwner,
            profile.totalVolume,
            metrics.totalTransactions,
            block.timestamp
        );
    }
    
    // ============ QUERY FUNCTIONS ============
    
    /**
     * @dev Get business profile
     * @param businessOwner Business owner address
     * @return profile Business profile data
     */
    function getBusinessProfile(address businessOwner) 
        external 
        view 
        returns (BusinessProfile memory profile) 
    {
        require(registeredBusinesses[businessOwner], "Business not registered");
        return businesses[businessOwner];
    }
    
    /**
     * @dev Get business metrics
     * @param businessOwner Business owner address
     * @return metrics Business metrics data
     */
    function getBusinessMetrics(address businessOwner) 
        external 
        view 
        returns (BusinessMetrics memory metrics) 
    {
        require(registeredBusinesses[businessOwner], "Business not registered");
        return businessMetrics[businessOwner];
    }
    
    /**
     * @dev Get all businesses with pagination
     * @param offset Starting index
     * @param limit Number of businesses to return
     * @return businessOwners Array of business owner addresses
     * @return profiles Array of business profiles
     */
    function getAllBusinesses(
        uint256 offset,
        uint256 limit
    ) external view returns (
        address[] memory businessOwners,
        BusinessProfile[] memory profiles
    ) {
        require(offset < allBusinesses.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > allBusinesses.length) {
            end = allBusinesses.length;
        }
        
        uint256 count = end - offset;
        businessOwners = new address[](count);
        profiles = new BusinessProfile[](count);
        
        for (uint256 i = 0; i < count; i++) {
            address businessOwner = allBusinesses[offset + i];
            businessOwners[i] = businessOwner;
            profiles[i] = businesses[businessOwner];
        }
    }
    
    /**
     * @dev Get businesses by category
     * @param category Business category to filter by
     * @return businessOwners Array of matching business owner addresses
     * @return profiles Array of matching business profiles
     */
    function getBusinessesByCategory(string memory category) 
        external 
        view 
        returns (
            address[] memory businessOwners,
            BusinessProfile[] memory profiles
        ) 
    {
        // Count matches first
        uint256 matchCount = 0;
        for (uint256 i = 0; i < allBusinesses.length; i++) {
            if (keccak256(bytes(businesses[allBusinesses[i]].category)) == 
                keccak256(bytes(category))) {
                matchCount++;
            }
        }
        
        // Create arrays
        businessOwners = new address[](matchCount);
        profiles = new BusinessProfile[](matchCount);
        
        uint256 index = 0;
        for (uint256 i = 0; i < allBusinesses.length; i++) {
            if (keccak256(bytes(businesses[allBusinesses[i]].category)) == 
                keccak256(bytes(category))) {
                businessOwners[index] = allBusinesses[i];
                profiles[index] = businesses[allBusinesses[i]];
                index++;
            }
        }
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Calculate trust score for a business
     * @param businessOwner Business owner address
     * @return score Trust score (0-100)
     */
    function calculateTrustScore(address businessOwner) internal view returns (uint256 score) {
        BusinessMetrics memory metrics = businessMetrics[businessOwner];
        BusinessProfile memory profile = businesses[businessOwner];
        
        // Base score from verification
        if (profile.isVerified) {
            score += 20;
        }
        
        // Volume-based score (up to 30 points)
        if (profile.totalVolume > 0) {
            score += uint256(30 * profile.totalVolume) / (profile.totalVolume + 1000 ether);
        }
        
        // Transaction count score (up to 25 points)
        if (metrics.totalTransactions > 0) {
            score += uint256(25 * metrics.totalTransactions) / (metrics.totalTransactions + 100);
        }
        
        // Active users score (up to 15 points)
        if (metrics.activeUsers > 0) {
            score += uint256(15 * metrics.activeUsers) / (metrics.activeUsers + 50);
        }
        
        // Recent activity bonus (up to 10 points)
        if (metrics.lastActivity > block.timestamp - 7 days) {
            score += 10;
        }
        
        // Cap at 100
        if (score > 100) {
            score = 100;
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Add/remove verifier
     * @param verifier Address to add/remove
     * @param isVerifier Whether to add or remove
     */
    function setVerifier(address verifier, bool isVerifier) external onlyOwner {
        verifiers[verifier] = isVerifier;
    }
    
    /**
     * @dev Update platform fee
     * @param newFee New platform fee (in basis points)
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        uint256 oldFee = platformFee;
        platformFee = newFee;
        emit PlatformFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Update registration fee
     * @param newFee New registration fee in KAIA
     */
    function setRegistrationFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = registrationFee;
        registrationFee = newFee;
        emit RegistrationFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Update fee recipient
     * @param newRecipient New fee recipient address
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid recipient");
        feeRecipient = newRecipient;
    }
    
    /**
     * @dev Pause/unpause the contract
     */
    function togglePause() external onlyOwner {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }
    }
    
    // ============ EMERGENCY FUNCTIONS ============
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
