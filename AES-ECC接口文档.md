## AES-ECC SDK 接口文档

通过java和JS两种语言，实现了数字信封的SDK，并且两种语言的SDK可以实现互相加解密。

对于明文采用AES进行加密，对加密中使用的对称密钥，利用椭圆曲线中的ECIES进行加密（公钥加密），加密后得到关于明文的AES密文，以及关于对称密钥的ECIES密文。解密的过程与此相反，通过ECIES进行解密（私钥解密），得到AES的对称密钥，利用此密钥对AES的密文进行解密，得到明文。

### JAVA SDK

#### 接口说明

```java
public class envelop{}
```

将数字信封封装在``envelop``中。通过实例化``envelop``对象，完成数字信封的相关功能。

```java
public void setSymKey(String key)
```

传入AES的对称密钥。

```java
public void setEciesPubKey(String pk)
public void setEciesSecKey(String sk)
```

传入ECC的公钥/私钥。

```java
public String getSymKey()
```

获取当前AES的密钥。

```java
public String getEciesPubKey()
public String getEciesSecKey()
```

获取当前ECC的公钥/私钥。

```java
public String encryptMsg(String msg) throws Exception
public String decryptMsg(String encMsg) throws Exception
```

使用AES对明文进行加密，返回密文；以及使用AES对密文进行解密，返回解密后的明文。

```java
public String encryptKey(String key) throws Exception
public String decryptKey(String encKey) throws Exception
```

使用ECC中的ECIES加密算法，对明文（在数字信封中为AES的对称密钥）进行加密，返回密文（在数字信封中为AES对称密钥的密文）；以及使用ECIES解密算法对密文进行解密，返回明文。



#### 具体实例

**实例化对象**

```java
envelop env = new envelop();
```

实例化一个数字信封对象，此对象会通过构造函数，分配AES加密的密钥以及ECC的公私钥对。

**数字信封加密**

```java
String encMsg = env.encryptMsg(msg);
String symKey = env.getSymKey();
String encKey = env.encryptKey(symKey);
```

AES加密明文，通过调用``getSymKey()``方法，获得AES的密钥，对于对称密钥使用椭圆曲线进行加密。

**数字信封解密**

```java
String decKey = env.decryptKey(encKey);
env.setSymKey(decKey);
String decMsg = env.decryptMsg(encMsg);
```

使用椭圆曲线进行解密，得到AES的对称密钥，调用``setSymKey()``方法，将AES对称密钥传入对象中，然后使用AES进行解密，得到的``decMsg``即为解密后的密文。



### JavaScript SDK

实现JS的SDK，分别用到了aes.js、ecc-ecies.js以及secp256k1.js，其中secp256k1.js提供了椭圆曲线中``secp256k1``这条曲线的相关参数和接口。

#### 接口说明（aes.js）

**生成密钥**

```javascript
function generateKey()
function StringCodeParse()
```

``generateKey()`` 会随机生成16字节（256位）的十六进制的字符串（小写字母）。

``StringCodeParse()`` 将以上生成的字符串（大写字母，对于字符串可以用``toUpperCase()``函数进行转换）转换成适用于aes的密钥。

**加密**

```javascript
function encrypt(plaintext, key, iv)
```

加密函数，其中``plaintext``接收的是明文数据的字符串，``key``是由``StringCodeParse()``转换的密钥，``iv``是填充向量。由于java版本和JS版本采用的是不同的填充格式，因此为保证二者互通，指定iv向量的值``iv = "30313233343536373839414243444546"``。

**解密**

```javascript
function decrypt(ciphertext, key, iv)
```

解密函数，其中``ciphertext``是密文字符串，``key``是由``StringCodeParse()``转换的密钥，``iv``是填充向量。由于java版本和JS版本采用的是不同的填充格式，因此为保证二者互通，指定iv向量的值``iv = "30313233343536373839414243444546"``。

#### 接口说明（ecc-ecies.js）

**生成公私钥对**

```javascript
function generateSK()
function generatePK(sk)
```

``generateSK()`` 生成私钥，``generatePK(sk)``根据私钥生成公钥，其中``sk``是由``generatePK(sk)``直接生成的。

```javascript
function SK2Bytes(sk)
function PK2Bytes(pk)
function Bytes2Key(bytes)
```

以上三个函数中，前两个分别是将私钥、公钥转成byte数组，最后一个是将byte数组转成用私钥/公钥的格式。

**加密**

```javascript
function encrypt(pub, msg)
```

加密函数，``pub``为上文生成的公钥，``msg``为需要加密的明文字符串，函数的输出为Array数组。

**解密**

```javascript
function decrypt(prv, cyph)
```

解密函数，``prv``为上文生成的私钥，``cyph``为加密的Array数组，函数输出为解密结果的字符串。

```javascript
function StringToHex(bytes)
```

将字符串形式的密文，转换成适合js解密的Array数组。



#### 具体实例

```javascript
var aes = require("./aes")
var CryptoJS = require("crypto-js")
var ecc = require("./ecc-ecies")
```

引入对应的包。

**生成密钥**

```javascript
var key = aes.generateKey()
var iv = "30313233343536373839414243444546"
var key1 = aes.StringCodeParse(key.toUpperCase())

var secKey = ecc.generateSK()
var pubKey = ecc.generatePK(secKey)
```

其中``key``是生成的256位的随机序列，``key1``是转换后的AES密钥。``secKey``是椭圆曲线的私钥，``pubKey``是椭圆曲线的公钥。

**加密**

```javascript
var msg = "This is a plaintext message from alice to bob"
var encMsg = aes.encrypt(msg, key1, iv)
var encKey = ecc.encrypt(pubKey, key)
```

对明文``msg``使用AES进行加密，得到``encMsg``，对``key``使用椭圆曲线进行加密，得到``encKey``。

**解密**

```javascript
var decKey = ecc.decrypt(secKey, encKey)
decKey =  aes.StringCodeParse(decKey)
var decMsg = aes.decrypt(encMsg, decKey, iv)
console.log(decMsg)
```

对``encKey``进行解密，得到AES对称密钥，解密的密钥使用``StringCodeParse()``函数进行转换，以适应在JS的AES中进行解密。得到的``decKey``，使用椭圆曲线进行解密，最后打印到控制台。



-------------------

### JAVA和JS互通调用实例

#### JAVA加密，JS解密

java部分：

```java
envelop env = new envelop();
String msg = "hello world!";
String encMsg = env.encryptMsg(msg);
String symKey = env.getSymKey();
String encKey = env.encryptKey(symKey);

System.out.println("##encMsg:");
System.out.println(encMsg);
System.out.println("##encKey:");
System.out.println(encKey);
System.out.println("##secKey:");
System.out.println(env.getEciesSecKey());
```

输出结果：

```
##encMsg:
8cf8d9b71da857a75ee5ad683f6a2ba5
##encKey:
eaed4c48657ec38ca12eafbdf674c7653df801e8f115cd7e895f8a0a8034eb54e3b18ba30abf2bfc61c923b75288444844ec5b926e4d508760b7d2b41672525addb691cfb39c40c2e92bf0ef9c62e21acd4cd44ede52ffa425d4a4b6c96ce521996fe2d69b21537defc668269faadd981290e7d8d631d5b7ed73fb0ff436b2762e7a3976ea358b46a653a85d4f57eb44
##secKey:
30dba07390235aa9da79fdc7778fe256c0058bc0cb12a64e943510735a2c8aaf
```



js解密：

```javascript
var aes = require("./aes")
var CryptoJS = require("crypto-js")
var ecc = require("./ecc-ecies")
var secp256k1 = require("./secp256k1")

var iv = aes.iv
var encMsg = "8cf8d9b71da857a75ee5ad683f6a2ba5"
var encKey = "eaed4c48657ec38ca12eafbdf674c7653df801e8f115cd7e895f8a0a8034eb54e3b18ba30abf2bfc61c923b75288444844ec5b926e4d508760b7d2b41672525addb691cfb39c40c2e92bf0ef9c62e21acd4cd44ede52ffa425d4a4b6c96ce521996fe2d69b21537defc668269faadd981290e7d8d631d5b7ed73fb0ff436b2762e7a3976ea358b46a653a85d4f57eb44"
var secKey = "30dba07390235aa9da79fdc7778fe256c0058bc0cb12a64e943510735a2c8aaf"
secKey = secp256k1.uint256(secKey, 16)
var encKey = ecc.StringToHex(encKey.toUpperCase())

var decKey = ecc.decrypt(secKey, encKey)
decKey =  aes.StringCodeParse(decKey)
var decMsg = aes.decrypt(encMsg, decKey, iv)
console.log(decMsg)
```

输出结果：

```
hello world!
```

值得注意的是，在secKey做为字符串不能直接做为私钥进行解密，需要使用``secp256k1.js``中的函数进行映射，将其映射到椭圆曲线上，以适应解密。



#### JS加密，JAVA解密

JS加密部分：

```javascript
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

console.log("sk:")
console.log(secKey)
console.log("encMsg:")
console.log(encMsg)
console.log("encKey:")
console.log(secp256k1.Bytes2Hex(encKey))
```

加密后的输出结果

```
sk:
<BN: 5965f0ac0cbc8c1de77d788df14586b494485816ede997ca3ac1365b52076eb9>
encMsg:
45f15773c2d848e6529f7982729c01fb0c1409de130146977b393851f13afe630093e4ff0f0943ecd235edf2a2745475
encKey:
53225863dbddfb98ae018c9790e57057cddd8a1b0ecf48bf12238da1c90be013b0397cc9ea8f0a0630a8dc903a9c7d3f93e8fa8a150e720eab4cf9af00ce1d12229ba87a99f8440e22d6ed3aec85d4fa964b6b508fee05ea18f5ab152b8f6543d68b0cedbb4ad5e97ede7c38089b34ad76bb47581aa89b0e0cb261e929edba7d55dd671cad8c56004fe16068ea540aad
```

java解密：

```java
public void testDecrypt() throws Exception {
     envelop env = new envelop();
     String sk = "5965f0ac0cbc8c1de77d788df14586b494485816ede997ca3ac1365b52076eb9";
     env.setEciesSecKey(sk);
     String encMsg = "45f15773c2d848e6529f7982729c01fb0c1409de130146977b393851f13afe630093e4ff0f0943ecd235edf2a2745475";
     String encKey = "53225863dbddfb98ae018c9790e57057cddd8a1b0ecf48bf12238da1c90be013b0397cc9ea8f0a0630a8dc903a9c7d3f93e8fa8a150e720eab4cf9af00ce1d12229ba87a99f8440e22d6ed3aec85d4fa964b6b508fee05ea18f5ab152b8f6543d68b0cedbb4ad5e97ede7c38089b34ad76bb47581aa89b0e0cb261e929edba7d55dd671cad8c56004fe16068ea540aad";
    
     String decKey = env.decryptKey(encKey);
     System.out.println("##decKey:");       
     System.out.println(decKey);
     env.setSymKey(decKey);
        
     String decMsg = env.decryptMsg(encMsg);
     System.out.println("##decMsg:");
     System.out.println(decMsg);
}
```

解密后的输出结果：

```
##decKey:
E59C191F3EB84A6B5E7C144F3DAFEA1E
##decMsg:
This is a plaintext message from alice to bob
```

