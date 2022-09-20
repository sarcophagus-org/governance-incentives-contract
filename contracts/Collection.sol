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
    mapping(address => uint) public balanceOf;

    IERC20 public immutable token;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function deposit(uint _amount) public {
        uint shares;
        if (totalSupply == 0) {
            totalSupply = _amount;
        } else {
            shares = (_amount * totalSupply) / token.balanceOf(address(this));
        }

        _mint(address(this), shares);

        token.transferFrom(msg.sender, address(this), _amount);
    }

    function getContractBalance() view public returns(uint){
        balanceOf[address(this)] = token.balanceOf(address(this));
        return(balanceOf[address(this)]);
    }

    function distribute(address[] memory _to, uint[] _shares) public onlyOwner {

        getContractBalance();

        for (uint i = 0; i < _to.length; i++) {
            _debit(msg.sender, _shares[i]);
            _credit(_to[i], _shares[i]);
        }
    }

    function claim() public {
        require(balanceOf[msg.sender] > 0, "Claim unsuccessful: balance is 0");
        uint claimAmount = balanceOf[msg.sender];
        _debit(msg.sender, claimAmount);
        token.transferFrom(address(this), msg.sender, claimAmount);
    }

    function withdraw() public onlyOwner {
        _debit(msg.sender, balanceOf[msg.sender]);
        token.transferFrom(address(this), msg.sender, balanceOf[msg.sender]);
    }

    function _credit(address _to, uint _shares) private {
        totalSupply += _shares;
        balanceOf[_to] += _shares;
    }

    function _debit(address _from, uint _shares) private {
        totalSupply -= _shares;
        balanceOf[_from] -= _shares;
    }

}