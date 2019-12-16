var admin = require('../model/db');
var db = admin.database();
// var Users = require('../model/entity/Users');
var DistrictModel = require('../model/entity/District');
var CityModel = require('../model/entity/City');

var firebase = require('firebase');

var AdminUid = "qlqnkGWu1oUTmJWcdI8Zq0NEgIt1";


module.exports.index = function (req, res) {
    // res.send('<div class="row"><a href="/dashboard/" class="text-center"><h1><strong>Dashboard</strong></h1></a></div>');
    if(req.session.userName){

        //token alınıyor
        admin.auth().createCustomToken(AdminUid)
        .then(function(customToken) {
            db.ref("stats").once("value", function(snapshot) {
                res.render('dashboard/index', {
                    layout: 'dashboard/layout',
                    customToken,
                    campaigns: [],
                    stats: snapshot.val(),
                    session: req.session,
                    status: "no"
                });
            }, function (errorObject) {
                res.render('dashboard/index', {
                    layout: 'dashboard/layout',
                    customToken,
                    campaigns: [],
                    stats: "",
                    session: req.session,
                    status: "<Strong>Hata!</Strong> Veritabanı okuma hatası(istatistikler):<br>" + errorObject.code
                });
            });
            
        })
        .catch(function(error) {
            console.log("Error creating custom token:", error);
            
            res.render('dashboard/index', {
                layout: 'dashboard/layout',
                customToken:  "",
                campaigns: [],
                stats: "",
                session: req.session,
                status: "Kimlik doğrulama hatası."
            });
        });

        // var campaigns = [];
        // var status = "no";
    
        // db.ref("campaigns").orderByChild("start_date").limitToLast(10).once("value", function(snapshot) {
        //     snapshot.forEach(function (params) {
        //         var sd = new Date(Number(params.val().start_date));
        //         var fd = new Date(Number(params.val().finish_date));
        //         // campaigns.push({ //asc
        //         campaigns.unshift({ //desc
        //             title: params.val().title,
        //             description: params.val().description,
        //             download_url: params.val().download_url,
        //             storage_name: params.val().storage_name,
        //             type: params.val().type,
        //             start_date: sd.getDate() + "." + (sd.getMonth()+1) + "." + sd.getFullYear(),
        //             finish_date: fd.getDate() + "." + (fd.getMonth()+1) + "." + fd.getFullYear(),
        //             uid: params.val().uid
        //         });
        //     })
            

            
        // db.ref("stats").once("value", function(snapshot) {
            
        //     res.render('dashboard/index', {
        //         layout: 'dashboard/layout',
        //         campaigns,
        //         stats: snapshot.val(),
        //         session: req.session,
        //         status
        //     });
        // }, function (errorObject) {
        //     status: "<Strong>Hata!</Strong> Veritabanı okuma hatası(istatistikler):<br>" + errorObject.code
        //     // res.render('dashboard/index', {
        //     //     layout: 'dashboard/layout',
        //     //     campaigns: [],
        //     //     session: req.session,
        //     //     status
        //     // });
        // });

        //     // res.render('dashboard/index', {
        //     //     layout: 'dashboard/layout',
        //     //     campaigns,
        //     //     session: req.session,
        //     //     status
        //     // });
        // }, function (errorObject) {
        //     status: "<Strong>Hata!</Strong> Veritabanı okuma hatası(kampanyalar):<br>" + errorObject.code
        //     res.render('dashboard/index', {
        //         layout: 'dashboard/layout',
        //         campaigns: [],
        //         stats: {},
        //         session: req.session,
        //         status
        //     });
        // });

        // // res.render('dashboard/index', {
        // //     layout: 'dashboard/layout',
        // //     session: req.session,
        // // });
        // // res.render('login', {layout: 'login'});
    } else {
        // res.send('<div class="row">Oturum yok.</div>');
        res.render('login', {
            layout: 'login',
            status: "no"
        });
    }
}

module.exports.indexGet = function (req, res) {
    res.send("getteyiz");
}

module.exports.indexPost = function (req, res) {


    //authentication...
    var ref = db.ref("auth");
    var user;
    var pass;

    ref.once("value", function (snapshot) {

        user = snapshot.val().user;
        pass = snapshot.val().pass;
        console.log(user+" "+pass);
        if (user == null || pass == null) {
            res.render('login', {
                layout: 'login',
                status: "<strong>Veritabanında kayıtlı kullanıcı yok!</strong>"
            });
        }

        if(req.body.loginUsername == user && req.body.loginPassword == pass){
    
            req.session.userName = req.body.loginUsername;
            console.log("Peki");
            res.redirect('/');
            
            // res.render('dashboard/index', {
            //     layout: 'dashboard/layout',
            //     session: req.session
            // });
        } else {
            
            res.render('login', {
                layout: 'login',
                status: "<strong>Kullanıcı adı veya şifre hatalı</strong>"
            });
        }
    }, function (errorObject) {
        res.render('login', {
            layout: 'login',
            status: "<strong>Veritabanı okuma hatası! Daha sonra tekrar deneyin</strong>"
        });
    });
    
    // res.send('<div class="row">'+req.body.loginUsername+'<br>'+req.body.loginPassword+'</div>');
    
}

module.exports.logout = function (req, res) {

    delete req.session.userName;
    res.redirect("/");
    // res.render('login', {layout: 'login'});
    
}

module.exports.userList = function (req, res) {

    //getUser tek kullanıcı çekme
    // admin.auth().getUser("hdbTqxKUtxMtOhCIXZTiG0XZkH12")
    // // admin.auth().getUserByPhoneNumber("phoneNumber")
    // // admin.auth().getUserByEmail("onurkaganaldemir@gmail.com")
    // .then(function(userRecord) {
    //     // See the UserRecord reference doc for the contents of userRecord.
    //     console.log("Successfully fetched user data:", userRecord.toJSON());
    // })
    // .catch(function(error) {
    //     console.log("Error fetching user data:", error);
    // });
    var userModel = new Users();
    //listAllUsers kullanıcı listesi çekme
    var usr = [];
    function listAllUsers(nextPageToken) {
        // List batch of users, 1000 at a time.
        admin.auth().listUsers(1000, nextPageToken)
        .then(function(listUsersResult) {
            listUsersResult.users.forEach(function(userRecord) {
            console.log("user", userRecord.toJSON());
            usr.push(userRecord);
        });

        // gelen 1000den sonraki 1000 kayıt çağırılıyor
        // if (listUsersResult.pageToken) {
        //     // List next batch of users.
        //     listAllUsers(listUsersResult.pageToken)
        // }
        res.render('userList', {layout: 'userList', users: usr});
        })
        .catch(function(error) {
            console.log("Error listing users:", error);
        });
    }
    // Start listing users from the beginning, 1000 at a time.
    listAllUsers();

    //liste olarak çekme (javascript)
    // var ref = db.ref("users");

    // // Attach an asynchronous callback to read the data at our posts reference
    // ref.once("value", function(snapshot) {
    //     // console.log(snapshot.val());
    //     var users = [];
    //     snapshot.forEach(element => {
    //        console.log(element.val());
    //        users.push(element.val());
    //     });
    //     console.log(users);
    //     // users.forEach(user => {
            
    //     // });
    //     // console.log(users);
    //     res.render('userList', {layout: 'userList', users: users});
    // }, function (errorObject) {
    //     console.log("The read failed: " + errorObject.code);
    // });
}

module.exports.userAdd = function (req, res) {

    // var usersRef = db.ref("users");
    
    // const promise = admin.auth().createUser("asd@aass.com", "123456");
    // promise.catch(e => console.log(e.message));
    // console.log("----------------------------------------------");
    // console.log(promise);
    // res.render('userAdd', {layout: 'userAdd', users: ""});

    admin.auth().createUser({
        email: "user2@example.com",
        emailVerified: false,
        // phoneNumber: "+11234567890",
        password: "secretPassword",
        displayName: "John Doe",
        // photoURL: "http://www.example.com/12345678/photo.png",
        disabled: false
      })
        .then(function(userRecord) {
          // See the UserRecord reference doc for the contents of userRecord.
        
          console.log("Successfully created new user:", userRecord.uid);
          res.render('userAdd', {layout: 'userAdd', status: "ok", user: userRecord});
        })
        .catch(function(error) {
            console.log("Error creating new user:", error);
            res.render('userAdd', {layout: 'userAdd', status: "Hata! Kullanıcı eklenemedi.<br>" + error, user: ""});
        });


    // var newPostRef = usersRef.push();
    // newPostRef.set({
    //     active: false,
    //     birth_date: 727740000000,
    //     branchModel: {
    //         branch_id: 2,
    //         branch_name: "Branş 2"
    //     },
    //     city: {
    //         city_name: "Afyon",
    //         id: 3
    //     },
    //     email: "onurkaganaldemir@gmail.com",
    //     name_surname: "Onur Kağan Aldemir",
    //     phohe_number: "+90(542)809-29-96",
    //     user_role: 1,
    //     user_uid: ""+newPostRef.key
    // });
    
    // var usersRef = ref.child("users");
    // ref.set({
    //     alanisawesome: {
    //         date_of_birth: "June 23, 1912",
    //         full_name: "Alan Turing"
    //     },
    //     gracehop: {
    //         date_of_birth: "December 9, 1906",
    //         full_name: "Grace Hopper"
    //     }
    // });

    // Attach an asynchronous callback to read the data at our posts reference
    // ref.once("value", function(snapshot) {
    //     // console.log(snapshot.val());
    //     var users = [];
    //     snapshot.forEach(element => {
    //        console.log(element.val());
    //        users.push(element.val());
    //     });
    //     console.log(users);
    //     // users.forEach(user => {
            
    //     // });
    //     // console.log(users);
    //     res.render('userList', {layout: 'db', users: users});
    // }, function (errorObject) {
    //     console.log("The read failed: " + errorObject.code);
    // });
    
}


module.exports.userUpdate = function (req, res) {
    
    // var userModel = new Users(false, 1717171, 1, "Göz", 71, "Kırıkkale", "email@admin.com", "Name Surname", "String Phone Number", 1, "9876543210");
    // console.log("**********************************");
    // console.log(userModel);
    // console.log("**********************************");
    // console.log("Adı: " + userModel.name_surname);
    // console.log("Mail: " + userModel.email);
    // console.log("**********************************");
    // var distModel = [];
    // var i = [0,1,2,3];
    // // Array<DistrictModel> dList;
    // i.forEach(i => {
        var dm = new DistrictModel(1, "ilçe "+1);
    //     distModel.push(dm);
    // });
    var cm = new CityModel(1, "şehir", dm);
    console.log(cm);
    res.render('userUpdate', {layout: 'userUpdate', users: []});
}

// //hata sayfaları
// module.exports.yasak = function (req, res) {
//     res.render('403', { layout: '403' });
// }
// module.exports.sayfaYok = function (req, res) {
//     res.render('404', { layout: '404' });
// }
// module.exports.hata = function (req, res) {
//     // res.render('hata', { layout: 'hata' });
//     res.render('hata', { mesaj: '' });
// }