

var admin = require("firebase-admin");

var serviceAccount = require("../../private/mezoklinik-af086-firebase-adminsdk-yjug4-295325d6fb.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mezoklinik-af086.firebaseio.com"
});


var stats = require("./stats");


// Get a database reference to our posts
// var db = admin.database();

// var ref = db.ref("users");

// // Attach an asynchronous callback to read the data at our posts reference
// ref.on("value", function(snapshot) {
//   // console.log(snapshot.val());
//   var user = snapshot.val();
//   console.log(user.FyxtGFbSSmXYDK81qBjrk75ywJH3.email);
// }, function (errorObject) {
//   console.log("The read failed: " + errorObject.code);
// });

//Storage web
// <<

// <script src="https://www.gstatic.com/firebasejs/4.10.1/firebase.js"></script>
// <script>
//   // Initialize Firebase
//   var config = {
//     apiKey: "AIzaSyD_3gAwnYgu49ihuHD8jiqFZ6DjTb7r9UQ",
//     authDomain: "mezoklinik-app.firebaseapp.com",
//     databaseURL: "https://mezoklinik-app.firebaseio.com",
//     projectId: "mezoklinik-app",
//     storageBucket: "mezoklinik-app.appspot.com",
//     messagingSenderId: "377697913347"
//   };
//   firebase.initializeApp(config);
// </script>

// >>
//Storage web

// module.exports = db;



module.exports = admin;