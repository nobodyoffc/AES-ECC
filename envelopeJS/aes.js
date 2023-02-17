var CryptoJS = require("crypto-js")

function generateKey() {
    var str = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F']
    var res = ""
    for (var i=0;i<32;i++) {
        var id = Math.ceil(Math.random()*15)
        res += str[id]
    }
    return res
}

function encrypt(plaintext, key, iv) {
    var keyWord = CryptoJS.enc.Hex.parse(key)
    var ivWord = CryptoJS.enc.Hex.parse(iv)
    var ec = CryptoJS.AES.encrypt(plaintext, keyWord, {
        iv:ivWord,
        mode:CryptoJS.mode.CBC,
        padding:CryptoJS.pad.Pkcs7
    })
    return ec.ciphertext.toString()
}

function decrypt(ciphertext, key, iv) {
  var cypher = CryptoJS.format.Hex.parse(ciphertext)
  var keyWord = CryptoJS.enc.Hex.parse(key)
  var ivWord = CryptoJS.enc.Hex.parse(iv)
    var pt = CryptoJS.AES.decrypt(cypher, keyWord, {
        iv:ivWord,
        mode:CryptoJS.mode.CBC,
        padding:CryptoJS.pad.Pkcs7
    })
    return CryptoJS.enc.Utf8.stringify(pt)
}

function StringCodeParse(str) {
    var out = ""
    for (let i = 0; i < str.length; i++) {
        var buf = str.charCodeAt(i).toString(16)
        if(buf.length==1) {
            buf = "0"+buf
        }
        out = out + str.charCodeAt(i).toString(16)
    }
    return out
}

var iv = "30313233343536373839414243444546";

exports.encrypt = encrypt
exports.decrypt = decrypt
exports.generateKey = generateKey
exports.StringCodeParse = StringCodeParse
exports.iv = iv
