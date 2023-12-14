// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/access/Ownable.sol";

struct Order{
    string challengeId;
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

interface IERC20 {
    function balanceOf(address owner) external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 value) external returns (bool);

    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external returns (bool);
    function adminTransferFrom(address from, address to, uint tokens) external returns(bool success);
}

contract OrderContract is Ownable{
    IERC20 public fxceToken = IERC20(0xDdf9B62DbfbDd5D473bB89295843915D7F21cFed);

    address public feeWallet;
    mapping(address => uint256) public orderStatus;
    mapping(address => Order) public orderInfo;
    mapping(address => address) public orderOwner;

    address[] public whiteListAddress;
    mapping(address => bool) public isWhiteList;

    event ProcessingOrder(Order indexed _order, address owner, uint256 createdAt);
    event CloseOrder(Order indexed _order, address owner, uint256 createdAt);
    event ClaimProfit(address sender, Order indexed _order, uint256 amount, uint256 createdAt);
    event PayToPool(Order indexed _order, uint amount, address feeWallet, uint256 createdAt);

    constructor(address _fxceToken, address _feeWallet, Order memory _order, address _owner, address _priceFeed){
        orderStatus[address(this)] = 0; // 0 is pending
        orderInfo[address(this)] = _order;
        orderOwner[address(this)] = _owner;
        fxceToken = IERC20(_fxceToken);
        feeWallet = _feeWallet;
        whiteListAddress.push(msg.sender);
        whiteListAddress.push(_priceFeed);
        isWhiteList[msg.sender] = true;
        isWhiteList[_priceFeed] = true;
    }

    modifier onlyAdmin(){
        require(isWhiteList[msg.sender] == true, "Invalid admin order contract");
        _;
    }

    function depositOrder(address _owner) public onlyAdmin{
        uint256 _amount = orderInfo[address(this)].amount;
        fxceToken.adminTransferFrom(_owner, address(this), _amount * 10**18);
    }

    function addwhiteListAddress(address _admin) public onlyOwner{
        whiteListAddress.push(_admin);
        isWhiteList[_admin] = true;
    }

    function setFeeWallet(address _feeWallet) external onlyAdmin{
        feeWallet = _feeWallet;
    }

    function setFXCEToken(address _fxceToken) external onlyAdmin{
        fxceToken = IERC20(_fxceToken);
    }

    function setPriceOrder(uint256 price, string memory _symbol) external onlyAdmin{
        require(orderStatus[address(this)] == 0, "Invalid order status");
        require(keccak256(bytes(orderInfo[address(this)].symbol)) == keccak256(bytes(_symbol)), "Invalid symbol");
        orderInfo[address(this)].startPrice = price;
        orderInfo[address(this)].openAt = block.timestamp;
        orderStatus[address(this)] = 1; //1 = processed order
        emit ProcessingOrder(orderInfo[address(this)], orderOwner[address(this)], block.timestamp);
    }

    // function addPendingOrder(Order memory _order, address _owner) external onlyOwner{
    //     require(isWhiteList[msg.sender] == true, "Invalid admin address");
    //     orderOwner[_order.orderId] = _owner;
    //     orderStatus[_order.orderId] = 0;
    //     orderInfo[_order.orderId] = _order;
    //     fxceToken.transferFrom(msg.sender, address(this), _order.amount);
    //     emit AddPendingOrder(_order, block.timestamp);
    // }

    function getOrderInfo(address _order) external view returns(Order memory){
        return orderInfo[_order];
    }

    // function updateProcessOrder(string[] memory _listOrder, uint256 _startPrice, uint256 updateTime) external {
    //     if(_listOrder.length == 0){
    //         return;
    //     }

    //     // for(uint256 i = 0; i < _listOrder.length; i++){
    //     //     orderStatus[_listOrder[i]] = 1;
    //     //     orderInfo[_listOrder[i]].startPrice = _startPrice;
    //     //     orderInfo[_listOrder[i]].openAt = updateTime;
    //     // }
    // }

    function confirmResult(uint256 price, uint256 updateTime) external onlyAdmin{
        orderInfo[address(this)].endPrice = price;
        orderInfo[address(this)].closeAt = updateTime;
        orderStatus[address(this)] = 2;
        emit CloseOrder(orderInfo[address(this)], orderOwner[address(this)], block.timestamp);
        // if(listProcessedOrder.length == 0){
        //     return;
        // }

        // for(uint256 i = 0 ; i < listProcessedOrder.length; i++){
        //     orderStatus[listProcessedOrder[i].orderId] = 2;
        //     orderInfo[listProcessedOrder[i].orderId].endPrice = price;
        //     orderInfo[listProcessedOrder[i].orderId].closeAt = updateTime;
        //     isOrderExpire[listProcessedOrder[i].orderId] = true;
        // }

    }

    function claimProfit(address sender, uint256 amount) public onlyAdmin{
        /*
            0 = long | 1 = short
        */
        require(fxceToken.balanceOf(address(this)) > amount, "Invalid balance to withdraw");
        fxceToken.approve(address(this), amount);
        fxceToken.adminTransferFrom(address(this), sender, amount * 10**18);
        emit ClaimProfit(sender, orderInfo[address(this)], amount, block.timestamp);
    }

    function payToPool(uint256 amount) public onlyAdmin{
        require(fxceToken.balanceOf(address(this)) > amount, "Invalid balance to pay");
        fxceToken.approve(address(this), amount);
        fxceToken.adminTransferFrom(address(this), feeWallet, amount * 10**18);
        emit PayToPool(orderInfo[address(this)], amount, feeWallet, block.timestamp);
    }

    function getBalance(address req) external view returns(uint256){
        return fxceToken.balanceOf(req);
    }

    function getOrderSymbol() external view returns(string memory){
        return orderInfo[address(this)].symbol;
    }

    // function getLengthListOrder(int status) external view returns(uint256){
    //     if(status == 0){
    //         return listPendingOrder.length;
    //     }

    //     return listProcessedOrder.length;
    // }
}