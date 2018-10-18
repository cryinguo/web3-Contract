/**
 * * 与已部署的合约 metacoin 交互，通过线下签名交易发送回链上的方式，执行 sendCoin 
 * 需要注意的有：
 *      1.函数签名的计算
 *      2.nounce的获取
 *      PS: 在web3_test2.js 的基础上，改用 async await 实现，看起来舒服多了    
 */
var Web3 = require('web3');
let web3;


if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/b53f4131a6bf44b6ace760bb97c3e98d"));
    console.log("-1-host of the provider is : \n    ",  web3.currentProvider.host);
}


//与已经部署的合约交互
let address = "0x478d96B964273315f5CFBa4cD98708eaD369DA60";
let abi =[ { "constant": false, "inputs": [ { "name": "addr", "type": "address" } ], "name": "getBalance", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "receiver", "type": "address" }, { "name": "amount", "type": "uint256" } ], "name": "sendCoin", "outputs": [ { "name": "sufficient", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_to", "type": "address" }, { "indexed": false, "name": "_value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" } ];
let metacoin = new web3.eth.Contract(abi, address);


//因为不同的 async 函数之间也是异步执行，所以干脆只写一个 ascync func
let MetaCoin = async function() {
    // 1.输出账户余额
    await web3.eth.getBalance("0xb445c062dd13352dd434a1820aba76f90ac8ad1e",function(err, balance){
        console.log("-2-balance of account1 is\n     %f ether:", web3.utils.fromWei(balance) )
    });

    //2.输出账户 nounce
    let nounce_;
    await web3.eth.getTransactionCount("0xb445c062dd13352dd434a1820aba76f90ac8ad1e", function(err, noun){
        nounce_ =  web3.utils.toHex(noun).toString('hex'); 
    });
    console.log("-3-nounce of this account is:\n    ",nounce_);

    //3.获取 function signature
    let funcsig = web3.eth.abi.encodeFunctionSignature('sendCoin(address,uint256)');
    console.log("-4-the sig of function is : \n    ", funcsig);

    await metacoin.methods.getBalance("0xb445c062dd13352dd434a1820aba76f90ac8ad1e").call(function(err,balance){
        console.log("-5-token of address1 is : \n    ",  balance);    
    });
    await metacoin.methods.getBalance("0x6eee169148521be772bccc986ed7c36c39d9bf25").call(function(err,balance){
        console.log("-6-token of address1 is : \n    ",  balance);    
    });

    //4.离线签名一个交易
    var Tx = require('ethereumjs-tx');
    var privateKey = new Buffer('CED3BDAE48F6D798CE425C01F1457117A7E967559E997D0D81D9500BE3254903', 'hex')

    var rawTx = {
        nonce: nounce_,
        gasPrice: '0x2540be400',
        gasLimit: '0x274820',
        from: '0xb445c062dd13352dd434a1820aba76f90ac8ad1e', //from 
        to: '0x478d96B964273315f5CFBa4cD98708eaD369DA60',   //合约地址(调用合约send函数)
        value: '0x00',
        //data:txData,
        //(函数和参数信息)
        data: '0x90b98a110000000000000000000000006eee169148521be772bccc986ed7c36c39d9bf250000000000000000000000000000000000000000000000000000000000000064'   
    }

    var tx = new Tx(rawTx);
    tx.sign(privateKey);

    var serializedTx = tx.serialize();

    //5.将签名的交易发送出去
    await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
        if (err) {
            console.log(err);
        }else{
            console.log("-7-hash of this TX is :\n   ", hash);
        }
    });
}
MetaCoin();
