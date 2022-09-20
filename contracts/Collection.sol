// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/**
 * @title Collection Contract
 * @notice This contract is responsible for custody of Sarcophagus fees collected 
 * via protocol fees, as well as the distribution of those fees.
 */

contract Collection is Ownable {

    uint public totalSupply;
    uint public toBeDistributed;
    uint public toBeClaimed;
    mapping(address => uint) public balanceOf;

    IERC20 public immutable token;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function setContractBalance() internal {
        if(toBeClaimed == 0) {
            balanceOf[address(this)] = token.balanceOf(address(this));
        } else {
            // scenario where tokens have been transfered to the Collections contract but have not yet beem claimed by voters
            balanceOf[address(this)] = token.balanceOf(address(this)) - toBeClaimed; 
        }
    }

    function distribute(address[] memory _to, uint[] memory _shares) public onlyOwner {

        setContractBalance(); // this is the sum of toBeDistributed & toBeClaimed
 
        // get left what needs to be distributed. at the beginning that will be 0
        for (uint i = 0; i < _to.length; i++) {
            _debit(address(this), _shares[i]);
            _credit(_to[i], _shares[i]);
            toBeClaimed += _shares[i];
        }
    }

    function claim() public returns(uint) {
        require(balanceOf[msg.sender] > 0, "Claim unsuccessful: your balance is 0");
        uint claimAmount = balanceOf[msg.sender];
        _debit(msg.sender, claimAmount);
        toBeClaimed -= claimAmount;
        token.transferFrom(address(this), msg.sender, claimAmount);
        return claimAmount;
    }

    // check that the balance of the contract does not include unclaimed tokens
    function withdraw() public onlyOwner {
        // testing: require( token.balanceOf(address(this)) == balanceOf[address(this)] , "Internal accounting error");
        require(balanceOf[address(this)] == token.balanceOf(address(this)) - toBeClaimed, "Withdrawing unclaimed tokens");
        _debit(address(this), balanceOf[address(this)]);
        token.transferFrom(address(this), msg.sender, balanceOf[address(this)]);
    }

    function _credit(address _to, uint _shares) private {
        totalSupply += _shares;
        balanceOf[_to] += _shares;
    }

    function _debit(address _from, uint _shares) private {
        totalSupply -= _shares;
        balanceOf[_from] -= _shares;
    }

    function deposit(uint _amount) public {
        uint shares;
        if (totalSupply == 0) {
            totalSupply = _amount;
        } else {
            shares = (_amount * totalSupply) / token.balanceOf(address(this));
        }

        _credit(address(this), shares);

        token.transferFrom(msg.sender, address(this), _amount);
    }

}