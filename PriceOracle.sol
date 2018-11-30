pragma solidity 0.4.24;


contract PriceOracle {
    address public oracleAddress;

    constructor (address _oracleAddress) public {
        oracleAddress = _oracleAddress;
    }

    event PriceUpdate (
        string rank,
        string marketCap,
        string price,
        string vol24Hr,
        string perChange1H,
        string perChange1D,
        string perChange7D
    );

    function updatePrice(
        string rank,
        string marketCap,
        string price,
        string vol24Hr,
        string perChange1H,
        string perChange1D,
        string perChange7D
    )
    public
    {
        require(msg.sender == oracleAddress);


        emit PriceUpdate(
            rank,
            marketCap,
            price,
            vol24Hr,
            perChange1H,
            perChange1D,
            perChange7D
        );
    }
}