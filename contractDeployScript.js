const Web3 = require('web3');
const solc = require('solc');
const fs = require('fs');
const path = require('path');
const Tx = require('ethereumjs-tx');

const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));
const USER_ACCOUNT = '0xb445c062dd13352dd434a1820aba76f90ac8ad1e';
const PRIVATE_KEY = 'CED3BDAE48F6D798CE425C01F1457117A7E967559E997D0D81D9500BE3254903';

async function send( contractData,) {
    let nounce_ = await web3.eth.getTransactionCount(USER_ACCOUNT);
    let gasPrice_ = await web3.eth.getGasPrice();
    let gasUsed = await contractData.estimateGas({from: USER_ACCOUNT});

    let rawTx = {
        nonce: nounce_,
        gasPrice: web3.utils.toHex(gasPrice_).toString('hex'),
        gasLimit: web3.utils.toHex(gasUsed).toString('hex'),
        //from: USER_ACCOUNT, 
        // to: '',  
        // value: '',
        data: contractData.encodeABI()
    }
    //console.log("-----------rawTx------------\n", rawTx);

    let tx = new Tx(rawTx);
    tx.sign(Buffer.from(PRIVATE_KEY, 'hex'));
    let serializedTx = tx.serialize();
    return await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    
}


//use contractName to deploy different contract 
//use contractArgs to deploy different erc20 token contract 
//return an instance of TokenContract
async function deploy(contractName, contractArgs) {
    const contractPath = path.resolve(__dirname, 'contracts', `${contractName}.sol`)
    const source = fs.readFileSync(contractPath, 'UTF-8');
    const solcOutput = solc.compile(source, 1).contracts[`:${contractName}`];
    let abi = solcOutput.interface;
    let bin = solcOutput.bytecode;
    let contract = new web3.eth.Contract(JSON.parse(abi));

    let handle = await send(
        contract.deploy({data: "0x" + bin, arguments: contractArgs}) );
    
    //console.log(handle)
    console.log(`${contractName} deployed at address ${handle.contractAddress}`);
    return new web3.eth.Contract(JSON.parse(abi), handle.contractAddress);
}


async function getInstance() {
    let XUSD = await deploy("TokenContract", [1e11, "CoinPool XUSD", "xusd", 6])
    XUSD.methods.totalSupply().call().then(console.log)
}

getInstance();