// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract TrustMatrixScorer is Ownable, ReentrancyGuard, Pausable {
    
    // ============ STRUCTS ============
    
    struct TrustProfile {
        address user;
        uint256 trustScore;
        uint256 socialInteractions;
        uint256 successfulTransactions;
        uint256 failedTransactions;
        uint256 referralsGiven;
        uint256 referralsReceived;
        uint256 lastActivity;
        uint256 createdAt;
        bool isVerified;
        string metadataURI; // IPFS hash for social proof
    }
    
    struct SocialInteraction {
        address from;
        address to;
        uint256 interactionType; // 1=payment, 2=referral, 3=review, 4=verification
        uint256 value; // Amount or rating
        uint256 timestamp;
        string description;
        bool isPositive;
    }
    
    struct TrustMetrics {
        uint256 totalUsers;
        uint256 verifiedUsers;
        uint256 totalInteractions;
        uint256 averageTrustScore;
        uint256 totalValueTransacted;
    }
    
    // ============ STATE VARIABLES ============
    
    // User trust profiles
    mapping(address => TrustProfile) public trustProfiles;
    mapping(address => bool) public registeredUsers;
    address[] public allUsers;
    
    // Social interactions
    mapping(address => SocialInteraction[]) public userInteractions;
    mapping(address => mapping(address => uint256)) public userToUserInteractions;
    mapping(bytes32 => bool) public interactionHashes; // Prevent duplicate interactions
    
    // Trust scoring parameters
    uint256 public baseTrustScore = 50; // Starting trust score
    uint256 public maxTrustScore = 100;
    uint256 public minTrustScore = 0;
    
    // Scoring weights
    uint256 public paymentWeight = 30; // 30% weight for successful payments
    uint256 public socialWeight = 25;  // 25% weight for social interactions
    uint256 public referralWeight = 20; // 20% weight for referrals
    uint256 public verificationWeight = 15; // 15% weight for verification
    uint256 public activityWeight = 10; // 10% weight for recent activity
    
    // Trust thresholds
    uint256 public highTrustThreshold = 80;
    uint256 public mediumTrustThreshold = 60;
    uint256 public lowTrustThreshold = 40;
    
    // Verification system
    mapping(address => bool) public verifiers;
    mapping(address => uint256) public verificationVotes;
    mapping(address => mapping(address => bool)) public hasVoted;
    uint256 public verificationThreshold = 3;
    
    // Trust metrics
    TrustMetrics public trustMetrics;
    
    // ============ EVENTS ============
    
    event UserRegistered(
        address indexed user,
        uint256 trustScore,
        uint256 timestamp
    );
    
    event SocialInteractionRecorded(
        address indexed from,
        address indexed to,
        uint256 interactionType,
        uint256 value,
        bool isPositive,
        uint256 timestamp
    );
    
    event TrustScoreUpdated(
        address indexed user,
        uint256 oldScore,
        uint256 newScore,
        uint256 timestamp
    );
    
    event UserVerified(
        address indexed user,
        bool verified,
        uint256 trustScore,
        uint256 timestamp
    );
    
    event TrustMetricsUpdated(
        uint256 totalUsers,
        uint256 verifiedUsers,
        uint256 averageTrustScore,
        uint256 timestamp
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyRegisteredUser(address user) {
        require(registeredUsers[user], "User not registered");
        _;
    }
    
    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Not authorized verifier");
        _;
    }
    
    modifier onlyValidInteraction(
        address from,
        address to,
        uint256 interactionType,
        uint256 value
    ) {
        require(from != address(0) && to != address(0), "Invalid addresses");
        require(from != to, "Cannot interact with self");
        require(interactionType >= 1 && interactionType <= 4, "Invalid interaction type");
        require(value > 0, "Value must be greater than 0");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() {
        // Add deployer as initial verifier
        verifiers[msg.sender] = true;
        
        // Initialize trust metrics
        trustMetrics = TrustMetrics({
            totalUsers: 0,
            verifiedUsers: 0,
            totalInteractions: 0,
            averageTrustScore: 0,
            totalValueTransacted: 0
        });
    }
    
    // ============ USER REGISTRATION ============
    
    /**
     * @dev Register a new user in the trust system
     * @param metadataURI IPFS hash for user's social proof
     */
    function registerUser(string memory metadataURI) external whenNotPaused {
        require(!registeredUsers[msg.sender], "User already registered");
        require(bytes(metadataURI).length > 0, "Metadata URI cannot be empty");
        
        // Create trust profile
        trustProfiles[msg.sender] = TrustProfile({
            user: msg.sender,
            trustScore: baseTrustScore,
            socialInteractions: 0,
            successfulTransactions: 0,
            failedTransactions: 0,
            referralsGiven: 0,
            referralsReceived: 0,
            lastActivity: block.timestamp,
            createdAt: block.timestamp,
            isVerified: false,
            metadataURI: metadataURI
        });
        
        registeredUsers[msg.sender] = true;
        allUsers.push(msg.sender);
        trustMetrics.totalUsers++;
        
        _updateTrustMetrics();
        
        emit UserRegistered(msg.sender, baseTrustScore, block.timestamp);
    }
    
    // ============ SOCIAL INTERACTION RECORDING ============
    
    /**
     * @dev Record a social interaction between users
     * @param from User initiating the interaction
     * @param to User receiving the interaction
     * @param interactionType Type of interaction (1=payment, 2=referral, 3=review, 4=verification)
     * @param value Amount or rating value
     * @param description Description of the interaction
     * @param isPositive Whether the interaction is positive or negative
     */
    function recordSocialInteraction(
        address from,
        address to,
        uint256 interactionType,
        uint256 value,
        string memory description,
        bool isPositive
    ) external onlyValidInteraction(from, to, interactionType, value) whenNotPaused nonReentrant {
        require(registeredUsers[from] && registeredUsers[to], "Users must be registered");
        
        // Create interaction hash to prevent duplicates
        bytes32 interactionHash = keccak256(abi.encodePacked(
            from,
            to,
            interactionType,
            value,
            keccak256(bytes(description))
        ));
        require(!interactionHashes[interactionHash], "Duplicate interaction");
        interactionHashes[interactionHash] = true;
        
        // Create social interaction
        SocialInteraction memory interaction = SocialInteraction({
            from: from,
            to: to,
            interactionType: interactionType,
            value: value,
            timestamp: block.timestamp,
            description: description,
            isPositive: isPositive
        });
        
        // Record interaction
        userInteractions[from].push(interaction);
        userToUserInteractions[from][to]++;
        
        // Update user profiles
        _updateUserProfile(from, interactionType, value, isPositive, true);
        _updateUserProfile(to, interactionType, value, isPositive, false);
        
        // Update trust scores
        _updateTrustScore(from);
        _updateTrustScore(to);
        
        // Update metrics
        trustMetrics.totalInteractions++;
        trustMetrics.totalValueTransacted += value;
        _updateTrustMetrics();
        
        emit SocialInteractionRecorded(
            from,
            to,
            interactionType,
            value,
            isPositive,
            block.timestamp
        );
    }
    
    // ============ TRUST SCORE CALCULATION ============
    
    /**
     * @dev Calculate trust score for a user
     * @param user User address
     * @return score Calculated trust score
     */
    function calculateTrustScore(address user) 
        external 
        view 
        onlyRegisteredUser(user) 
        returns (uint256 score) 
    {
        return _calculateTrustScore(user);
    }
    
    /**
     * @dev Get user's trust level
     * @param user User address
     * @return level Trust level (1=low, 2=medium, 3=high)
     */
    function getTrustLevel(address user) 
        external 
        view 
        onlyRegisteredUser(user) 
        returns (uint256 level) 
    {
        uint256 score = _calculateTrustScore(user);
        
        if (score >= highTrustThreshold) {
            return 3; // High trust
        } else if (score >= mediumTrustThreshold) {
            return 2; // Medium trust
        } else {
            return 1; // Low trust
        }
    }
    
    // ============ VERIFICATION SYSTEM ============
    
    /**
     * @dev Vote to verify a user
     * @param user User to verify
     * @param verified Whether to verify or unverify
     */
    function voteForVerification(address user, bool verified) external onlyVerifier {
        require(registeredUsers[user], "User not registered");
        require(!hasVoted[msg.sender][user], "Already voted for this user");
        
        hasVoted[msg.sender][user] = true;
        
        if (verified) {
            verificationVotes[user]++;
        } else {
            verificationVotes[user]--;
        }
        
        // Check if verification threshold is met
        bool shouldBeVerified = verificationVotes[user] >= verificationThreshold;
        bool currentlyVerified = trustProfiles[user].isVerified;
        
        if (shouldBeVerified && !currentlyVerified) {
            trustProfiles[user].isVerified = true;
            trustMetrics.verifiedUsers++;
            _updateTrustScore(user);
        } else if (!shouldBeVerified && currentlyVerified) {
            trustProfiles[user].isVerified = false;
            trustMetrics.verifiedUsers--;
            _updateTrustScore(user);
        }
        
        emit UserVerified(user, shouldBeVerified, _calculateTrustScore(user), block.timestamp);
    }
    
    // ============ QUERY FUNCTIONS ============
    
    /**
     * @dev Get user's trust profile
     * @param user User address
     * @return profile Trust profile data
     */
    function getTrustProfile(address user) 
        external 
        view 
        onlyRegisteredUser(user) 
        returns (TrustProfile memory profile) 
    {
        return trustProfiles[user];
    }
    
    /**
     * @dev Get user's social interactions
     * @param user User address
     * @return interactions Array of social interactions
     */
    function getUserInteractions(address user) 
        external 
        view 
        onlyRegisteredUser(user) 
        returns (SocialInteraction[] memory interactions) 
    {
        return userInteractions[user];
    }
    
    /**
     * @dev Get trust metrics
     * @return metrics Trust metrics data
     */
    function getTrustMetrics() external view returns (TrustMetrics memory metrics) {
        return trustMetrics;
    }
    
    /**
     * @dev Get total number of registered users
     * @return count Total user count
     */
    function getUserCount() external view returns (uint256 count) {
        return allUsers.length;
    }
    
    /**
     * @dev Get users by trust level
     * @param level Trust level (1=low, 2=medium, 3=high)
     * @return users Array of user addresses
     * @return profiles Array of trust profiles
     */
    function getUsersByTrustLevel(uint256 level) 
        external 
        view 
        returns (address[] memory users, TrustProfile[] memory profiles) 
    {
        require(level >= 1 && level <= 3, "Invalid trust level");
        
        // Count users with this trust level
        uint256 count = 0;
        for (uint256 i = 0; i < allUsers.length; i++) {
            uint256 userLevel = _getTrustLevel(allUsers[i]);
            if (userLevel == level) {
                count++;
            }
        }
        
        // Create arrays
        users = new address[](count);
        profiles = new TrustProfile[](count);
        
        uint256 index = 0;
        for (uint256 i = 0; i < allUsers.length; i++) {
            uint256 userLevel = _getTrustLevel(allUsers[i]);
            if (userLevel == level) {
                users[index] = allUsers[i];
                profiles[index] = trustProfiles[allUsers[i]];
                index++;
            }
        }
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _calculateTrustScore(address user) internal view returns (uint256 score) {
        TrustProfile memory profile = trustProfiles[user];
        
        // Base score
        score = baseTrustScore;
        
        // Payment success rate (30% weight)
        uint256 totalPayments = profile.successfulTransactions + profile.failedTransactions;
        if (totalPayments > 0) {
            uint256 successRate = (profile.successfulTransactions * 100) / totalPayments;
            score += (successRate * paymentWeight) / 100;
        }
        
        // Social interactions (25% weight)
        if (profile.socialInteractions > 0) {
            uint256 socialScore = (profile.socialInteractions * socialWeight) / 100;
            score += socialScore;
        }
        
        // Referrals (20% weight)
        if (profile.referralsGiven > 0) {
            uint256 referralScore = (profile.referralsGiven * referralWeight) / 10;
            score += referralScore;
        }
        
        // Verification (15% weight)
        if (profile.isVerified) {
            score += verificationWeight;
        }
        
        // Recent activity (10% weight)
        if (profile.lastActivity > block.timestamp - 7 days) {
            score += activityWeight;
        }
        
        // Cap at max trust score
        if (score > maxTrustScore) {
            score = maxTrustScore;
        }
        
        // Ensure minimum score
        if (score < minTrustScore) {
            score = minTrustScore;
        }
    }
    
    function _updateTrustScore(address user) internal {
        uint256 oldScore = trustProfiles[user].trustScore;
        uint256 newScore = _calculateTrustScore(user);
        
        if (oldScore != newScore) {
            trustProfiles[user].trustScore = newScore;
            emit TrustScoreUpdated(user, oldScore, newScore, block.timestamp);
        }
    }
    
    function _updateUserProfile(
        address user,
        uint256 interactionType,
        uint256 value,
        bool isPositive,
        bool isFrom
    ) internal {
        TrustProfile storage profile = trustProfiles[user];
        
        profile.socialInteractions++;
        profile.lastActivity = block.timestamp;
        
        if (interactionType == 1) { // Payment
            if (isPositive) {
                profile.successfulTransactions++;
            } else {
                profile.failedTransactions++;
            }
        } else if (interactionType == 2) { // Referral
            if (isFrom) {
                profile.referralsGiven++;
            } else {
                profile.referralsReceived++;
            }
        }
    }
    
    function _updateTrustMetrics() internal {
        if (allUsers.length > 0) {
            uint256 totalScore = 0;
            for (uint256 i = 0; i < allUsers.length; i++) {
                totalScore += trustProfiles[allUsers[i]].trustScore;
            }
            trustMetrics.averageTrustScore = totalScore / allUsers.length;
        }
        
        emit TrustMetricsUpdated(
            trustMetrics.totalUsers,
            trustMetrics.verifiedUsers,
            trustMetrics.averageTrustScore,
            block.timestamp
        );
    }
    
    function _getTrustLevel(address user) internal view returns (uint256 level) {
        uint256 score = _calculateTrustScore(user);
        
        if (score >= highTrustThreshold) {
            return 3; // High trust
        } else if (score >= mediumTrustThreshold) {
            return 2; // Medium trust
        } else {
            return 1; // Low trust
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
     * @dev Update trust scoring parameters
     * @param _baseTrustScore New base trust score
     * @param _maxTrustScore New max trust score
     * @param _minTrustScore New min trust score
     */
    function updateTrustParameters(
        uint256 _baseTrustScore,
        uint256 _maxTrustScore,
        uint256 _minTrustScore
    ) external onlyOwner {
        require(_baseTrustScore > 0, "Base trust score must be greater than 0");
        require(_maxTrustScore > _minTrustScore, "Max must be greater than min");
        require(_maxTrustScore <= 100, "Max trust score cannot exceed 100");
        
        baseTrustScore = _baseTrustScore;
        maxTrustScore = _maxTrustScore;
        minTrustScore = _minTrustScore;
    }
    
    /**
     * @dev Update scoring weights
     * @param _paymentWeight Payment weight
     * @param _socialWeight Social weight
     * @param _referralWeight Referral weight
     * @param _verificationWeight Verification weight
     * @param _activityWeight Activity weight
     */
    function updateScoringWeights(
        uint256 _paymentWeight,
        uint256 _socialWeight,
        uint256 _referralWeight,
        uint256 _verificationWeight,
        uint256 _activityWeight
    ) external onlyOwner {
        require(
            _paymentWeight + _socialWeight + _referralWeight + _verificationWeight + _activityWeight == 100,
            "Weights must sum to 100"
        );
        
        paymentWeight = _paymentWeight;
        socialWeight = _socialWeight;
        referralWeight = _referralWeight;
        verificationWeight = _verificationWeight;
        activityWeight = _activityWeight;
    }
    
    /**
     * @dev Update trust thresholds
     * @param _highThreshold High trust threshold
     * @param _mediumThreshold Medium trust threshold
     * @param _lowThreshold Low trust threshold
     */
    function updateTrustThresholds(
        uint256 _highThreshold,
        uint256 _mediumThreshold,
        uint256 _lowThreshold
    ) external onlyOwner {
        require(_highThreshold > _mediumThreshold, "High must be greater than medium");
        require(_mediumThreshold > _lowThreshold, "Medium must be greater than low");
        require(_highThreshold <= 100, "High threshold cannot exceed 100");
        
        highTrustThreshold = _highThreshold;
        mediumTrustThreshold = _mediumThreshold;
        lowTrustThreshold = _lowThreshold;
    }
    
    /**
     * @dev Update verification threshold
     * @param _threshold New verification threshold
     */
    function setVerificationThreshold(uint256 _threshold) external onlyOwner {
        require(_threshold > 0, "Threshold must be greater than 0");
        verificationThreshold = _threshold;
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
}
