const Web3 = require('web3');
const config = require('./config');
const eth_cpb_service = require('./ethereum_cpb_service');


const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));
const cpb = new web3.eth.Contract(config.ropsten.cpbAbi, config.ropsten.cpbAddress);

const cpbService = new eth_cpb_service(web3, cpb);

// send cpb to someAddress
cpbService.sendCpb(config.ropsten.cpbAddress, config.ropsten.privateKey, config.ropsten.userAccount, config.ropsten.addressTo, (100000000000000000000).toString());


cpbService.getEvents();


