const rsa = require('rsa-scii-upc');
const sha = require('object-sha');
const bigconv = require('bigint-conversion');
const fs = require('fs');


global.ayto_pubKey;
global.ayto_prKey;

createKeys();


async function digestHash(body) {
    const d = await sha.digest(body, 'SHA-256');
    return d;
}

async function createKeys() {
    const { publicKey, privateKey } = await rsa.generateRandomKeys(3072);

    ayto_pubKey = publicKey;
    ayto_prKey = privateKey;

    saveAytoCert()
    saveConcejalesCert()   


}

async function saveAytoCert() {

    var cert = {
        publicKey: {
            e: bigconv.bigintToHex(ayto_pubKey.e),
            n: bigconv.bigintToHex(ayto_pubKey.n)
        },
        ID: "Ayuntamiento de Río Seco",
        IssuerID: "Ayuntamiento de Río Seco",
    }

    
    
    var signatureIssuer = bigconv.bigintToHex(ayto_prKey.sign(bigconv.textToBigint(await digestHash(cert))));
    
    var certificate = {
        certificate: {
            cert, signatureIssuer
        },
        privateKey: {
            d: bigconv.bigintToHex(ayto_prKey.d),
            n: bigconv.bigintToHex(ayto_prKey.publicKey.n)
        }
    }

    fs.writeFileSync("./server/certs/AytoCert.json", JSON.stringify(certificate))


}


async function saveConcejalesCert() {

    for (let index = 1; index < 5; index++) {

        const { publicKey, privateKey } = await rsa.generateRandomKeys(3072);

        var cert = {
            publicKey: {
                e: bigconv.bigintToHex(publicKey.e),
                n: bigconv.bigintToHex(publicKey.n)
            },
            ID: "concejal" + index,
            IssuerID: "Ayuntamiento de Río Seco",
        }
        
        var signatureIssuer = bigconv.bigintToHex(ayto_prKey.sign(bigconv.textToBigint(await digestHash(cert))));
        
        var certificate = {
            certificate: {
                cert, signatureIssuer
            },
            privateKey: {
                d: bigconv.bigintToHex(privateKey.d),
                n: bigconv.bigintToHex(privateKey.publicKey.n)
            }
        }

        path = "./server/certs/Concejal" + index + "Cert.json"
    
        fs.writeFileSync(path, JSON.stringify(certificate))
        
    }

    const { publicKey, privateKey } = await rsa.generateRandomKeys(3072);

    var cert = {
        publicKey: {
            e: bigconv.bigintToHex(publicKey.e),
            n: bigconv.bigintToHex(publicKey.n)
        },
        ID: "alcalde",
        IssuerID: "Ayuntamiento de Río Seco",
    }
    
    var signatureIssuer = bigconv.bigintToHex(ayto_prKey.sign(bigconv.textToBigint(await digestHash(cert))));
    
    var certificate = {
        certificate: {
            cert, signatureIssuer
        },
        privateKey: {
            d: bigconv.bigintToHex(privateKey.d),
            n: bigconv.bigintToHex(privateKey.publicKey.n)
        }
    }

    path = "./server/certs/AlcaldeCert.json"

    fs.writeFileSync(path, JSON.stringify(certificate))


    


}
