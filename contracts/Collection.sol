// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Collection Contract
 * @notice Responsible for custody of Sarcophagus fees collected 
 * via protocol fees, as well as the distribution of those fees to incentivise 
 * voters on Sarcophagus Dao proposals.
 */
contract Collection is Ownable {
    
    /// @dev internal accounting for amount withdrawable by DAO/Owner
    uint public withdrawableByDao;

    /// @dev internal accounting for total rewards claimable
    uint public claimableByVoters;

    /// @dev internal accounting for individual rewards claimable by voters
    mapping(address => uint) public balanceOf;

    /// @dev Voter rewards input definition 
    struct Reward {
        address _address;
        uint _amount;
    }

    /// @notice Emitted when rewards are allocated to voters
    event Rewards(Reward[]);

    /**
     * @notice Emitted when voter claims the reward
     * @param _address voter address
     * @param claimAmount amount claimed
     */
    event Claim(address _address, uint claimAmount);

    /**
     * @notice Emitted when DAO/Owner claims unallocated rewards
     * @param _address DAO/Owner address
     * @param withdrawAmount amount to withdraw
     */
    event Withdraw(address _address, uint withdrawAmount);

    /// @notice Thrown trying to set more rewards to voters than available in the contract balance
    error InsufficientContractBalance();
    /// @notice Thrown trying to claim rewards when voter balance is 0 
    error InsufficientVoterBalance();
    /// @notice Thrown trying to withdraw some of the claimable tokens by the voters
    error BalanceClaimableByVoters();

    /// @notice instance of SARCO ERC20 token
    IERC20 public immutable token;

    constructor(address _token) {
        token = IERC20(_token);
    }

    /**
     * @notice internal function to set amount withdrawableByDao to the SARCO balance
     * of the contract netted of any claimable fees 
     * @dev needed to keep track of the internal accounting. Called in setRewards()
     * and daoWithdraw()
     */
    function updateInternalBalance() internal {
        if(claimableByVoters == 0) {
            withdrawableByDao = token.balanceOf(address(this));
        } else {
            withdrawableByDao = token.balanceOf(address(this)) - claimableByVoters;
        }
    }

    /**
     * @notice allocates rewards to voters
     * @param rewards array of structs that hold info on voters addresses and amounts 
     * to be transfered
     */
    function setRewards(Reward[] memory rewards) public onlyOwner {
        updateInternalBalance(); 

        uint rewardsSum;
        for (uint i = 0; i < rewards.length; i++) {
            rewardsSum += rewards[i]._amount;
        }
        if( withdrawableByDao < rewardsSum ) revert InsufficientContractBalance();

        for (uint i = 0; i < rewards.length; i++) {
            withdrawableByDao -= rewards[i]._amount;
            balanceOf[rewards[i]._address] += rewards[i]._amount;
            claimableByVoters += rewards[i]._amount;
        }

        emit Rewards(rewards);
    }

    /**
     * @notice enables voters to withdraw their allocated voting incentives
     * @return claimAmount the incentive amount each voter is due
     */
    function claim() public returns(uint) {
        if( balanceOf[msg.sender] == 0 ) revert InsufficientVoterBalance();

        uint claimAmount = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        claimableByVoters -= claimAmount;
        token.transfer(msg.sender, claimAmount);

        emit Claim(msg.sender, claimAmount);
        return claimAmount;
    }

    /**
     * @notice withdraw function for the Dao/Owner for any unallocated rewards
     */
    function daoWithdraw() public onlyOwner {
        updateInternalBalance(); 

        if( withdrawableByDao <= claimableByVoters ) revert BalanceClaimableByVoters();

        uint withdrawAmount = withdrawableByDao ;
        withdrawableByDao = 0;
    
        token.transfer(msg.sender, withdrawAmount);

        emit Withdraw(msg.sender, withdrawAmount);
    }
}