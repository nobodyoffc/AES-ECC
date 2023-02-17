var aes = require("./aes")
var CryptoJS = require("crypto-js")
var ecc = require("./ecc-ecies")
var secp256k1 = require("./secp256k1")

var key = aes.generateKey()
var iv = aes.iv
var key1 = aes.StringCodeParse(key.toUpperCase())
var secKey = ecc.generateSK()
var pubKey = ecc.generatePK(secKey)

var msg = "This is a plaintext message from alice to bob"
var encMsg = aes.encrypt(msg, key1, iv)
var encKey = ecc.encrypt(pubKey, key)

var decKey = ecc.decrypt(secKey, encKey)
decKey =  aes.StringCodeParse(decKey)
var decMsg = aes.decrypt(encMsg, decKey, iv)
console.log(decMsg)