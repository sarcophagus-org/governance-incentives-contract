// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/**
 * @title Collection Contract
 * @notice This contract is responsible for custody of Sarcophagus fees collected 
 * via protocol fees, as well as the distribution of those fees.
 */

//TODO: add events for transactions

contract Collection is Ownable {

    uint public toBeClaimed;
    uint public toBeDistributed;
    mapping(address => uint) public balanceOf;

    event Distribution(address[], uint[]);
    event Claim(address, uint);
    event Withdraw(address, uint);

    IERC20 public immutable token;

    constructor(address _token) {
        token = IERC20(_token);
    }

    /**
     * @notice else{} represents the scenario where tokens have been transfered 
     * to the Collections contract but have not yet beem claimed by voters
     */

    function setDistributionAmount() internal {
        if(toBeClaimed == 0) {
            toBeDistributed = token.balanceOf(address(this));
        } else {
            toBeDistributed = token.balanceOf(address(this)) - toBeClaimed;
        }
    }

    function distribute(address[] memory _to, uint[] memory _amount) public onlyOwner {

        setDistributionAmount();
 
        for (uint i = 0; i < _to.length; i++) {
            toBeDistributed -= _amount[i];
            balanceOf[_to[i]] += _amount[i];
            toBeClaimed += _amount[i];
        }

        emit Distribution(_to, _amount);
    }

    function claim() public returns(uint) {
        require(balanceOf[msg.sender] > 0, "Claim unsuccessful: your balance is 0");
        uint claimAmount = balanceOf[msg.sender];
        balanceOf[msg.sender] = 0;
        toBeClaimed -= claimAmount;
        token.transferFrom(address(this), msg.sender, claimAmount);

        emit Claim(msg.sender, claimAmount);
        return claimAmount;
    }

    function withdraw() public onlyOwner {
        // testing: require( token.balanceOf(address(this)) == balanceOf[address(this)] , "Internal accounting error");
        // testing: require(balanceOf[address(this)] == token.balanceOf(address(this)) - toBeClaimed, "Withdrawing unclaimed tokens");
        require( toBeDistributed > toBeClaimed, "Withdraw unsuccessful: all tokens are claimable by voters");
        uint withdrawAmount = toBeDistributed ;
        toBeDistributed = 0;
        token.transferFrom(address(this), msg.sender, withdrawAmount);

        emit Withdraw(msg.sender, withdrawAmount);
    }
}