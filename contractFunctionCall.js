const Tx = require('ethereumjs-tx');
const Rx = require('rxjs/Rx')
const config = require('./config')

class ethCpbService {

    constructor(web3, cpbInstance){
        this.web3 = web3;
        this.cpb = cpbInstance;
        this.contractEvents = new Rx.Subject()
    }

    async sendCpb(coinAddress_, privateKey_, from_, to_, value_) {
        let nounce_ = await this.web3.eth.getTransactionCount(from_);
        let gasPrice_ = await this.web3.eth.getGasPrice();
        let functionSig = this.web3.eth.abi.encodeFunctionSignature({
            name: 'transfer',
            type: 'function',
            inputs: [{
                type: 'address',
                name: '_to'
            },{
                type: 'uint256',
                name: '_value'
            }]
        });
        let rawTxData = functionSig 
            + '000000000000000000000000' + to_.substr(2)
            + ('0000000000000000000000000000000000000000000000000000000000000000' 
                + this.web3.utils.toHex(value_).toString('hex').substr(2))
                .substr(-64);

        let gasTxUsed = await this.web3.eth.estimateGas({
            to: to_,//换成合约地址报错，
            data: rawTxData
        });
        let gasEvmUsed = await this.cpb.methods.transfer(to_, value_).estimateGas({from:from_});
        //let gasTotalUsed = this.web3.utils.toHex(gasTxUsed + gasEvmUsed).toString('hex');

        let rawTx = {
            nonce: this.web3.utils.toHex(nounce_).toString('hex'),
            gasPrice: this.web3.utils.toHex(gasPrice_).toString('hex'),
            gasLimit: this.web3.utils.toHex(gasTxUsed + gasEvmUsed).toString('hex'),
            from: from_, 
            to: coinAddress_,  
            value: '0x00',
            data: rawTxData
        }
        console.log("-----------rawTx------------\n", rawTx);

        let tx = new Tx(rawTx);
        tx.sign(Buffer.from(privateKey_, 'hex'));
        let serializedTx = tx.serialize();
        await this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
            if (err) {
                console.log(err);
            }else{
                console.log("-----------hash of this TX is-----------\n   ", hash);
            }
        });

    }

    getEvents() {
        this.cpb.events.allEvents(function(error, event){ 
            console.log('---------------event--------------\n', event); 
            this.contractEvents.next(event)
        })
    }

}

module.exports = ethCpbService;


