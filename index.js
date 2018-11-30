const request = require("request");
const TronWeb = require('TronWeb');
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.shasta.trongrid.io"); // Full node http endpoint
const solidityNode = new HttpProvider("https://api.shasta.trongrid.io"); // Solidity node http endpoint
const eventServer = "https://api.shasta.trongrid.io";

const privateKey = 'b815adfd6ef133d5a878869cb3a2b31f32d4c1481132a71300c3e125be0ab1a1';

const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    privateKey
);

const contract = {
    "PriceOracle.sol:PriceOracle": {
        "address": "",
        "abi": [{
            "constant": false,
            "inputs": [],
            "name": "initUpdate",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }, {
            "constant": false,
            "inputs": [],
            "name": "getPriceData",
            "outputs": [{"name": "", "type": "string"}, {"name": "", "type": "string"}, {
                "name": "",
                "type": "string"
            }, {"name": "", "type": "string"}, {"name": "", "type": "string"}, {
                "name": "",
                "type": "string"
            }, {"name": "", "type": "string"}],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }, {
            "constant": false,
            "inputs": [{"name": "_price", "type": "string"}, {"name": "_rank", "type": "string"}, {
                "name": "_marketCap",
                "type": "string"
            }, {"name": "_vol24H", "type": "string"}, {
                "name": "_perChange1H",
                "type": "string"
            }, {"name": "_perChange1D", "type": "string"}, {"name": "_perChange7D", "type": "string"}],
            "name": "updatePrice",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }, {
            "inputs": [{"name": "_oracleAddress", "type": "address"}],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        }, {
            "anonymous": false,
            "inputs": [{"indexed": false, "name": "price", "type": "string"}, {
                "indexed": false,
                "name": "rank",
                "type": "string"
            }, {"indexed": false, "name": "marketCap", "type": "string"}, {
                "indexed": false,
                "name": "vol24H",
                "type": "string"
            }, {"indexed": false, "name": "perChange1H", "type": "string"}, {
                "indexed": false,
                "name": "perChange1D",
                "type": "string"
            }, {"indexed": false, "name": "perChange7D", "type": "string"}],
            "name": "PriceUpdate",
            "type": "event"
        }, {"anonymous": false, "inputs": [], "name": "InitUpdate", "type": "event"}]
    }
};

const priceOracle = tronWeb.contract(contract["PriceOracle.sol:PriceOracle"].abi, contract["PriceOracle.sol:PriceOracle"].address);

function startEventListener() {
    priceOracle.InitUpdate().watch((err, {result}) => {
        if (err) return console.error('Failed to bind event listener:', err);
        request("https://api.coinmarketcap.com/v2/ticker/1958/", function (err, response, body) {
            if (err) return;
            const json = JSON.parse(body);
            const data = json.data;
            const rank = data.rank;
            const price = data.quotes.USD.price;
            const marketCap = data.quotes.USD.market_cap;
            const vol24H = data.quotes.USD.volume_24h;
            const perChange1H = data.quotes.USD.percent_change_1h;
            const perChange1D = data.quotes.USD.percent_change_24h;
            const perChange7D = data.quotes.USD.percent_change_7d;

            priceOracle.updatePrice(price.toString(), rank.toString(), marketCap.toString(),
                vol24H.toString(), perChange1H.toString(), perChange1D.toString(), perChange7D.toString()).send({
                shouldPollResponse: true,
                callValue: 0
            }).catch(function (err) {
                console.log(err)
            });
        })
    });

    priceOracle.PriceUpdate().watch((err, {result}) => {
        if (err) return console.error('Failed to bind event listener:', err);
        console.log(result);
    });
}

startEventListener();