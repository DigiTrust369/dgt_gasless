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

interface IOrderCore{
    function getOrderInfo(string memory _orderId) external view returns(Order memory);
    function confirmResult(uint256 price, uint256 updateTime) external;
    function setPriceOrder(uint256 price, string memory _symbol) external;
    function getOrderSymbol() external view returns(string memory);
}

contract PriceFeed is Ownable{
    IOrderCore public orderContract = IOrderCore(0x714B3Cb6a12f5fd30dB427D3f7d40cAb1bc638a8);

    address[] public whiteListAddress;
    mapping(address => bool) public isWhiteList ;
    mapping(string => uint256) quote;
    Order[] public listOrder;

    event NewQuote(string indexed symbol, uint256 newPrice, uint256 oldPrice, uint256 updatedAt);

    error NeedsValidPrice();

    constructor() {
        whiteListAddress.push(msg.sender);
        isWhiteList[msg.sender] = true;
    }

    modifier onlyAdmin(){
        require(isWhiteList[msg.sender] == true, "Invalid admin");
        _;
    }

    function setOrderContract(address _orderContract) public onlyOwner{
        orderContract = IOrderCore(_orderContract);
    }

    function addwhiteListAddress(address _admin) public onlyOwner{
        whiteListAddress.push(_admin);
        isWhiteList[_admin] = true;
    }

    function setPrice(string memory symbol, uint256 price, uint256 priceStatus, address _orderContract) public onlyAdmin{
        require(priceStatus > 0, "Invalid price response");
        orderContract = IOrderCore(_orderContract);
        uint256 oldPrice = quote[symbol];
        quote[symbol] = price;

        emit NewQuote(symbol, price, oldPrice, block.timestamp);

        string memory orderSymbol = orderContract.getOrderSymbol();
        if(keccak256(bytes(orderSymbol)) != keccak256(bytes(symbol))){
            return ;
        }

        orderContract.setPriceOrder(price, symbol);
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice(string memory symbol) public view returns (uint256) {
        return quote[symbol];
    }

    // function setPendingOrder(Order memory _order) public{
    //     pendingOrder.push(_order);
    //     orderInfo[_order.orderId] = _order;
    //     orderStatus[_order.orderId] = 0;
    // }

    // function updateOrder(Order memory _order, int status) public{
    //     if(status == 1){
    //         processOrder.push(_order);
    //     }

    //     orderStatus[_order.orderId] = status;
    //     emit UpdateOrderStatus(_order, status, block.timestamp);
    // }

    // function getOrderStatus(string memory order) external view returns(int){
    //     return orderStatus[order];
    // }
}
