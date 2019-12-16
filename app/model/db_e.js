// // var admin = require('firebase-admin');
var firebase = require('firebase');

// // var serviceAccount = require('../../private/google-services-mezoklinik.json');

// // admin.initializeApp({
// //   credential: admin.credential.cert(serviceAccount),
// //   databaseURL: 'https://mezoklinik-app.firebaseio.com/'
// // });

// // // As an admin, the app has access to read and write all data, regardless of Security Rules
// // var db = admin.database();
// // var ref = db.ref("user");
// // // ref.once("value", function(snapshot) {
// // //   console.log(snapshot.val());
// // // });

// // // Attach an asynchronous callback to read the data at our posts reference
// // ref.on("value", function(snapshot) {
// //   console.log(snapshot.val());
// // }, function (errorObject) {
// //   console.log("The read failed: " + errorObject.code);
// // });



// // Set the configuration for your app
// // TODO: Replace with your project's config object

var config = {
    apiKey: "AIzaSyDpD2xg33L8GRxM3ym2xRqO52YiIEPo1Ic",
    authDomain: "mezoklinik-af086.firebaseapp.com",
    databaseURL: "https://mezoklinik-af086.firebaseio.com",
    projectId: "mezoklinik-af086",
    storageBucket: "mezoklinik-af086.appspot.com",
    messagingSenderId: "905154803992",
    appId: "1:905154803992:web:542b44d48aa1f4e822066d",
    measurementId: "G-T43PZWT06K"
};

firebase.initializeApp(config);

// // Get a reference to the database service
// var database = firebase.database();
console.log(".........");
// var rootRef = firebase.database().ref().child("users");
firebase.database().ref().child("users").on("value", snap => console.log(snap.val()));
console.log(".........");


// DataSnapshot
// rootRef.on("value", function(snapshot) {
//   console.log(snapshot.val());
// });
// rootRef.on("value", snap => console.log(snap.val()));

// var recentPostsRef = firebase.database().ref('/users');
// // console.log(recentPostsRef);

// // Retrieve new posts as they are added to our database
// recentPostsRef.on("value", function(snapshot, prevChildKey) {
//   var newPost = snapshot.val();
//   console.log(newPost);
//   // console.log("Author: " + newPost.author);
//   // console.log("Title: " + newPost.title);
//   // console.log("Previous Post ID: " + prevChildKey);
// });

// // var ref = database.ref("/users");
// // ref.once("value", function (snapshot) {
// //   console.log(snapshot.val());
// // });

// var ord = firebase.database().ref('/').orderByValue("users");
// console.log(ord);



////////////////////////

// // Import Admin SDK
// var admin = require("firebase-admin");

// var serviceAccount = require('../../private/google-services-mezoklinik.json');

// admin.initializeApp({
//   credential: admin.credential.cert("private", serviceAccount),
//   databaseURL: 'https://mezoklinik-app.firebaseio.com/'
// });

// // Get a database reference to our posts
// var db = admin.database();
// var ref = db.ref("server/saving-data/fireblog/posts");

// // Attach an asynchronous callback to read the data at our posts reference
// ref.on("value", function(snapshot) {
//   console.log(snapshot.val());
// }, function (errorObject) {
//   console.log("The read failed: " + errorObject.code);
// });