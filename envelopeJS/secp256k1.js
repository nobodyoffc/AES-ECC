(function () {
    if (typeof module !== 'undefined') {
        BN = module.require('bn.js')
        randomBytes = module.require('crypto').randomBytes
    } else {
        // bn.js must have been included by the main html file
        randomBytes = length => window.crypto.getRandomValues(new Uint8Array(length))
        window.Secp256k1 = exports = {}
    }

    function uint256(x, base) {
        return new BN(x, base)
    }

    function rnd() {
        return uint256(randomBytes(32)).umod(P)//TODO red
    }

    const A  = uint256(0)
    const B  = uint256(7)
    const GX = uint256("79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798", 16)
    const GY = uint256("483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8", 16)
    const P  = uint256("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F", 16)
    const N  = uint256("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", 16)
    //const RED = BN.red(P)
    const _0 = uint256(0)
    const _1 = uint256(1)

    // function for elliptic curve multiplication in jacobian coordinates using Double-and-add method
    function ecmul(_p, _d) {
        let R = [_0,_0,_0]

        //return (0,0) if d=0 or (x1,y1)=(0,0)
        if (_d == 0 || ((_p[0] == 0) && (_p[1] == 0)) ) {
            return R
        }
        let T = [
            _p[0], //x-coordinate temp
            _p[1], //y-coordinate temp
            _p[2], //z-coordinate temp
        ]

        const d = _d.clone()
        while (d != 0) {
            if (d.testn(0)) {  //if last bit is 1 add T to result
                R = ecadd(T,R)
            }
            T = ecdouble(T);    //double temporary coordinates
            d.iushrn(1);      //"cut off" last bit
        }

        return R
    }

    function mulmod(a, b) {
        return a.mul(b).umod(P)//TODO red
    }

    function addmod(a, b) {
        return a.add(b).umod(P)//TODO red
    }

    function invmod(a) {
        return a.invm(P)//TODO redq
    }

    function mulG(k) {
        const GinJ = AtoJ(GX, GY)
        const PUBinJ = ecmul(GinJ, k)
        return JtoA(PUBinJ)
    }

    function mulP(p, k) {
        const GinJ = AtoJ(p[0], p[1])
        const PUBinJ = ecmul(GinJ, k)
        return JtoA(PUBinJ)
    }

    function JtoA(p) {
        const zInv = invmod(p[2])
        const zInv2 = mulmod(zInv, zInv)
        return [mulmod(p[0], zInv2), mulmod(p[1], mulmod(zInv, zInv2))]
    }

    function ecdouble(_p) {

        if (_p[1] == 0) {
            //return point at infinity
            return [_1, _1, _0]
        }

        const z2 = mulmod(_p[2], _p[2])
        const m = addmod(mulmod(A, mulmod(z2, z2)), mulmod(uint256(3), mulmod(_p[0], _p[0])))
        const y2 = mulmod(_p[1], _p[1])
        const s = mulmod(uint256(4), mulmod(_p[0], y2))

        const x = addmod(mulmod(m, m), negmod(mulmod(s, uint256(2))))
        return [
            x,
            addmod(mulmod(m, addmod(s, negmod(x))), negmod(mulmod(uint256(8), mulmod(y2, y2)))),
            mulmod(uint256(2), mulmod(_p[1], _p[2]))
        ]
    }

    function negmod(a) {
        return P.sub(a)
    }

    function ecadd(_p, _q) {
        if (_q[0] == 0 && _q[1] == 0 && _q[2] == 0) {
            return _p
        }

        let z2 = mulmod(_q[2], _q[2])
        const u1 = mulmod(_p[0], z2)
        const s1 = mulmod(_p[1], mulmod(z2, _q[2]))
        z2 = mulmod(_p[2], _p[2])
        let u2 = mulmod(_q[0], z2)
        let s2 = mulmod(_q[1], mulmod(z2, _p[2]))

        if (u1.eq(u2)) {
            if (!s1.eq(s2)) {
                //return point at infinity
                return [_1, _1, _0]
            }
            else {
                return ecdouble(_p)
            }
        }

        u2 = addmod(u2, negmod(u1))
        z2 = mulmod(u2, u2)
        const t2 = mulmod(u1, z2)
        z2 = mulmod(u2, z2)
        s2 = addmod(s2, negmod(s1))
        const x = addmod(addmod(mulmod(s2, s2), negmod(z2)), negmod(mulmod(uint256(2), t2)))
        return [
            x,
            addmod(mulmod(s2, addmod(t2, negmod(x))), negmod(mulmod(s1, z2))),
            mulmod(u2, mulmod(_p[2], _q[2]))
        ]
    }

    function AtoJ(x, y) {
        return [
            uint256(x),
            uint256(y),
            _1
        ]
    }

    function isValidPoint(x, y) {
        const yy = addmod(mulmod(mulmod(x, x), x), B)
        return yy.eq(mulmod(y, y))
    }

    function toHex(bn) {
        return ('00000000000000000000000000000000000000000000000000000000000000000000000000000000' + bn.toString(16)).slice(-64)
    }

    function toBytes(bn) {
        return bn.toArray(1, 32)
    }

    function setBytes(bytes) {
        var num = uint256(0)
        if (bytes.length==32){
            for (let index = 0; index < 32; index++) {
                var buf = uint256(bytes[index])
                num = num.mul(uint256(256))
                num = num.add(buf)
            }
            return num    
        } else {
            var point = new Array()
            point[0] = uint256(0)
            point[1] = uint256(0)
            for (let index = 0; index < 32; index++) {
                var buf = uint256(bytes[index])
                point[0] = point[0].mul(uint256(256))
                point[0] = point[0].add(buf)
                var buf = uint256(bytes[index+32])
                point[1] = point[1].mul(uint256(256))
                point[1] = point[1].add(buf)
            }
            return point
        }
        
    }

    function Hex2Bytes(hex) {
        var bn = uint256(hex, 16)
        var out = toBytes(bn)
        return out
    }

    function Bytes2Hex(bytes) {
        var hex = ""
        var zeros = true
        for (let index = 0; index < bytes.length; index++) {
            if(zeros && bytes[index]==0) {
                continue
            } else {
                zeros = false
            }
            buf = bytes[index].toString(16)
            if (buf.length==1) {
                buf = "0"+buf
            }
            hex = hex + buf
        }
        return hex
    }


    exports.uint256 = uint256
    exports.isValidPoint = isValidPoint
    exports.mulG = mulG
    exports.mulP = mulP
    exports.rnd = rnd
    exports.toHex = toHex
    exports.toBytes = toBytes
    exports.setBytes = setBytes
    exports.Hex2Bytes = Hex2Bytes
    exports.Bytes2Hex = Bytes2Hex
})()