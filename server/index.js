var express = require('express');
const morgan = require('morgan');
const User = require('./model/userModel');
const md5 =require('md5');
const cors = require('cors');
let db = null;
const cors = require('cors');

const { mongoose } = require('./database');

var app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

app.listen(3000, function () {
    console.log("Servidor en marcha: ");
});


app.post('/login', async (req, res) => {

    console.log("Se va a loguear :");

    console.log("body.name :" + req.body.name);

    User.findOne({"name": req.body.name, "pass": md5(req.body.pass)}).then((data) =>{
        console.log("data : " + data);
        res.status(200).json({data})
    }).catch((error) => {
        res.status(500).json(error);
    })



});

app.get('/setDefaultState', async (req, res) => {

    const alcalde = new User({id: "alcalde", name:"alcalde", pass: md5("alcalde")});
    console.log(alcalde);
    await addUser(alcalde);

    const concejal1 = new User({id: "concejal1", name:"concejal1", pass: md5("concejal1")});
    await addUser(concejal1);

    const concejal2 = new User({id: "concejal2", name:"concejal2", pass: md5("concejal2")});
    await addUser(concejal2);

    const concejal3 = new User({id: "concejal3", name:"concejal3", pass: md5("concejal3")});
    await addUser(concejal3);

    const concejal4 = new User({id: "concejal4", name:"concejal4", pass: md5("concejal4")});
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


app.get('/allUsers', async (req, res )=>{
    User.find({}).then((data) =>{
        res.status(200).json(data);
    }).catch((error) =>{
        res.status(500).json(error);

    });
});