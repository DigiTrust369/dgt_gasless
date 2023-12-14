// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/access/Ownable.sol";

struct Order{
    address challengeAddress;
    string symbol;
    uint256 side;
    uint256 startPrice;
    uint256 endPrice;
    uint256 openAt;
    uint256 closeAt;
    uint256 amount;
    uint256 expectedAmount;
    uint256 winAmount;
    uint256 duration;
}

contract OrderContractV2 is Ownable{
    uint256 public feeConfig;

    address public feeWallet;
    address[] public whiteListAddress;

    mapping(address => uint256) public orderStatus;
    mapping(address => Order) public orderInfo;
    mapping(address => address) public orderOwner;
    mapping(address => uint256) public balanceOrder;
    mapping(address => bool) public isWhiteList;

    event OpenOrder(Order indexed _order, address owner, uint256 openAt);
    event ProcessingOrder(Order indexed _order, address owner, uint256 createdAt);
    event CloseOrder(Order indexed _order, address owner, uint256 createdAt);
    event ClaimProfit(address sender, Order indexed _order, uint256 amount, uint256 createdAt);
    event PayToPool(Order indexed _order, uint amount, address feeWallet, uint256 createdAt);
    event ChargeFee(Order indexed _order, address _feeWallet, uint256 createdAt);
    event WithDraw(address indexed _sender, address indexed _receiver, uint256 amount, uint256 createdAt);

    constructor(address _feeWallet, Order memory _order, address _owner, uint256 _feeConfig) payable{
        uint256 requireBalance = (_order.amount + _feeConfig) * 10 ** 18;
        require(msg.value >= requireBalance , "Invalid balance to create order");
        balanceOrder[address(this)] = requireBalance;
        
        orderStatus[address(this)] = 0; // 0 is pending
        orderInfo[address(this)] = _order;
        orderOwner[address(this)] = _owner;
        
        feeWallet = _feeWallet;
        feeConfig = _feeConfig;
        whiteListAddress.push(msg.sender);
        isWhiteList[msg.sender] = true;

        emit OpenOrder(_order, msg.sender, block.timestamp);
    }

    modifier onlyAdmin(){
        require(isWhiteList[msg.sender] == true, "Invalid admin order contract");
        _;
    }

    function addwhiteListAddress(address _admin) public onlyOwner{
        whiteListAddress.push(_admin);
        isWhiteList[_admin] = true;
    }

    function setFeeWallet(address _feeWallet) external onlyAdmin{
        feeWallet = _feeWallet;
    }

    function setFeeConfig(uint256 _feeConfig) external onlyAdmin{
        feeConfig = _feeConfig;
    }

    function setPriceOrder(uint256 price, string memory _symbol) external onlyAdmin{
        require(orderStatus[address(this)] == 0, "Invalid order status");
        require(keccak256(bytes(orderInfo[address(this)].symbol)) == keccak256(bytes(_symbol)), "Invalid symbol");
        
        orderInfo[address(this)].startPrice = price;
        orderInfo[address(this)].openAt = block.timestamp;
        orderInfo[address(this)].closeAt = block.timestamp + orderInfo[address(this)].duration;
        orderStatus[address(this)] = 1; //1 = processed order
        
        emit ProcessingOrder(orderInfo[address(this)], orderOwner[address(this)], block.timestamp);
    }

    function getOrderInfo(address _order) external view returns(Order memory){
        return orderInfo[_order];
    }

    function confirmResult(uint256 price, uint256 updateTime, uint256 _amount) external onlyAdmin{
        require(orderStatus[address(this)] != 2, "Invalid order status");
        
        orderInfo[address(this)].endPrice = price;
        orderInfo[address(this)].closeAt = updateTime;
        orderInfo[address(this)].expectedAmount = _amount;
        orderInfo[address(this)].winAmount = _amount;
        orderStatus[address(this)] = 2; // 2 = confirm order
        
        emit CloseOrder(orderInfo[address(this)], orderOwner[address(this)], block.timestamp);
    }

    function chargeFee() external onlyAdmin{
        require(balanceOrder[address(this)] > (feeConfig * 10 ** 18), "invalid balance to claim fee");

        payable(feeWallet).transfer(feeConfig * 10 ** 18);
        balanceOrder[address(this)] -= (feeConfig * 10 ** 18);

        emit ChargeFee(orderInfo[address(this)], feeWallet, block.timestamp);
    }

    function withDraw(address _receiver) external onlyAdmin{
        uint256 amount = orderInfo[address(this)].amount * 10 ** 18;

        require(_receiver == feeWallet || _receiver == orderOwner[address(this)], "invalid receiver");
        require(orderStatus[address(this)] == 2, "invalid order statis to withdraw");
        require(balanceOrder[address(this)] >= amount, "invalid balance to withdraw");

        payable(_receiver).transfer(amount);
        balanceOrder[address(this)] -= amount;

        emit WithDraw(msg.sender, _receiver, amount, block.timestamp);
    }

    // function claimProfit() public payable onlyAdmin{
    //     uint256 amount = orderInfo[address(this)].amount;
    //     require(orderStatus[address(this)] == 2, "invalid order status to withdraw");
    //     require(balanceOrder[address(this)] >= (amount * 10 ** 18), "Invalid balance to withdraw");

    //     address _owner = orderOwner[address(this)];
    //     payable(_owner).transfer(amount * 10 ** 18);

    //     emit ClaimProfit(_owner, orderInfo[address(this)], amount, block.timestamp);
    // }

    // function payToPool() public payable onlyAdmin{
    //     uint256 amount = orderInfo[address(this)].amount;
    //     require(balanceOrder[address(this)] >= (amount * 10**18), "Invalid balance to pay to pool");
    //     require(orderStatus[address(this)] == 2, "Invalid order status to withdraw");
        
    //     payable(feeWallet).transfer(amount * 10**18);
    //     balanceOrder[address(this)] -= (amount * 10**18);
        
    //     emit PayToPool(orderInfo[address(this)], amount, feeWallet, block.timestamp);
    // }

    function getBalance() external view returns(uint256){
        return address(this).balance;
    }

    function getOrderSymbol() external view returns(string memory){
        return orderInfo[address(this)].symbol;
    }
}