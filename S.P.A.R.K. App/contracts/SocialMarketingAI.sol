// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SocialMarketingAI is Ownable, ReentrancyGuard, Pausable, ERC721, ERC721URIStorage {
    
    // ============ STRUCTS ============
    
    struct Campaign {
        uint256 campaignId;
        address businessOwner;
        string name;
        string description;
        string imageURI;
        uint256 totalCoupons;
        uint256 claimedCoupons;
        uint256 discountPercentage;
        uint256 minPurchaseAmount;
        uint256 maxPurchaseAmount;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isViral;
        uint256 viralThreshold;
        uint256 viralReward;
        mapping(address => bool) claimedBy;
        mapping(address => uint256) sharesBy;
    }
    
    struct ViralShare {
        address sharer;
        address recipient;
        uint256 campaignId;
        uint256 timestamp;
        string platform; // "LINE", "Twitter", "Facebook", etc.
        bool isRewarded;
    }
    
    struct CampaignMetrics {
        uint256 totalCampaigns;
        uint256 activeCampaigns;
        uint256 totalCouponsIssued;
        uint256 totalCouponsClaimed;
        uint256 totalViralShares;
        uint256 totalViralRewards;
    }
    
    struct CampaignData {
        uint256 id;
        address businessOwner;
        string name;
        string description;
        string imageURI;
        uint256 totalCoupons;
        uint256 claimedCoupons;
        uint256 discountPercentage;
        uint256 minPurchaseAmount;
        uint256 maxPurchaseAmount;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isViral;
        uint256 viralThreshold;
        uint256 viralReward;
    }
    
    // ============ STATE VARIABLES ============
    
    // Campaign management
    mapping(uint256 => Campaign) public campaigns;
    uint256 public nextCampaignId = 1;
    
    // Viral sharing system
    mapping(uint256 => ViralShare[]) public campaignShares;
    mapping(address => uint256) public userViralRewards;
    mapping(address => uint256) public userShareCount;
    
    // NFT Coupon system
    uint256 public nextTokenId = 1;
    mapping(uint256 => uint256) public tokenToCampaign;
    mapping(uint256 => bool) public tokenUsed;
    
    // Platform metrics
    CampaignMetrics public metrics;
    
    // Configuration
    uint256 public platformFeePercentage = 5; // 5% platform fee
    uint256 public viralRewardAmount = 100; // Base viral reward amount
    address public feeRecipient;
    
    // Trust system integration
    address public trustMatrixScorer;
    uint256 public minTrustScoreForCampaign = 30;
    uint256 public minTrustScoreForViralReward = 50;
    
    // ============ EVENTS ============
    
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed businessOwner,
        string name,
        uint256 totalCoupons,
        uint256 discountPercentage,
        uint256 startTime,
        uint256 endTime,
        bool isViral
    );
    
    event CouponClaimed(
        uint256 indexed campaignId,
        address indexed user,
        uint256 indexed tokenId,
        uint256 discountAmount
    );
    
    event CouponUsed(
        uint256 indexed campaignId,
        address indexed user,
        uint256 indexed tokenId,
        uint256 purchaseAmount,
        uint256 discountApplied
    );
    
    event ViralShareRecorded(
        uint256 indexed campaignId,
        address indexed sharer,
        address indexed recipient,
        string platform,
        uint256 timestamp
    );
    
    event ViralRewardClaimed(
        address indexed user,
        uint256 amount,
        uint256 campaignId
    );
    
    event CampaignMetricsUpdated(
        uint256 totalCampaigns,
        uint256 activeCampaigns,
        uint256 totalCouponsIssued,
        uint256 totalCouponsClaimed
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyCampaignOwner(uint256 campaignId) {
        require(campaigns[campaignId].businessOwner == msg.sender, "Not campaign owner");
        _;
    }
    
    modifier validCampaign(uint256 campaignId) {
        require(campaignId > 0 && campaignId < nextCampaignId, "Invalid campaign ID");
        require(campaigns[campaignId].isActive, "Campaign not active");
        _;
    }
    
    modifier campaignActive(uint256 campaignId) {
        require(
            block.timestamp >= campaigns[campaignId].startTime &&
            block.timestamp <= campaigns[campaignId].endTime,
            "Campaign not active"
        );
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        string memory name,
        string memory symbol,
        address _feeRecipient,
        address _trustMatrixScorer
    ) ERC721(name, symbol) {
        feeRecipient = _feeRecipient;
        trustMatrixScorer = _trustMatrixScorer;
        
        // Initialize metrics
        metrics = CampaignMetrics({
            totalCampaigns: 0,
            activeCampaigns: 0,
            totalCouponsIssued: 0,
            totalCouponsClaimed: 0,
            totalViralShares: 0,
            totalViralRewards: 0
        });
    }
    
    // ============ CAMPAIGN MANAGEMENT ============
    
    /**
     * @dev Create a new marketing campaign
     * @param name Campaign name
     * @param description Campaign description
     * @param imageURI Campaign image URI
     * @param totalCoupons Total number of coupons to issue
     * @param discountPercentage Discount percentage (1-100)
     * @param minPurchaseAmount Minimum purchase amount to use coupon
     * @param maxPurchaseAmount Maximum purchase amount for discount
     * @param duration Campaign duration in seconds
     * @param isViral Whether this is a viral campaign
     * @param viralThreshold Number of shares needed for viral reward
     */
    function createCampaign(
        string memory name,
        string memory description,
        string memory imageURI,
        uint256 totalCoupons,
        uint256 discountPercentage,
        uint256 minPurchaseAmount,
        uint256 maxPurchaseAmount,
        uint256 duration,
        bool isViral,
        uint256 viralThreshold
    ) external whenNotPaused nonReentrant {
        require(bytes(name).length > 0, "Campaign name cannot be empty");
        require(totalCoupons > 0, "Total coupons must be greater than 0");
        require(discountPercentage > 0 && discountPercentage <= 100, "Invalid discount percentage");
        require(duration > 0, "Duration must be greater than 0");
        require(minPurchaseAmount <= maxPurchaseAmount, "Invalid purchase amount range");
        
        // Check trust score if trust system is integrated
        if (trustMatrixScorer != address(0)) {
            // This would require calling the trust matrix scorer contract
            // For now, we'll skip this check
        }
        
        uint256 campaignId = nextCampaignId++;
        Campaign storage campaign = campaigns[campaignId];
        
        campaign.campaignId = campaignId;
        campaign.businessOwner = msg.sender;
        campaign.name = name;
        campaign.description = description;
        campaign.imageURI = imageURI;
        campaign.totalCoupons = totalCoupons;
        campaign.claimedCoupons = 0;
        campaign.discountPercentage = discountPercentage;
        campaign.minPurchaseAmount = minPurchaseAmount;
        campaign.maxPurchaseAmount = maxPurchaseAmount;
        campaign.startTime = block.timestamp;
        campaign.endTime = block.timestamp + duration;
        campaign.isActive = true;
        campaign.isViral = isViral;
        campaign.viralThreshold = viralThreshold;
        campaign.viralReward = viralRewardAmount;
        
        // Update metrics
        metrics.totalCampaigns++;
        metrics.activeCampaigns++;
        _updateMetrics();
        
        emit CampaignCreated(
            campaignId,
            msg.sender,
            name,
            totalCoupons,
            discountPercentage,
            campaign.startTime,
            campaign.endTime,
            isViral
        );
    }
    
    /**
     * @dev Claim a coupon from a campaign
     * @param campaignId Campaign ID
     */
    function claimCoupon(uint256 campaignId) 
        external 
        validCampaign(campaignId) 
        campaignActive(campaignId) 
        whenNotPaused 
        nonReentrant 
    {
        Campaign storage campaign = campaigns[campaignId];
        
        require(!campaign.claimedBy[msg.sender], "Already claimed coupon");
        require(campaign.claimedCoupons < campaign.totalCoupons, "No coupons left");
        
        // Mint NFT coupon
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, campaign.imageURI);
        
        // Update campaign state
        campaign.claimedBy[msg.sender] = true;
        campaign.claimedCoupons++;
        tokenToCampaign[tokenId] = campaignId;
        
        // Update metrics
        metrics.totalCouponsIssued++;
        metrics.totalCouponsClaimed++;
        _updateMetrics();
        
        emit CouponClaimed(
            campaignId,
            msg.sender,
            tokenId,
            campaign.discountPercentage
        );
    }
    
    /**
     * @dev Use a coupon for a purchase
     * @param tokenId NFT token ID
     * @param purchaseAmount Purchase amount
     */
    function useCoupon(uint256 tokenId, uint256 purchaseAmount) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        require(ownerOf(tokenId) == msg.sender, "Not coupon owner");
        require(!tokenUsed[tokenId], "Coupon already used");
        
        uint256 campaignId = tokenToCampaign[tokenId];
        Campaign storage campaign = campaigns[campaignId];
        
        require(campaign.isActive, "Campaign not active");
        require(
            block.timestamp >= campaign.startTime &&
            block.timestamp <= campaign.endTime,
            "Campaign expired"
        );
        require(purchaseAmount >= campaign.minPurchaseAmount, "Purchase amount too low");
        
        // Calculate discount
        uint256 maxDiscount = (purchaseAmount * campaign.discountPercentage) / 100;
        uint256 discountApplied = maxDiscount;
        
        // Apply maximum purchase amount limit
        if (purchaseAmount > campaign.maxPurchaseAmount) {
            discountApplied = (campaign.maxPurchaseAmount * campaign.discountPercentage) / 100;
        }
        
        // Mark coupon as used
        tokenUsed[tokenId] = true;
        
        emit CouponUsed(
            campaignId,
            msg.sender,
            tokenId,
            purchaseAmount,
            discountApplied
        );
    }
    
    // ============ VIRAL MARKETING SYSTEM ============
    
    /**
     * @dev Record a viral share
     * @param campaignId Campaign ID
     * @param recipient Recipient address
     * @param platform Sharing platform
     */
    function recordViralShare(
        uint256 campaignId,
        address recipient,
        string memory platform
    ) external validCampaign(campaignId) whenNotPaused {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.isViral, "Campaign not viral");
        require(recipient != address(0), "Invalid recipient");
        require(bytes(platform).length > 0, "Platform cannot be empty");
        
        // Create viral share record
        ViralShare memory share = ViralShare({
            sharer: msg.sender,
            recipient: recipient,
            campaignId: campaignId,
            timestamp: block.timestamp,
            platform: platform,
            isRewarded: false
        });
        
        campaignShares[campaignId].push(share);
        campaign.sharesBy[msg.sender]++;
        userShareCount[msg.sender]++;
        
        // Update metrics
        metrics.totalViralShares++;
        _updateMetrics();
        
        emit ViralShareRecorded(
            campaignId,
            msg.sender,
            recipient,
            platform,
            block.timestamp
        );
        
        // Check if viral threshold is reached
        if (campaign.sharesBy[msg.sender] >= campaign.viralThreshold) {
            userViralRewards[msg.sender] += campaign.viralReward;
            metrics.totalViralRewards += campaign.viralReward;
        }
    }
    
    /**
     * @dev Claim viral rewards
     */
    function claimViralRewards() external whenNotPaused nonReentrant {
        uint256 rewards = userViralRewards[msg.sender];
        require(rewards > 0, "No rewards to claim");
        
        // Check trust score if trust system is integrated
        if (trustMatrixScorer != address(0)) {
            // This would require calling the trust matrix scorer contract
            // For now, we'll skip this check
        }
        
        userViralRewards[msg.sender] = 0;
        
        // Transfer rewards (assuming platform has sufficient balance)
        // In a real implementation, this would transfer tokens
        // payable(msg.sender).transfer(rewards);
        
        emit ViralRewardClaimed(msg.sender, rewards, 0);
    }
    
    // ============ QUERY FUNCTIONS ============
    
    /**
     * @dev Get campaign details
     * @param campaignId Campaign ID
     * @return campaign Campaign data
     */
    function getCampaign(uint256 campaignId) 
        external 
        view 
        returns (CampaignData memory campaign) 
    {
        Campaign storage c = campaigns[campaignId];
        return CampaignData({
            id: c.campaignId,
            businessOwner: c.businessOwner,
            name: c.name,
            description: c.description,
            imageURI: c.imageURI,
            totalCoupons: c.totalCoupons,
            claimedCoupons: c.claimedCoupons,
            discountPercentage: c.discountPercentage,
            minPurchaseAmount: c.minPurchaseAmount,
            maxPurchaseAmount: c.maxPurchaseAmount,
            startTime: c.startTime,
            endTime: c.endTime,
            isActive: c.isActive,
            isViral: c.isViral,
            viralThreshold: c.viralThreshold,
            viralReward: c.viralReward
        });
    }
    
    /**
     * @dev Get campaign shares
     * @param campaignId Campaign ID
     * @return shares Array of viral shares
     */
    function getCampaignShares(uint256 campaignId) 
        external 
        view 
        returns (ViralShare[] memory shares) 
    {
        return campaignShares[campaignId];
    }
    
    /**
     * @dev Get user's viral rewards
     * @param user User address
     * @return rewards Total viral rewards
     */
    function getUserViralRewards(address user) external view returns (uint256 rewards) {
        return userViralRewards[user];
    }
    
    /**
     * @dev Get user's share count
     * @param user User address
     * @return count Total shares made
     */
    function getUserShareCount(address user) external view returns (uint256 count) {
        return userShareCount[user];
    }
    
    /**
     * @dev Get campaign metrics
     * @return metrics Campaign metrics
     */
    function getCampaignMetrics() external view returns (CampaignMetrics memory) {
        return metrics;
    }
    
    /**
     * @dev Check if user has claimed coupon from campaign
     * @param campaignId Campaign ID
     * @param user User address
     * @return claimed Whether user has claimed
     */
    function hasClaimedCoupon(uint256 campaignId, address user) 
        external 
        view 
        returns (bool claimed) 
    {
        return campaigns[campaignId].claimedBy[user];
    }
    
    /**
     * @dev Get user's shares for a campaign
     * @param campaignId Campaign ID
     * @param user User address
     * @return shares Number of shares
     */
    function getUserCampaignShares(uint256 campaignId, address user) 
        external 
        view 
        returns (uint256 shares) 
    {
        return campaigns[campaignId].sharesBy[user];
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _updateMetrics() internal {
        emit CampaignMetricsUpdated(
            metrics.totalCampaigns,
            metrics.activeCampaigns,
            metrics.totalCouponsIssued,
            metrics.totalCouponsClaimed
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update platform fee percentage
     * @param _feePercentage New fee percentage
     */
    function setPlatformFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 20, "Fee percentage too high");
        platformFeePercentage = _feePercentage;
    }
    
    /**
     * @dev Update viral reward amount
     * @param _rewardAmount New reward amount
     */
    function setViralRewardAmount(uint256 _rewardAmount) external onlyOwner {
        viralRewardAmount = _rewardAmount;
    }
    
    /**
     * @dev Update fee recipient
     * @param _feeRecipient New fee recipient
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Update trust matrix scorer address
     * @param _trustMatrixScorer New trust matrix scorer address
     */
    function setTrustMatrixScorer(address _trustMatrixScorer) external onlyOwner {
        trustMatrixScorer = _trustMatrixScorer;
    }
    
    /**
     * @dev Update minimum trust score for campaign creation
     * @param _minTrustScore New minimum trust score
     */
    function setMinTrustScoreForCampaign(uint256 _minTrustScore) external onlyOwner {
        minTrustScoreForCampaign = _minTrustScore;
    }
    
    /**
     * @dev Update minimum trust score for viral rewards
     * @param _minTrustScore New minimum trust score
     */
    function setMinTrustScoreForViralReward(uint256 _minTrustScore) external onlyOwner {
        minTrustScoreForViralReward = _minTrustScore;
    }
    
    /**
     * @dev Deactivate a campaign
     * @param campaignId Campaign ID
     */
    function deactivateCampaign(uint256 campaignId) 
        external 
        onlyCampaignOwner(campaignId) 
    {
        campaigns[campaignId].isActive = false;
        metrics.activeCampaigns--;
        _updateMetrics();
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
    
    // ============ ERC721 OVERRIDES ============
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}
