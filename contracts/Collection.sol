// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Collection Contract
 * @notice Responsible for custody of Sarcophagus fees collected 
 * via protocol fees, as well as the distribution of those fees to reward
 * and incentivise voters on Sarcophagus Dao proposals.
 */
contract Collection is Ownable {
    /**
     * @dev Internal accounting for amount withdrawable by DAO/Owner
     */    
    uint public withdrawableByDao;

    /**
     * @dev Internal accounting for total rewards claimable by voters
     */
    uint public claimableByVoters;

    /**
     * @dev Internal accounting for individual rewards claimable by voters
     */
    mapping(address => uint) public balanceOf;

    /**
     * @dev Voter reward definition
     */
    struct Reward {
        address _address;
        uint _amount;
    }

    /**
     * @notice Emitted when rewards are allocated to voters
     */
    event Rewards(Reward[]);

    /**
     * @notice Emitted when voter claims the reward
     * @param _address Voter address
     * @param claimAmount Amount claimed
     */
    event Claim(address _address, uint claimAmount);

    /**
     * @notice Emitted when DAO/Owner claims unallocated rewards
     * @param _address DAO/Owner address
     * @param withdrawAmount Amount to withdraw
     */
    event Withdraw(address _address, uint withdrawAmount);

    /**
     * @notice Thrown trying to set more rewards to voters than available in contract balance
     */
    error InsufficientContractBalance();

    /**
     * @notice Thrown trying to claim rewards when voter balance is 0 
     */
    error InsufficientVoterBalance();

    /**
     * @notice Thrown trying to withdraw the claimable rewards allocated to voters 
     */
    error BalanceClaimableByVoters();

    /**
     * @notice Instance of SARCO ERC20 token
     */
    IERC20 public immutable token;

    constructor(address _token) {
        token = IERC20(_token);
    }

    /**
     * @notice Internal function to set amount withdrawableByDao to the SARCO balance
     * of the contract, netting any claimable rewards by voters
     * @dev To keep track of the internal accounting. Called in setRewards()
     * and daoWithdraw()
     */
    function updateInternalBalance() internal {
        if(claimableByVoters == 0) {
            withdrawableByDao = getContractBalance();
        } else {
            withdrawableByDao = getContractBalance() - claimableByVoters;
        }
    }

    /**
     * @notice Gets contract balance
     * @return contractBalance SARCO balance of Collection contract
     */
    function getContractBalance() public view returns(uint contractBalance) {
        return token.balanceOf(address(this));
    }

    /**
     * @notice Allocates rewards to voters
     * @param rewards Array of structs of voters' addresses and amounts 
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
     * @notice Enables voters to withdraw their allocated rewards
     * @return claimAmount Reward amount each voter is due
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
     * @notice Withdraw any unallocated rewards by Dao/Owner
     */
    function daoWithdraw() public onlyOwner {
        if( withdrawableByDao <= claimableByVoters ) revert BalanceClaimableByVoters();

        uint withdrawAmount = withdrawableByDao ;
        withdrawableByDao = 0;
    
        token.transfer(msg.sender, withdrawAmount);

        emit Withdraw(msg.sender, withdrawAmount);
    }
}