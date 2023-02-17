var secp256k1 = require("./secp256k1")
var aes = require("./aes")
const CryptoJS = require("crypto-js")
const kbytes = 32

function generateSK() {
    return secp256k1.rnd()
}

function generatePK(sk) {
    return secp256k1.mulG(sk)
}

function SK2Bytes(sk) {
    return secp256k1.toBytes(sk)
}

function PK2Bytes(pk) {
    var x = secp256k1.toBytes(pk[0])
    var y = secp256k1.toBytes(pk[1])
    return x.concat(y)
}

function Bytes2Key(bytes) {
    return secp256k1.setBytes(bytes)
}


function encrypt(pub, msg) {
    var r = secp256k1.rnd()
    //var r = secp256k1.uint256("123456789", 16)
    var R = secp256k1.mulG(r)
    var P = secp256k1.mulP(pub, r)
    var s = P[0]
    var k = CryptoJS.SHA256(secp256k1.Bytes2Hex(secp256k1.toBytes(s))).toString()
    var ke = k.slice(0,kbytes)
    var km = k.slice(kbytes,2*kbytes)
    var kee = StringCodeParse(ke.toUpperCase())

    var c = aes.encrypt(msg, kee, "30313233343536373839414243444546")

    var d = CryptoJS.SHA256(km+c).toString()

    console.log(km+c)
    console.log("d")
    console.log(d)

    var cypher = secp256k1.toBytes(R[0])
    cypher = cypher.concat(secp256k1.toBytes(R[1]))
    cypher = cypher.concat(secp256k1.Hex2Bytes(d))
    cypher = cypher.concat(StringToHex(c.toString()))

    return cypher
}

function decrypt(prv, cyph) {
    var Rbytes = cyph.slice(0,64)
    var d = cyph.slice(64,96)
    var c = cyph.slice(96)

    var R = secp256k1.setBytes(Rbytes)
    var P = secp256k1.mulP(R, prv)

    var s = P[0]
    var k = CryptoJS.SHA256(secp256k1.Bytes2Hex(secp256k1.toBytes(s))).toString()
    var ke = k.slice(0,kbytes)
    var km = k.slice(kbytes,2*kbytes)
    var kee = StringCodeParse(ke.toUpperCase())


    var d0 = secp256k1.setBytes(d)
    var d1buf = CryptoJS.SHA256(secp256k1.Bytes2Hex(secp256k1.Hex2Bytes(km).concat(c))).toString()
    var d1 = secp256k1.uint256(d1buf, 16)

    if(d0.cmp(d1)==0) {
        var msg = aes.decrypt(secp256k1.Bytes2Hex(c), kee, "30313233343536373839414243444546")
        return msg
    } else {
        return null
    }

    
}

function StringToHex(bytes) {   //string转hex
    var uint8Array = new Array()
    var buff = new Uint8Array(bytes.length)
    var hexABC = "0123456789ABCDEF"
    var hexabc = "0123456789abcdef"

    var i, j = 0
    var point = 0
    for (i = 0; i < bytes.length; i++) {

        for (j = 0; j < 16; j++) {
            if (bytes[i] == hexABC[j]) {
                buff[i] = j
                break
            }
            else if (bytes[i] == hexabc[j]) {
                buff[i] = j
                break
            }
            if (j == 15) {
                buff[i] = 0
            }//超过f的字符都视为0
        }
    }
    for (i = 0; i < bytes.length / 2; i++) {
        uint8Array[i] = buff[point] * 16 + buff[point + 1]
        point += 2
    }
    return uint8Array
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

exports.generateSK = generateSK
exports.generatePK = generatePK
exports.encrypt = encrypt
exports.decrypt = decrypt

exports.SK2Bytes = SK2Bytes
exports.PK2Bytes = PK2Bytes
exports.Bytes2Key = Bytes2Key
exports.StringCodeParse = StringCodeParse
exports.StringToHex = StringToHex




