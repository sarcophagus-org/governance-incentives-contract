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

    uint public unallocatedRewards;
    uint public claimableByVoters;

    /**
     * @dev Internal accounting for individual rewards claimable by voters
     */
    mapping(address => uint) public balanceOf;

    struct Reward {
        address _address;
        uint _amount;
    }

    event DepositRewards(uint depositAmount);
    event AllocateRewards(Reward[] rewards);
    event ClaimRewards(address _address, uint claimAmount);
    event WithdrawUnallocatedRewards(address _address, uint withdrawAmount);

    error InsufficientContractBalance();
    error NoClaimableReward();
    error NoUnallocatedRewards();

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
     * @dev To keep track of the internal accounting. Called in allocateRewards()
     * and daoWithdraw()
     */
    function updateInternalBalance() internal {
            unallocatedRewards = getContractBalance() - claimableByVoters;
    }

    function getContractBalance() public view returns(uint contractBalance) {
        return token.balanceOf(address(this));
    }

    /**
     * @notice Deposit function for SARCO fees to be distributed as rewards to voters
     * @param depositAmount amount deposited in the contract by msg.sender
     */
    function deposit(uint depositAmount) public {
        require(token.balanceOf(msg.sender) > 0 , "SARCO balance is 0");
        token.transferFrom(msg.sender, address(this), depositAmount);
        updateInternalBalance();
        emit DepositRewards(depositAmount);
    }

    /**
     * @notice Allocates rewards to voters
     * @param rewards Array of structs of voters' addresses and amounts 
     * to be transfered
     */
    function allocateRewards(Reward[] memory rewards) public onlyOwner {
        updateInternalBalance(); 

        uint rewardsSum;
        for (uint i = 0; i < rewards.length; i++) {
            rewardsSum += rewards[i]._amount;
            balanceOf[rewards[i]._address] += rewards[i]._amount;            
        }

        if( unallocatedRewards < rewardsSum ) revert InsufficientContractBalance();

        unallocatedRewards -= rewardsSum;
        claimableByVoters += rewardsSum;

        emit AllocateRewards(rewards);
    }

    /**
     * @notice Enables voters to withdraw their allocated rewards
     * @return claimAmount Reward amount each voter is due
     */
    function claim() public returns(uint) {
        if( balanceOf[msg.sender] == 0 ) revert NoClaimableReward();

        uint claimAmount = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        claimableByVoters -= claimAmount;
        token.transfer(msg.sender, claimAmount);

        emit ClaimRewards(msg.sender, claimAmount);
        return claimAmount;
    }

    /**
     * @notice Withdraw any unallocated rewards by Dao/Owner
     */
    function daoWithdraw() public onlyOwner {
        updateInternalBalance(); 
        if( unallocatedRewards == 0 ) revert NoUnallocatedRewards();

        uint withdrawAmount = unallocatedRewards;
        unallocatedRewards = 0;
    
        token.transfer(msg.sender, withdrawAmount);

        emit WithdrawUnallocatedRewards(msg.sender, withdrawAmount);
    }
}