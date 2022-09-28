// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Collection Contract
 * @notice This contract is responsible for custody of Sarcophagus fees collected 
 * via protocol fees, as well as the distribution of those fees to incentivise 
 * voters on Sarco Dao proposals.
 */

contract Collection is Ownable {

    uint public withdrawableByDao;
    uint public claimableByVoters;
    mapping(address => uint) public balanceOf;

    struct Reward {
        address _address;
        uint _amount;
    }

    event Rewards(Reward[]);
    event Claim(address, uint);
    event Withdraw(address, uint);

    error InsufficientBalance();
    error BalanceClaimableByVoters();

    IERC20 public immutable token;

    constructor(address _token) {
        token = IERC20(_token);
    }

    /**
     * @notice internal function to set amount withdrawableByDao to the SARCO balance
     * of the contract netted on any claimable fees 
     * @dev needed to keep track of the internal accounting and called in setRewards()
     * and withdraw()
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
     * @param rewards array of structs that holds info on voters addresses and amounts 
     * to be transfered
     */
    function setRewards(Reward[] memory rewards) public onlyOwner {
        updateInternalBalance(); 

        uint rewardsSum;
        for (uint i = 0; i < rewards.length; i++) {
            rewardsSum += rewards[i]._amount;
        }
        if( withdrawableByDao < rewardsSum ) revert InsufficientBalance();

        for (uint i = 0; i < rewards.length; i++) {
            withdrawableByDao -= rewards[i]._amount;
            balanceOf[rewards[i]._address] += rewards[i]._amount;
            claimableByVoters += rewards[i]._amount;
        }

        emit Rewards(rewards);
    }

    /**
     * @notice enables voters to withdraw their voting incentives
     * @return claimAmount the incentive amount each voter is due
     */
    function claim() public returns(uint) {
        if( balanceOf[msg.sender] == 0 ) revert InsufficientBalance();

        uint claimAmount = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        claimableByVoters -= claimAmount;
        token.transfer(msg.sender, claimAmount);

        emit Claim(msg.sender, claimAmount);
        return claimAmount;
    }

    /**
     * @notice withdraw function for the Dao for any unallocated rewards
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