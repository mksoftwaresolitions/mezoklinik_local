/**
 * başlatmak için:
 * npm start
 */
//kütüphaneler import ediliyor
// var fs = require('fs'); //filesystem kütüphanesi

// var subdomain = require('express-subdomain');
var express = require('express');
var session = require('express-session');
var path = require('path');
var app = express();
app.use(session({
    secret: 'agimSecretValueForSession',
    resave: false,
    saveUninitialized: true
}));
var ejsLayouts = require('express-ejs-layouts');
var bodyParser = require('body-parser');

var admin = require('firebase-admin');
var firebase = require("firebase");
var db = require('./app/model/db');

//ejs tanımları
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/app/view'));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//modülü ektif ediyoruz
app.use(ejsLayouts);

//haritalama (kullanıcıya klasör erişim izni verme)
app.use('/public', express.static(path.join(__dirname, 'public')));
// app.use('/public', express.static(path.join(__dirname, 'private')));

//Yönlendirmeler için routeManager.js sayfası çağırılıyor
require('./app/router/routeManager')(app);

app.listen(8000);