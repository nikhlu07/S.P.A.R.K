// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract QuantumLendingPool is Ownable, ReentrancyGuard, Pausable {
    
    // ============ STRUCTS ============
    
    struct Loan {
        uint256 loanId;
        address borrower;
        address business;
        uint256 amount;
        uint256 interestRate;
        uint256 duration;
        uint256 startTime;
        uint256 endTime;
        uint256 totalRepayment;
        uint256 paidAmount;
        LoanStatus status;
        string purpose;
        string description;
        uint256 collateralAmount;
        address collateralToken;
        bool isCollateralized;
    }
    
    struct Investment {
        uint256 investmentId;
        address investor;
        uint256 loanId;
        uint256 amount;
        uint256 timestamp;
        bool isActive;
        uint256 claimedRewards;
    }
    
    struct PoolMetrics {
        uint256 totalLoans;
        uint256 activeLoans;
        uint256 totalInvestments;
        uint256 totalLent;
        uint256 totalRepaid;
        uint256 totalDefaulted;
        uint256 averageInterestRate;
        uint256 totalInvestors;
    }
    
    struct BorrowerProfile {
        address borrower;
        uint256 totalBorrowed;
        uint256 totalRepaid;
        uint256 activeLoans;
        uint256 completedLoans;
        uint256 defaultedLoans;
        uint256 creditScore;
        uint256 lastLoanTime;
        bool isVerified;
    }
    
    struct LoanData {
        uint256 loanId;
        address borrower;
        address business;
        uint256 amount;
        uint256 interestRate;
        uint256 duration;
        uint256 startTime;
        uint256 endTime;
        uint256 totalRepayment;
        uint256 paidAmount;
        LoanStatus status;
        string purpose;
        string description;
        uint256 collateralAmount;
        address collateralToken;
        bool isCollateralized;
    }
    
    // ============ ENUMS ============
    
    enum LoanStatus {
        Pending,
        Active,
        Repaid,
        Defaulted,
        Cancelled
    }
    
    // ============ STATE VARIABLES ============
    
    // Loan management
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => Investment[]) public loanInvestments;
    mapping(uint256 => mapping(address => uint256)) public investorShares;
    uint256 public nextLoanId = 1;
    
    // Investment management
    mapping(uint256 => Investment) public investments;
    uint256 public nextInvestmentId = 1;
    
    // Borrower profiles
    mapping(address => BorrowerProfile) public borrowerProfiles;
    mapping(address => bool) public registeredBorrowers;
    
    // Pool configuration
    uint256 public minLoanAmount = 100 * 10**6; // $100 USDT
    uint256 public maxLoanAmount = 10000 * 10**6; // $10,000 USDT
    uint256 public minInvestmentAmount = 10 * 10**6; // $10 USDT
    uint256 public maxInterestRate = 30; // 30% max
    uint256 public minInterestRate = 5; // 5% min
    uint256 public platformFeePercentage = 3; // 3% platform fee
    uint256 public defaultGracePeriod = 7 days;
    
    // Pool metrics
    PoolMetrics public poolMetrics;
    
    // Token management
    IERC20 public usdtToken;
    address public feeRecipient;
    
    // Trust system integration
    address public trustMatrixScorer;
    uint256 public minTrustScoreForBorrowing = 40;
    uint256 public minTrustScoreForInvesting = 30;
    
    // ============ EVENTS ============
    
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        address indexed business,
        uint256 amount,
        uint256 interestRate,
        uint256 duration,
        string purpose
    );
    
    event LoanFunded(
        uint256 indexed loanId,
        uint256 totalAmount,
        uint256 investorCount
    );
    
    event InvestmentMade(
        uint256 indexed investmentId,
        address indexed investor,
        uint256 indexed loanId,
        uint256 amount
    );
    
    event LoanRepayment(
        uint256 indexed loanId,
        uint256 amount,
        uint256 remainingAmount
    );
    
    event LoanCompleted(
        uint256 indexed loanId,
        uint256 totalRepaid,
        uint256 totalInterest
    );
    
    event LoanDefaulted(
        uint256 indexed loanId,
        uint256 defaultedAmount
    );
    
    event BorrowerRegistered(
        address indexed borrower,
        uint256 creditScore,
        bool isVerified
    );
    
    event PoolMetricsUpdated(
        uint256 totalLoans,
        uint256 activeLoans,
        uint256 totalInvestments,
        uint256 totalLent
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyRegisteredBorrower(address borrower) {
        require(registeredBorrowers[borrower], "Borrower not registered");
        _;
    }
    
    modifier validLoan(uint256 loanId) {
        require(loanId > 0 && loanId < nextLoanId, "Invalid loan ID");
        _;
    }
    
    modifier loanActive(uint256 loanId) {
        require(loans[loanId].status == LoanStatus.Active, "Loan not active");
        _;
    }
    
    modifier loanPending(uint256 loanId) {
        require(loans[loanId].status == LoanStatus.Pending, "Loan not pending");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        address _usdtToken,
        address _feeRecipient,
        address _trustMatrixScorer
    ) {
        usdtToken = IERC20(_usdtToken);
        feeRecipient = _feeRecipient;
        trustMatrixScorer = _trustMatrixScorer;
        
        // Initialize pool metrics
        poolMetrics = PoolMetrics({
            totalLoans: 0,
            activeLoans: 0,
            totalInvestments: 0,
            totalLent: 0,
            totalRepaid: 0,
            totalDefaulted: 0,
            averageInterestRate: 0,
            totalInvestors: 0
        });
    }
    
    // ============ BORROWER REGISTRATION ============
    
    /**
     * @dev Register a new borrower
     * @param creditScore Initial credit score
     * @param isVerified Whether borrower is verified
     */
    function registerBorrower(uint256 creditScore, bool isVerified) external whenNotPaused {
        require(!registeredBorrowers[msg.sender], "Already registered");
        require(creditScore > 0, "Credit score must be greater than 0");
        
        // Check trust score if trust system is integrated
        if (trustMatrixScorer != address(0)) {
            // This would require calling the trust matrix scorer contract
            // For now, we'll skip this check
        }
        
        borrowerProfiles[msg.sender] = BorrowerProfile({
            borrower: msg.sender,
            totalBorrowed: 0,
            totalRepaid: 0,
            activeLoans: 0,
            completedLoans: 0,
            defaultedLoans: 0,
            creditScore: creditScore,
            lastLoanTime: 0,
            isVerified: isVerified
        });
        
        registeredBorrowers[msg.sender] = true;
        poolMetrics.totalInvestors++; // Count as potential investor too
        
        emit BorrowerRegistered(msg.sender, creditScore, isVerified);
    }
    
    // ============ LOAN CREATION ============
    
    /**
     * @dev Create a new loan request
     * @param business Business address
     * @param amount Loan amount
     * @param interestRate Interest rate (percentage)
     * @param duration Loan duration in seconds
     * @param purpose Loan purpose
     * @param description Loan description
     * @param collateralAmount Collateral amount (if any)
     * @param collateralToken Collateral token address (if any)
     */
    function createLoan(
        address business,
        uint256 amount,
        uint256 interestRate,
        uint256 duration,
        string memory purpose,
        string memory description,
        uint256 collateralAmount,
        address collateralToken
    ) external onlyRegisteredBorrower(msg.sender) whenNotPaused nonReentrant {
        require(business != address(0), "Invalid business address");
        require(amount >= minLoanAmount && amount <= maxLoanAmount, "Invalid loan amount");
        require(interestRate >= minInterestRate && interestRate <= maxInterestRate, "Invalid interest rate");
        require(duration > 0, "Duration must be greater than 0");
        require(bytes(purpose).length > 0, "Purpose cannot be empty");
        
        // Check if borrower has too many active loans
        require(borrowerProfiles[msg.sender].activeLoans < 3, "Too many active loans");
        
        uint256 loanId = nextLoanId++;
        uint256 totalRepayment = amount + (amount * interestRate * duration) / (365 days * 100);
        
        loans[loanId] = Loan({
            loanId: loanId,
            borrower: msg.sender,
            business: business,
            amount: amount,
            interestRate: interestRate,
            duration: duration,
            startTime: 0, // Will be set when funded
            endTime: 0, // Will be set when funded
            totalRepayment: totalRepayment,
            paidAmount: 0,
            status: LoanStatus.Pending,
            purpose: purpose,
            description: description,
            collateralAmount: collateralAmount,
            collateralToken: collateralToken,
            isCollateralized: collateralAmount > 0
        });
        
        // Update borrower profile
        borrowerProfiles[msg.sender].activeLoans++;
        borrowerProfiles[msg.sender].lastLoanTime = block.timestamp;
        
        // Update metrics
        poolMetrics.totalLoans++;
        _updatePoolMetrics();
        
        emit LoanCreated(
            loanId,
            msg.sender,
            business,
            amount,
            interestRate,
            duration,
            purpose
        );
    }
    
    // ============ INVESTMENT SYSTEM ============
    
    /**
     * @dev Invest in a loan
     * @param loanId Loan ID
     * @param amount Investment amount
     */
    function investInLoan(uint256 loanId, uint256 amount) 
        external 
        validLoan(loanId) 
        loanPending(loanId) 
        whenNotPaused 
        nonReentrant 
    {
        require(amount >= minInvestmentAmount, "Investment amount too low");
        require(amount <= loans[loanId].amount, "Investment exceeds loan amount");
        
        // Check trust score if trust system is integrated
        if (trustMatrixScorer != address(0)) {
            // This would require calling the trust matrix scorer contract
            // For now, we'll skip this check
        }
        
        // Transfer USDT from investor
        require(usdtToken.transferFrom(msg.sender, address(this), amount), "USDT transfer failed");
        
        // Create investment record
        uint256 investmentId = nextInvestmentId++;
        investments[investmentId] = Investment({
            investmentId: investmentId,
            investor: msg.sender,
            loanId: loanId,
            amount: amount,
            timestamp: block.timestamp,
            isActive: true,
            claimedRewards: 0
        });
        
        loanInvestments[loanId].push(investments[investmentId]);
        investorShares[loanId][msg.sender] += amount;
        
        // Update metrics
        poolMetrics.totalInvestments++;
        _updatePoolMetrics();
        
        emit InvestmentMade(investmentId, msg.sender, loanId, amount);
        
        // Check if loan is fully funded
        uint256 totalInvested = _getTotalInvested(loanId);
        if (totalInvested >= loans[loanId].amount) {
            _activateLoan(loanId);
        }
    }
    
    // ============ LOAN REPAYMENT ============
    
    /**
     * @dev Repay a loan
     * @param loanId Loan ID
     * @param amount Repayment amount
     */
    function repayLoan(uint256 loanId, uint256 amount) 
        external 
        validLoan(loanId) 
        loanActive(loanId) 
        whenNotPaused 
        nonReentrant 
    {
        require(loans[loanId].borrower == msg.sender, "Not the borrower");
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= loans[loanId].totalRepayment - loans[loanId].paidAmount, "Amount exceeds remaining balance");
        
        // Transfer USDT from borrower
        require(usdtToken.transferFrom(msg.sender, address(this), amount), "USDT transfer failed");
        
        // Update loan state
        loans[loanId].paidAmount += amount;
        
        // Update borrower profile
        borrowerProfiles[msg.sender].totalRepaid += amount;
        
        // Update metrics
        poolMetrics.totalRepaid += amount;
        _updatePoolMetrics();
        
        emit LoanRepayment(loanId, amount, loans[loanId].totalRepayment - loans[loanId].paidAmount);
        
        // Check if loan is fully repaid
        if (loans[loanId].paidAmount >= loans[loanId].totalRepayment) {
            _completeLoan(loanId);
        }
    }
    
    // ============ REWARD DISTRIBUTION ============
    
    /**
     * @dev Claim investment rewards
     * @param investmentId Investment ID
     */
    function claimRewards(uint256 investmentId) external whenNotPaused nonReentrant {
        require(investmentId > 0 && investmentId < nextInvestmentId, "Invalid investment ID");
        Investment storage investment = investments[investmentId];
        require(investment.investor == msg.sender, "Not the investor");
        require(investment.isActive, "Investment not active");
        
        uint256 loanId = investment.loanId;
        require(loans[loanId].status == LoanStatus.Repaid, "Loan not repaid");
        
        // Calculate rewards
        uint256 totalRewards = _calculateInvestmentRewards(investmentId);
        uint256 claimableRewards = totalRewards - investment.claimedRewards;
        require(claimableRewards > 0, "No rewards to claim");
        
        // Update investment
        investment.claimedRewards += claimableRewards;
        
        // Transfer rewards to investor
        require(usdtToken.transfer(msg.sender, claimableRewards), "Reward transfer failed");
    }
    
    // ============ QUERY FUNCTIONS ============
    
    /**
     * @dev Get loan details
     * @param loanId Loan ID
     * @return loan Loan data
     */
    function getLoan(uint256 loanId) external view validLoan(loanId) returns (LoanData memory loan) {
        Loan storage l = loans[loanId];
        return LoanData({
            loanId: l.loanId,
            borrower: l.borrower,
            business: l.business,
            amount: l.amount,
            interestRate: l.interestRate,
            duration: l.duration,
            startTime: l.startTime,
            endTime: l.endTime,
            totalRepayment: l.totalRepayment,
            paidAmount: l.paidAmount,
            status: l.status,
            purpose: l.purpose,
            description: l.description,
            collateralAmount: l.collateralAmount,
            collateralToken: l.collateralToken,
            isCollateralized: l.isCollateralized
        });
    }
    
    /**
     * @dev Get loan investments
     * @param loanId Loan ID
     * @return investments Array of investments
     */
    function getLoanInvestments(uint256 loanId) external view validLoan(loanId) returns (Investment[] memory) {
        return loanInvestments[loanId];
    }
    
    /**
     * @dev Get borrower profile
     * @param borrower Borrower address
     * @return profile Borrower profile
     */
    function getBorrowerProfile(address borrower) external view returns (BorrowerProfile memory profile) {
        return borrowerProfiles[borrower];
    }
    
    /**
     * @dev Get pool metrics
     * @return metrics Pool metrics
     */
    function getPoolMetrics() external view returns (PoolMetrics memory metrics) {
        return poolMetrics;
    }
    
    /**
     * @dev Get total invested amount for a loan
     * @param loanId Loan ID
     * @return total Total invested amount
     */
    function getTotalInvested(uint256 loanId) external view validLoan(loanId) returns (uint256 total) {
        return _getTotalInvested(loanId);
    }
    
    /**
     * @dev Get investor's share in a loan
     * @param loanId Loan ID
     * @param investor Investor address
     * @return share Investor's share
     */
    function getInvestorShare(uint256 loanId, address investor) external view validLoan(loanId) returns (uint256 share) {
        return investorShares[loanId][investor];
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _getTotalInvested(uint256 loanId) internal view returns (uint256 total) {
        Investment[] memory loanInvestmentsArray = loanInvestments[loanId];
        for (uint256 i = 0; i < loanInvestmentsArray.length; i++) {
            total += loanInvestmentsArray[i].amount;
        }
    }
    
    function _activateLoan(uint256 loanId) internal {
        Loan storage loan = loans[loanId];
        loan.status = LoanStatus.Active;
        loan.startTime = block.timestamp;
        loan.endTime = block.timestamp + loan.duration;
        
        // Transfer loan amount to borrower
        require(usdtToken.transfer(loan.borrower, loan.amount), "Loan transfer failed");
        
        // Update metrics
        poolMetrics.activeLoans++;
        poolMetrics.totalLent += loan.amount;
        _updatePoolMetrics();
        
        emit LoanFunded(loanId, loan.amount, loanInvestments[loanId].length);
    }
    
    function _completeLoan(uint256 loanId) internal {
        Loan storage loan = loans[loanId];
        loan.status = LoanStatus.Repaid;
        
        // Update borrower profile
        borrowerProfiles[loan.borrower].activeLoans--;
        borrowerProfiles[loan.borrower].completedLoans++;
        borrowerProfiles[loan.borrower].totalBorrowed += loan.amount;
        
        // Update metrics
        poolMetrics.activeLoans--;
        _updatePoolMetrics();
        
        emit LoanCompleted(loanId, loan.paidAmount, loan.paidAmount - loan.amount);
    }
    
    function _calculateInvestmentRewards(uint256 investmentId) internal view returns (uint256 rewards) {
        Investment storage investment = investments[investmentId];
        uint256 loanId = investment.loanId;
        Loan storage loan = loans[loanId];
        
        if (loan.status != LoanStatus.Repaid) {
            return 0;
        }
        
        uint256 totalInvested = _getTotalInvested(loanId);
        uint256 interestEarned = loan.paidAmount - loan.amount;
        uint256 platformFee = (interestEarned * platformFeePercentage) / 100;
        uint256 netInterest = interestEarned - platformFee;
        
        rewards = (investment.amount * netInterest) / totalInvested;
    }
    
    function _updatePoolMetrics() internal {
        emit PoolMetricsUpdated(
            poolMetrics.totalLoans,
            poolMetrics.activeLoans,
            poolMetrics.totalInvestments,
            poolMetrics.totalLent
        );
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update loan limits
     * @param _minLoanAmount New minimum loan amount
     * @param _maxLoanAmount New maximum loan amount
     */
    function updateLoanLimits(uint256 _minLoanAmount, uint256 _maxLoanAmount) external onlyOwner {
        require(_minLoanAmount > 0, "Min loan amount must be greater than 0");
        require(_maxLoanAmount > _minLoanAmount, "Max must be greater than min");
        
        minLoanAmount = _minLoanAmount;
        maxLoanAmount = _maxLoanAmount;
    }
    
    /**
     * @dev Update interest rate limits
     * @param _minInterestRate New minimum interest rate
     * @param _maxInterestRate New maximum interest rate
     */
    function updateInterestRateLimits(uint256 _minInterestRate, uint256 _maxInterestRate) external onlyOwner {
        require(_minInterestRate > 0, "Min interest rate must be greater than 0");
        require(_maxInterestRate > _minInterestRate, "Max must be greater than min");
        
        minInterestRate = _minInterestRate;
        maxInterestRate = _maxInterestRate;
    }
    
    /**
     * @dev Update platform fee percentage
     * @param _feePercentage New fee percentage
     */
    function setPlatformFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 10, "Fee percentage too high");
        platformFeePercentage = _feePercentage;
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
     * @dev Update trust matrix scorer
     * @param _trustMatrixScorer New trust matrix scorer address
     */
    function setTrustMatrixScorer(address _trustMatrixScorer) external onlyOwner {
        trustMatrixScorer = _trustMatrixScorer;
    }
    
    /**
     * @dev Update minimum trust scores
     * @param _minTrustScoreForBorrowing New minimum trust score for borrowing
     * @param _minTrustScoreForInvesting New minimum trust score for investing
     */
    function setMinTrustScores(uint256 _minTrustScoreForBorrowing, uint256 _minTrustScoreForInvesting) external onlyOwner {
        minTrustScoreForBorrowing = _minTrustScoreForBorrowing;
        minTrustScoreForInvesting = _minTrustScoreForInvesting;
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
    
    /**
     * @dev Emergency withdrawal of platform fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        
        require(usdtToken.transfer(feeRecipient, balance), "Fee transfer failed");
    }
}

