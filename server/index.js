var express = require('express');
const morgan = require('morgan');
const User = require('./model/userModel');
const md5 = require('md5');
const cors = require('cors');
let db = null;
const SocketIO = require('socket.io');
const HashMap = require('hashmap');
const fs = require('fs');
const rsa = require('rsa-scii-upc');
const bigconv = require('bigint-conversion');
const sha = require('object-sha');


const { mongoose } = require('./database');
const { RSA_NO_PADDING } = require('constants');

var app = express();
var usuarios = new HashMap();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

const server = app.listen(3000, function () {
    console.log("Servidor en marcha: ");
});

const io = SocketIO(server);

app.post('/login', async (req, res) => {

    console.log("Se va a loguear :");

    console.log("body.name :" + req.body.name);

    User.findOne({ "name": req.body.name, "pass": md5(req.body.pass) }).then((data) => {
        console.log("data : " + data);
        res.status(200).json({ data })
    }).catch((error) => {
        res.status(500).json(error);
    })



});

app.get('/setDefaultState', async (req, res) => {

    const alcalde = new User({ id: "alcalde", name: "alcalde", pass: md5("alcalde") });
    console.log(alcalde);
    await addUser(alcalde);

    const concejal1 = new User({ id: "concejal1", name: "concejal1", pass: md5("concejal1") });
    await addUser(concejal1);

    const concejal2 = new User({ id: "concejal2", name: "concejal2", pass: md5("concejal2") });
    await addUser(concejal2);

    const concejal3 = new User({ id: "concejal3", name: "concejal3", pass: md5("concejal3") });
    await addUser(concejal3);

    const concejal4 = new User({ id: "concejal4", name: "concejal4", pass: md5("concejal4") });
    await addUser(concejal4);


});


const addUser = async user => {

    user.save().then((data) => {
        console.log("usuario correcto");
    }
    ).catch((err) => {
        console.log("usuario NO correcto");
    });

}


app.get('/allUsers', async (req, res) => {
    User.find({}).then((data) => {
        res.status(200).json(data);
    }).catch((error) => {
        res.status(500).json(error);

    });
});

app.get('/AytoCert', (req, res) => {

    var cert = JSON.parse(fs.readFileSync('./server/certs/AytoCert.json'));
    res.status(200).send(cert.certificate);

});

io.on('connection', (socket) => {

    var userSocket;


    socket.on('usuario', (msg) => {
        console.log('Se ha conectado ' + msg);

        if (msg == "Alcalde") {

            userSocket = msg;
            usuarios.set(msg, socket.id);

            socket.broadcast.emit('AlcaldeID', usuarios.get("Alcalde"));


        } else {

            userSocket = msg;
            usuarios.set(msg, socket.id);


            if (usuarios.get("Alcalde") != null) {
                socket.emit('AlcaldeID', usuarios.get("Alcalde"));
            }
        }

    });

    socket.on('conectados', () => {

        console.log("here")
        var conectados = []

        usuarios.forEach((k, v) => {

            conectados.push(v)

        })

        socket.emit('conectados', conectados);
        socket.broadcast.emit('conectados', conectados)


    });

    socket.on('concejal-to-alcalde-type5', (mensaje) => {

        console.log(mensaje)

        //verificaciones correspondientes del proof

        socket.broadcast.to(usuarios.get("alcalde")).emit('concejal-to-alcalde-type5', mensaje)


    });

    socket.on('concejal-to-alcalde-type5Declined', (mensaje) => {

        console.log(mensaje)

        //verificaciones correspondientes del proof

        socket.broadcast.to(usuarios.get("alcalde")).emit('concejal-to-alcalde-type5Declined', mensaje)


    });


    

    socket.on('alcalde-to-concejal-type6', (mensaje) => {

        console.log(mensaje)

        //verificaciones correspondientes del proof si es correcto guardamos el mensaje para prueba de no repudio



    });

    socket.on('AyuntamientoFirmaDecreto', async (mensaje) => {

        console.log(mensaje)
        var cert = JSON.parse(fs.readFileSync('./server/certs/AytoCert.json'));

        publicKey = new rsa.PublicKey(bigconv.hexToBigint(cert.certificate.cert.publicKey.e), bigconv.hexToBigint(cert.certificate.cert.publicKey.n))
        privateKey = new rsa.PrivateKey(bigconv.hexToBigint(cert.privateKey.d), publicKey)


        const digest = await digestHash(mensaje);
        const firmaAyto = bigconv.bigintToHex(privateKey.sign(bigconv.textToBigint(digest)));


        const decretoFirmado = {
            Decreto: mensaje,
            Firma_Ayuntamiento: firmaAyto
        }

        console.log(decretoFirmado)

        socket.broadcast.emit('AyuntamientoFirmaDecreto', decretoFirmado)
        socket.emit('AyuntamientoFirmaDecreto', decretoFirmado)


    });


    socket.on('disconnect', () => {

        console.log("el usuario " + userSocket + " se ha desconectado ")
        usuarios.delete(userSocket);

        var conectados = []

        usuarios.forEach((k, v) => {

            conectados.push(v)

        })

        socket.broadcast.emit('conectados', conectados)

    });
});

async function digestHash(body) {
    const d = await sha.digest(body, 'SHA-256');
    return d;
}
