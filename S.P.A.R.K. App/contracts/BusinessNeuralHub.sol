// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BusinessNeuralHub is Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    
    // ============ STRUCTS ============
    
    struct Payment {
        uint256 id;
        address customer;
        uint256 amount;
        uint256 timestamp;
        string description;
        bool processed;
        uint256 loyaltyTokensEarned;
    }
    
    struct Coupon {
        uint256 id;
        string title;
        string description;
        string code;
        uint256 discountAmount;
        bool isPercentage;
        uint256 expiryTime;
        bool isActive;
        uint256 maxUses;
        uint256 currentUses;
        uint256 loyaltyTokenCost;
    }
    
    struct LoyaltyProgram {
        string name;
        string symbol;
        uint256 totalSupply;
        uint256 tokensPerDollar;
        uint256 minPurchaseAmount;
        bool isActive;
    }
    
    // ============ STATE VARIABLES ============
    
    // Core contracts
    IERC20 public immutable usdtToken;
    address public immutable factory;
    address public immutable trustScorer;
    
    // Business info
    string public businessName;
    string public businessCategory;
    string public businessLocation;
    string public metadataURI;
    
    // Payment tracking
    Counters.Counter private _paymentIdCounter;
    mapping(uint256 => Payment) public payments;
    mapping(address => uint256[]) public customerPayments;
    uint256 public totalRevenue;
    uint256 public totalTransactions;
    
    // Loyalty token system
    LoyaltyToken public loyaltyToken;
    LoyaltyProgram public loyaltyProgram;
    mapping(address => uint256) public customerLoyaltyBalance;
    mapping(address => uint256) public customerTotalSpent;
    
    // Coupon system
    Counters.Counter private _couponIdCounter;
    mapping(uint256 => Coupon) public coupons;
    mapping(string => uint256) public couponCodeToId;
    mapping(address => mapping(uint256 => bool)) public customerUsedCoupons;
    
    // NFT Coupon system
    CouponNFT public couponNFT;
    
    // Fees and economics
    uint256 public platformFee = 250; // 2.5% (250/10000)
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // ============ EVENTS ============
    
    event PaymentProcessed(
        uint256 indexed paymentId,
        address indexed customer,
        uint256 amount,
        uint256 loyaltyTokensEarned,
        uint256 timestamp
    );
    
    event LoyaltyTokensEarned(
        address indexed customer,
        uint256 amount,
        uint256 totalBalance
    );
    
    event CouponCreated(
        uint256 indexed couponId,
        string title,
        string code,
        uint256 discountAmount,
        bool isPercentage
    );
    
    event CouponUsed(
        uint256 indexed couponId,
        address indexed customer,
        uint256 discountApplied
    );
    
    event LoyaltyProgramUpdated(
        string name,
        string symbol,
        uint256 tokensPerDollar
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyFactory() {
        require(msg.sender == factory, "Only factory can call this function");
        _;
    }
    
    modifier onlyValidCoupon(uint256 couponId) {
        require(coupons[couponId].isActive, "Coupon not active");
        require(coupons[couponId].expiryTime > block.timestamp, "Coupon expired");
        require(coupons[couponId].currentUses < coupons[couponId].maxUses, "Coupon usage limit reached");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _businessOwner,
        address _factory,
        address _usdtToken,
        address _trustScorer,
        string memory _businessName,
        string memory _businessCategory,
        string memory _businessLocation,
        string memory _metadataURI
    ) {
        factory = _factory;
        usdtToken = IERC20(_usdtToken);
        trustScorer = _trustScorer;
        businessName = _businessName;
        businessCategory = _businessCategory;
        businessLocation = _businessLocation;
        metadataURI = _metadataURI;
        
        // Transfer ownership to business owner
        _transferOwnership(_businessOwner);
        
        // Initialize loyalty program
        loyaltyProgram = LoyaltyProgram({
            name: string(abi.encodePacked(_businessName, " Coin")),
            symbol: string(abi.encodePacked(_businessName, "C")),
            totalSupply: 0,
            tokensPerDollar: 10, // 10 tokens per $1 spent
            minPurchaseAmount: 1, // $1 minimum
            isActive: true
        });
        
        // Deploy loyalty token
        loyaltyToken = new LoyaltyToken(
            loyaltyProgram.name,
            loyaltyProgram.symbol,
            address(this)
        );
        
        // Deploy coupon NFT
        couponNFT = new CouponNFT(
            string(abi.encodePacked(_businessName, " Coupons")),
            string(abi.encodePacked(_businessName, "COUPON")),
            address(this)
        );
    }
    
    // ============ PAYMENT PROCESSING ============
    
    /**
     * @dev Process a payment from a customer
     * @param customer Customer address
     * @param amount Payment amount in USDT (6 decimals)
     * @param description Payment description
     * @param couponId Optional coupon ID to apply
     */
    function processPayment(
        address customer,
        uint256 amount,
        string memory description,
        uint256 couponId
    ) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(customer != address(0), "Invalid customer address");
        
        uint256 finalAmount = amount;
        uint256 discountApplied = 0;
        
        // Apply coupon if provided
        if (couponId > 0) {
            (finalAmount, discountApplied) = _applyCoupon(customer, couponId, amount);
        }
        
        // Calculate platform fee
        uint256 fee = (finalAmount * platformFee) / FEE_DENOMINATOR;
        uint256 netAmount = finalAmount - fee;
        
        // Transfer USDT from customer to this contract
        require(
            usdtToken.transferFrom(customer, address(this), finalAmount),
            "USDT transfer failed"
        );
        
        // Transfer fee to factory (platform fee)
        if (fee > 0) {
            require(
                usdtToken.transfer(factory, fee),
                "Fee transfer failed"
            );
        }
        
        // Create payment record
        _paymentIdCounter.increment();
        uint256 paymentId = _paymentIdCounter.current();
        
        // Calculate loyalty tokens
        uint256 loyaltyTokensEarned = 0;
        if (loyaltyProgram.isActive && finalAmount >= loyaltyProgram.minPurchaseAmount) {
            loyaltyTokensEarned = (finalAmount * loyaltyProgram.tokensPerDollar) / 1e6; // USDT has 6 decimals
            _mintLoyaltyTokens(customer, loyaltyTokensEarned);
        }
        
        payments[paymentId] = Payment({
            id: paymentId,
            customer: customer,
            amount: finalAmount,
            timestamp: block.timestamp,
            description: description,
            processed: true,
            loyaltyTokensEarned: loyaltyTokensEarned
        });
        
        customerPayments[customer].push(paymentId);
        customerTotalSpent[customer] += finalAmount;
        totalRevenue += finalAmount;
        totalTransactions++;
        
        // Update factory metrics
        (bool success,) = factory.call(
            abi.encodeWithSignature(
                "updateBusinessMetrics(address,uint256,bool)",
                owner(),
                finalAmount,
                customerPayments[customer].length == 1
            )
        );
        require(success, "Failed to update factory metrics");
        
        emit PaymentProcessed(
            paymentId,
            customer,
            finalAmount,
            loyaltyTokensEarned,
            block.timestamp
        );
        
        if (discountApplied > 0) {
            emit CouponUsed(couponId, customer, discountApplied);
        }
    }
    
    // ============ COUPON MANAGEMENT ============
    
    /**
     * @dev Create a new coupon
     * @param title Coupon title
     * @param description Coupon description
     * @param code Coupon code
     * @param discountAmount Discount amount
     * @param isPercentage Whether discount is percentage or fixed amount
     * @param expiryTime Expiry timestamp
     * @param maxUses Maximum number of uses
     * @param loyaltyTokenCost Cost in loyalty tokens to use this coupon
     */
    function createCoupon(
        string memory title,
        string memory description,
        string memory code,
        uint256 discountAmount,
        bool isPercentage,
        uint256 expiryTime,
        uint256 maxUses,
        uint256 loyaltyTokenCost
    ) external onlyOwner {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(code).length > 0, "Code cannot be empty");
        require(discountAmount > 0, "Discount must be greater than 0");
        require(expiryTime > block.timestamp, "Expiry must be in the future");
        require(maxUses > 0, "Max uses must be greater than 0");
        require(couponCodeToId[code] == 0, "Code already exists");
        
        _couponIdCounter.increment();
        uint256 couponId = _couponIdCounter.current();
        
        coupons[couponId] = Coupon({
            id: couponId,
            title: title,
            description: description,
            code: code,
            discountAmount: discountAmount,
            isPercentage: isPercentage,
            expiryTime: expiryTime,
            isActive: true,
            maxUses: maxUses,
            currentUses: 0,
            loyaltyTokenCost: loyaltyTokenCost
        });
        
        couponCodeToId[code] = couponId;
        
        emit CouponCreated(couponId, title, code, discountAmount, isPercentage);
    }
    
    /**
     * @dev Use a coupon by code
     * @param code Coupon code
     * @param amount Purchase amount
     * @return finalAmount Final amount after discount
     * @return discountApplied Discount amount applied
     */
    function useCouponByCode(
        string memory code,
        uint256 amount
    ) external returns (uint256 finalAmount, uint256 discountApplied) {
        uint256 couponId = couponCodeToId[code];
        require(couponId > 0, "Coupon not found");
        return _applyCoupon(msg.sender, couponId, amount);
    }
    
    // ============ LOYALTY TOKEN SYSTEM ============
    
    /**
     * @dev Update loyalty program parameters
     * @param tokensPerDollar New tokens per dollar rate
     * @param minPurchaseAmount New minimum purchase amount
     */
    function updateLoyaltyProgram(
        uint256 tokensPerDollar,
        uint256 minPurchaseAmount
    ) external onlyOwner {
        require(tokensPerDollar > 0, "Tokens per dollar must be greater than 0");
        require(minPurchaseAmount > 0, "Min purchase amount must be greater than 0");
        
        loyaltyProgram.tokensPerDollar = tokensPerDollar;
        loyaltyProgram.minPurchaseAmount = minPurchaseAmount;
        
        emit LoyaltyProgramUpdated(
            loyaltyProgram.name,
            loyaltyProgram.symbol,
            tokensPerDollar
        );
    }
    
    /**
     * @dev Redeem loyalty tokens for USDT
     * @param amount Amount of loyalty tokens to redeem
     */
    function redeemLoyaltyTokens(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(
            customerLoyaltyBalance[msg.sender] >= amount,
            "Insufficient loyalty token balance"
        );
        
        // Calculate USDT equivalent (1 loyalty token = 0.01 USDT)
        uint256 usdtAmount = (amount * 1e4) / 1e6; // 0.01 USDT per token
        
        require(
            usdtToken.balanceOf(address(this)) >= usdtAmount,
            "Insufficient USDT balance"
        );
        
        // Burn loyalty tokens
        customerLoyaltyBalance[msg.sender] -= amount;
        loyaltyToken.burn(msg.sender, amount);
        
        // Transfer USDT to customer
        require(
            usdtToken.transfer(msg.sender, usdtAmount),
            "USDT transfer failed"
        );
        
        emit LoyaltyTokensEarned(msg.sender, 0, customerLoyaltyBalance[msg.sender]);
    }
    
    // ============ QUERY FUNCTIONS ============
    
    /**
     * @dev Get customer payment history
     * @param customer Customer address
     * @return paymentIds Array of payment IDs
     */
    function getCustomerPayments(address customer) 
        external 
        view 
        returns (uint256[] memory paymentIds) 
    {
        return customerPayments[customer];
    }
    
    /**
     * @dev Get coupon by ID
     * @param couponId Coupon ID
     * @return coupon Coupon data
     */
    function getCoupon(uint256 couponId) 
        external 
        view 
        returns (Coupon memory coupon) 
    {
        return coupons[couponId];
    }
    
    /**
     * @dev Get coupon by code
     * @param code Coupon code
     * @return coupon Coupon data
     */
    function getCouponByCode(string memory code) 
        external 
        view 
        returns (Coupon memory coupon) 
    {
        uint256 couponId = couponCodeToId[code];
        require(couponId > 0, "Coupon not found");
        return coupons[couponId];
    }
    
    /**
     * @dev Get business statistics
     * @return revenue Total revenue
     * @return transactions Total transactions
     * @return customers Total unique customers
     * @return activeCoupons Number of active coupons
     */
    function getBusinessStats() 
        external 
        view 
        returns (
            uint256 revenue,
            uint256 transactions,
            uint256 customers,
            uint256 activeCoupons
        ) 
    {
        revenue = totalRevenue;
        transactions = totalTransactions;
        customers = _getUniqueCustomerCount();
        activeCoupons = _getActiveCouponCount();
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _applyCoupon(
        address customer,
        uint256 couponId,
        uint256 amount
    ) internal onlyValidCoupon(couponId) returns (uint256 finalAmount, uint256 discountApplied) {
        Coupon storage coupon = coupons[couponId];
        
        // Check if customer has already used this coupon
        require(
            !customerUsedCoupons[customer][couponId],
            "Coupon already used by this customer"
        );
        
        // Check loyalty token cost
        if (coupon.loyaltyTokenCost > 0) {
            require(
                customerLoyaltyBalance[customer] >= coupon.loyaltyTokenCost,
                "Insufficient loyalty tokens for coupon"
            );
            customerLoyaltyBalance[customer] -= coupon.loyaltyTokenCost;
        }
        
        // Calculate discount
        if (coupon.isPercentage) {
            discountApplied = (amount * coupon.discountAmount) / 100;
        } else {
            discountApplied = coupon.discountAmount;
        }
        
        // Ensure discount doesn't exceed amount
        if (discountApplied > amount) {
            discountApplied = amount;
        }
        
        finalAmount = amount - discountApplied;
        
        // Update coupon usage
        coupon.currentUses++;
        customerUsedCoupons[customer][couponId] = true;
    }
    
    function _mintLoyaltyTokens(address customer, uint256 amount) internal {
        customerLoyaltyBalance[customer] += amount;
        loyaltyToken.mint(customer, amount);
        loyaltyProgram.totalSupply += amount;
        
        emit LoyaltyTokensEarned(customer, amount, customerLoyaltyBalance[customer]);
    }
    
    function _getUniqueCustomerCount() internal view returns (uint256 count) {
        // This is a simplified implementation
        // In production, you'd want to track this more efficiently
        return totalTransactions; // Approximation
    }
    
    function _getActiveCouponCount() internal view returns (uint256 count) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= _couponIdCounter.current(); i++) {
            if (coupons[i].isActive && coupons[i].expiryTime > block.timestamp) {
                activeCount++;
            }
        }
        return activeCount;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update platform fee (only factory)
     * @param newFee New platform fee
     */
    function setPlatformFee(uint256 newFee) external onlyFactory {
        require(newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = newFee;
    }
    
    /**
     * @dev Withdraw USDT (only owner)
     * @param amount Amount to withdraw
     */
    function withdrawUSDT(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(
            usdtToken.balanceOf(address(this)) >= amount,
            "Insufficient USDT balance"
        );
        
        require(
            usdtToken.transfer(owner(), amount),
            "USDT transfer failed"
        );
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

// ============ LOYALTY TOKEN CONTRACT ============

contract LoyaltyToken is ERC20, Ownable {
    address public immutable businessHub;
    
    constructor(
        string memory name,
        string memory symbol,
        address _businessHub
    ) ERC20(name, symbol) {
        businessHub = _businessHub;
    }
    
    function mint(address to, uint256 amount) external {
        require(msg.sender == businessHub, "Only business hub can mint");
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external {
        require(msg.sender == businessHub, "Only business hub can burn");
        _burn(from, amount);
    }
}

// ============ COUPON NFT CONTRACT ============

contract CouponNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    address public immutable businessHub;
    Counters.Counter private _tokenIdCounter;
    
    constructor(
        string memory name,
        string memory symbol,
        address _businessHub
    ) ERC721(name, symbol) {
        businessHub = _businessHub;
    }
    
    function mintCoupon(
        address to,
        string memory tokenURI
    ) external returns (uint256) {
        require(msg.sender == businessHub, "Only business hub can mint");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        return tokenId;
    }
}
