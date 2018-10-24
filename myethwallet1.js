
// 利用 bip39 随机产生bip32 seed -----------------------------
const bip39 = require('bip39')
// random generate mnemonic
//var mnemonic = bip39.generateMnemonic()
let mnemonic_phrase = "deputy cat imitate open sphere zone"
const seed = bip39.mnemonicToSeedHex(mnemonic_phrase)

// 官方标准可参照 https://iancoleman.io/bip39/
//----------------------------------------------产生 bip32扩展公私钥 -----与官方bip32标准一致------------------
//下面 产生的 bip32 extend key 与 bip32标准一致
const bitcore = require('bitcore-lib');
const eth_private_key = bitcore.HDPrivateKey.fromSeed(seed);
const derivedPubKey = eth_private_key.derive("m/44'/60'/0'/0").hdPublicKey;
const derivedPriKey = eth_private_key.derive("m/44'/60'/0'/0");
console.log('eth mainnet BIP32 Extended Public Key : ', derivedPubKey.toString());
console.log('eth mainnet BIP32 Extended Private Key : ', derivedPriKey.toString());
// eth mainnet BIP32 Extended Public Key :  xpub6FHZSy6ejf9XmsVQNdZzZWuW8a2c9YyRXAvdmSUYUM56uqd9LshX7TXf7XFowchp5dHMBQx9pZ5y4PNrg8r9KAdSXLb3Zk3kQsQkXYCu76G
// eth mainnet BIP32 Extended Private Key :  xprvA2JD3TZkuHbEZPQwGc2zCNxmaYC7k6Fa9x12y44vv1Y833HzoLPGZfDBGFNyvbP1Pky54mv6TfAXqBSeioioKPhsnpueJRdJpv3zVaSd8MZ

// ---------------------------------------------产生 的扩展公私钥与官方 bip32 不一致----------------------------不用-------------
//利用 ethereumjs-wallet 产生的 扩展公私钥与 bip32 标准不一致
const hdkey = require('ethereumjs-wallet/hdkey');
const hdwallet = hdkey.fromMasterSeed(new Buffer(seed, 'hex'));     //这就是一个
console.log("extend prv: ", hdwallet.privateExtendedKey())
console.log("extend pub: ", hdwallet.publicExtendedKey())
// extend prv xprv9s21ZrQH143K4YJSVQZTnHpER65GSLnWsUs6vacwNFoJZBLYtJy5PhjXVzvQkWMWuUjFMNwD9D7PyciqFyf1zw4fFvbPHzTCYKxK2YjZWSZ
// extend pub xpub661MyMwAqRbcH2NubS6U9Rkxy7ukqoWNEhnhiy2YvbLHRyfhRrHKwW41MH4MtR55KzKuS75C2yVjiSYTBWPS2TegvMFR3UwfeTFyro3puvc

// -----------------------------------------------根据 bip44标准生成地址，下面两种方式都没问题---------------------------
const baseDerivePath =  "m/44'/60'/0'/0";
//1. generate bip32 address from seed
const address1 = hdwallet.derivePath(`${baseDerivePath}/1`).getWallet().getChecksumAddressString()
//2. from extendKey
const address11 = hdkey.fromExtendedKey(derivedPubKey.toString()).deriveChild(1).getWallet().getChecksumAddressString()
const address111 = hdkey.fromExtendedKey(derivedPriKey.toString()).deriveChild(1).getWallet().getChecksumAddressString()

console.log("hdkey from seed to address: ", address1);
console.log("hdkey rom bip32ExtendPubkey to address: ", address11);
console.log("hdkey rom bip32ExtendPrikey to address: ", address111);

//---------------------------------------------获取生成地址的公私钥---------------------------------------
//1.利用hdwallet 实例获取
const prv1 = hdwallet.derivePath(`${baseDerivePath}/1`).getWallet().getPrivateKey()
//注意： from extendPUbkey only get pubkey
const prv11 = hdkey.fromExtendedKey(derivedPubKey.toString()).deriveChild(1).getWallet().getPublicKey()
//2.利用工具，不过这个略显麻烦，不用---
var util = require('ethereumjs-util')
var key1 = hdwallet.derivePath("m/44'/60'/0'/0/1")
var address0 = util.pubToAddress(key1._hdkey._publicKey, true)
address0 = util.toChecksumAddress(address1.toString('hex'))
console.log(address0)




