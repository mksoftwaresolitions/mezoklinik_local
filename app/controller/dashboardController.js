var admin = require('../model/db');
var db = admin.database();
// var bucket = admin.storage();//.bucket();
// const storage = require('@google-cloud/storage');

//Mail
var nodemailer = require('nodemailer');

// var serviceAccount = require("../../private/mezoklinik-app-firebase-adminsdk-3167t-d6872f506a.json");
// var gcs = storage({
//     projectId: "mezoklinik-app",
//     keyFilename: "private/mezoklinik-app-firebase-adminsdk-3167t-d6872f506a.json"
//   });

//firebase authentication'da kayıtlı bir kullanıcının uid değeri girilmelidir.
var AdminUid = "qlqnkGWu1oUTmJWcdI8Zq0NEgIt1";



module.exports.index = function (req, res) {
    res.redirect("/");
    // res.render('dashboard/index', {layout: 'dashboard/layout'});
}

module.exports.chartsGet = function (req, res) {
    res.render('dashboard/charts', { layout: 'dashboard/layout' });
}

module.exports.formsGet = function (req, res) {
    res.render('dashboard/forms', { layout: 'dashboard/layout' });
}

module.exports.loginGet = function (req, res) {
    res.render('dashboard/login', { layout: 'dashboard/login' });
}

module.exports.tablesGet = function (req, res) {
    res.render('dashboard/tables', { layout: 'dashboard/layout' });
}

//doktor
module.exports.doktorListGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("users");
        var usersVal = [];
        // var branches = [];
        var branches = {};
        var brName = [];
        var brCount = [];
        // const usersVal = new Array(User);
        // var userModel = require("../model/entity/User");
        // var users = Array<Users>

        // ref
        ref.orderByChild("active").equalTo(true).once("value", function (snapshot) {
            // userModel = snapshot.val();
            snapshot.forEach(function (params) {
                usersVal.push(params.val());

                var isContains = false;
                var ind = 0;
                brName.forEach(function (name) {
                    if (name == params.val().branchModel.branch_name) {
                        isContains = true;
                        ind = brName.indexOf(name);
                    }
                })
                if (!isContains) {
                    brName.push(params.val().branchModel.branch_name);
                    brCount.push(1);
                } else {
                    brCount[ind] = brCount[ind] + 1;
                }
            })
            brName.forEach(function (name) {
                branches[name] = brCount[brName.indexOf(name)];
            })
            console.log(branches);
            // console.log(brName);
            // console.log(brCount);
            res.render('dashboard/doctorList', {
                layout: 'dashboard/layout',
                users: usersVal,
                branches,
                status: "no"
            });
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.doktorEkleGet = function (req, res) {
    if (req.session.userName) {
        var branchList = [];
        db.ref("branches").orderByChild("branch_name").once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                branchList.push(params.val());
            })
            res.render('dashboard/doctorAdd', {
                layout: 'dashboard/layout',
                branchList: branchList,
                doctorInfo: "",
                status: "no"
            });
        });
        // res.render('dashboard/doctorAdd', {layout: 'dashboard/layout', status: "no"});
    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.doktorEklePost = function (req, res) {
    console.log(req.session.userName);
    if (req.session.userName) {

        var dt = "", trh = "";
        if (req.body.birth_date) {
            dt = req.body.birth_date;
            trh = new Date(dt).getTime();
        }
        var branchList = [];
        var doctorInfo = req.body;

        admin.auth().createUser({
            email: req.body.email,
            emailVerified: false,
            // phoneNumber: req.body.phone_number,
            password: req.body.password,
            displayName: req.body.name_surname,
            // photoURL: "http://www.example.com/12345678/photo.png",
            disabled: false
        })
            .then(function (userRecord) {
                //authentication kullanıcısı eklendi. DB'ye ekleniyor
                var ref = db.ref("users");
                var usersRef = ref.child(userRecord.uid);
                usersRef.set({
                    active: true,
                    birth_date: trh,
                    branchModel: {
                        branch_id: 0,
                        branch_name: req.body.branch_name
                    },
                    city: {
                        city_name: req.body.city_name,
                        id: 0
                    },
                    email: req.body.email,
                    name_surname: req.body.name_surname,
                    phohe_number: req.body.phone_number,
                    user_role: 1,
                    user_uid: userRecord.uid
                }, function (error) {
                    db.ref("branches").orderByChild("branch_name").once("value", function (snapshot) {
                        snapshot.forEach(function (params) {
                            branchList.push(params.val());
                        })
                        if (error) { //db hatası; rollback auth
                            admin.auth().deleteUser(userRecord.uid)
                                .then(function () {
                                    res.render('dashboard/doctorAdd', {
                                        layout: 'dashboard/layout',
                                        branchList: branchList,
                                        doctorInfo: doctorInfo,
                                        status: "<strong>Hata!</strong> Kullanıcı veritabanına eklenemedi<br>" + error
                                    });
                                })
                                .catch(function (error) { //Auth hatası
                                    res.render('dashboard/doctorAdd', {
                                        layout: 'dashboard/layout',
                                        branchList: branchList,
                                        doctorInfo: doctorInfo,
                                        status: "<strong>Hata!</strong> Kullanıcı veritabanına eklenemedi.<br>Auth silinemedi:<br>" + error
                                    });
                                });

                            // console.log("Realtime DB set hatası: kullanıcı kayıt edilemedi. " + error);
                        }
                        else {
                            ////kayıt başarılı
                            //res.render('dashboard/doctorAdd', {
                            //    layout: 'dashboard/layout',
                            //    branchList: branchList,
                            //    doctorInfo: doctorInfo,
                            //    status: "ok"
                            //});
                            ////mail şablonu alınıyor
                            //db.ref("mailTemplate").once("value", function (snapshot) {
                            //    //mail gönderiliyor
                            //    var htxt = snapshot.val().newUser.html_text.replace(/\%UyeAdi\%/gi, req.body.name_surname);
                            //    var sbj = snapshot.val().newUser.subject.replace(/\%UyeAdi\%/gi, req.body.name_surname);
                            //    sendMail(htxt, sbj, req.body.email);

                            //    res.render('dashboard/doctorAdd', {
                            //        layout: 'dashboard/layout',
                            //        branchList: branchList,
                            //        doctorInfo: doctorInfo,
                            //        status: "ok"
                            //    });
                            //}, function (errorObject) {
                            //    console.log("The read failed: " + errorObject.code);
                            //    res.render('dashboard/doctorAdd', {
                            //        layout: 'dashboard/layout',
                            //        branchList: branchList,
                            //        doctorInfo: doctorInfo,
                            //        status: "<strong>Kayıt başarılı.</strong><br>Kulanıcıya E-Posta göderilemedi."
                            //    });
                            //});

                        }
                    });

                });

            })
            .catch(function (error) { //Auth hatası
                console.log("Authentication hatası: kullanıcı eklenemedi. ", error);
                res.render('dashboard/doctorAdd', {
                    layout: 'dashboard/layout',
                    branchList: branchList,
                    doctorInfo: doctorInfo,
                    status: "<strong>Hata!</strong> Kullanıcı eklenemedi (auth)*<br>" + error
                });
            });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.doktorDuzenleGet = function (req, res) {
    if (req.session.userName) {

        doctorRef = db.ref("users").child(req.params.uid);

        doctorRef.once("value", function (snapshot) {
            var doctorResult = snapshot.val();
            doctorResult.birth_date = longDateToDateInput(doctorResult.birth_date);

            var branchList = [];
            db.ref("branches").orderByChild("branch_name").once("value", function (snapshot) {
                snapshot.forEach(function (params) {
                    branchList.push(params.val());
                })
                res.render('dashboard/doctorEdit', {
                    layout: 'dashboard/layout',
                    branchList: branchList,
                    doctor: doctorResult,
                    status: "no"
                });
            }, function (errorObject) {
                console.log("Branş listesi alınamadı: " + errorObject.code);

                res.render('dashboard/doctorEdit', {
                    layout: 'dashboard/layout',
                    status: "<Strong>Hata!</Strong> Branş Listesi alınamadı.",
                    doctor: doctorResult,
                    branchList: branchList
                });
            });
            // res.render('dashboard/doctorEdit', {
            //     layout: 'dashboard/layout',
            //     status: "no",
            //     doctor: doctorResult
            // });
        }, function (errorObject) {
            console.log("Doktor bilgileri alınamadı: " + errorObject.code);

            res.render('dashboard/doctorEdit', {
                layout: 'dashboard/layout',
                status: "<Strong>Hata!</Strong> Doktor bilgileri alınamadı.",
                doctor: ""
            });
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.doktorDuzenlePost = function (req, res) {
    if (req.session.userName) {

        admin.auth().updateUser(req.body.uid, {
            email: req.body.email,
            // phoneNumber: req.body.phone_number,
            // emailVerified: true,
            // password: req.body.password,
            displayName: req.body.name_surname,
            // photoURL: "http://www.example.com/12345678/photo.png",
            // disabled: false
        })
            .then(function (userRecord) {
                // See the UserRecord reference doc for the contents of userRecord.
                // console.log("Successfully updated (Authentication) user", userRecord.toJSON());

                //db güncelleniyor
                var dt = "", trh = "";
                if (req.body.birth_date) {
                    dt = req.body.birth_date;
                    trh = new Date(dt).getTime();
                }
                doctorRef = db.ref("users").child(req.body.uid);
                doctorRef.update({
                    active: true,
                    birth_date: trh,
                    branchModel: {
                        branch_id: 0,
                        branch_name: req.body.branch_name
                    },
                    city: {
                        city_name: req.body.city_name,
                        id: 0
                    },
                    email: req.body.email,
                    name_surname: req.body.name_surname,
                    phohe_number: req.body.phone_number,
                    user_role: 1,
                    // user_uid: req.body.uid
                }, function (error) {
                    var branchList = [];
                    db.ref("branches").orderByChild("branch_name").once("value", function (snapshot) {
                        snapshot.forEach(function (params) {
                            branchList.push(params.val());
                        })
                        if (error) {
                            console.log("Doktor bilgileri güncellenemedi(db): " + error.code);
                            res.render('dashboard/doctorEdit', {
                                layout: 'dashboard/layout',
                                branchList: branchList,
                                status: "<Strong>Hata!</Strong> Doktor kayıt edilemedi (db)",
                                doctor: {
                                    branchModel: {},
                                    city: {}
                                }
                            });
                        } else { // auth ve db kayıt başarılı
                            res.render('dashboard/doctorEdit', {
                                layout: 'dashboard/layout',
                                branchList: branchList,
                                status: "ok",
                                doctor: {
                                    active: true,
                                    birth_date: req.body.birth_date,
                                    branchModel: {
                                        branch_id: 0,
                                        branch_name: req.body.branch_name
                                    },
                                    city: {
                                        city_name: req.body.city_name,
                                        id: 0
                                    },
                                    email: req.body.email,
                                    name_surname: req.body.name_surname,
                                    phohe_number: req.body.phone_number,
                                    user_role: 1,
                                    user_uid: req.body.uid
                                }
                            });
                        }
                        // res.render('dashboard/doctorEdit', {
                        //     layout: 'dashboard/layout',
                        //     branchList: branchList,
                        //     doctor: {
                        //         branchModel: {},
                        //         city: {}
                        //     },
                        //     status: "<Strong>Hata!</Strong> Doktor kayıt edilemedi (db).",
                        // });
                    }, function (errorObject) {
                        console.log("Branş listesi alınamadı: " + errorObject.code);
                        if (error) {
                            console.log("Doktor bilgileri güncellenemedi(db): " + error.code);
                            res.render('dashboard/doctorEdit', {
                                layout: 'dashboard/layout',
                                branchList: branchList,
                                status: "<Strong>Hata!</Strong> Doktor kayıt edilemedi (db)",
                                doctor: {
                                    branchModel: {},
                                    city: {}
                                }
                            });
                        } else { // auth ve db kayıt başarılı
                            res.render('dashboard/doctorEdit', {
                                layout: 'dashboard/layout',
                                branchList: branchList,
                                status: "ok",
                                doctor: {
                                    active: true,
                                    birth_date: req.body.birth_date,
                                    branchModel: {
                                        branch_id: 0,
                                        branch_name: req.body.branch_name
                                    },
                                    city: {
                                        city_name: req.body.city_name,
                                        id: 0
                                    },
                                    email: req.body.email,
                                    name_surname: req.body.name_surname,
                                    phohe_number: req.body.phone_number,
                                    user_role: 1,
                                    user_uid: req.body.uid
                                }
                            });
                        }

                        // res.render('dashboard/doctorEdit', {
                        //     layout: 'dashboard/layout',
                        //     status: "<Strong>Hata!</Strong> Doktor kayıt edilemedi (db).<br>Branş listesi alınamadı.",
                        //     doctor: {
                        //         branchModel: {},
                        //         city: {}
                        //     },
                        //     // doctor: doctorResult,
                        //     branchList: branchList
                        // });
                    });
                });
            })
            .catch(function (error) {
                console.log("Doktor bilgileri güncellenemedi(auth): ", error);
                res.render('dashboard/doctorEdit', {
                    layout: 'dashboard/layout',
                    status: "<Strong>Hata!</Strong> Doktor kayıt edilemedi (auth)",
                    doctor: {
                        branchModel: {},
                        city: {}
                    }
                });
            });


    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.doktorOnayListGet = function (req, res) {
    console.log(req.session.userName);
    if (req.session.userName) {

        var ref = db.ref("users");
        var usrr = require("../model/entity/Users");
        var usersVal = [];

        ref.orderByChild("active").equalTo(false).once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                usrr = params.val();
                usersVal.push(usrr);
            })
            res.render('dashboard/doctorAcceptList', {
                layout: 'dashboard/layout',
                status: "no",
                users: usersVal
            });
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);

            // TODO: hata mesajı verilecek
            // res.render('dashboard/doctorList', {layout: 'dashboard/layout', users: usersVal});
        });
    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.doktorOnayGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("users");
        var usersVal = [];


        var usersRef = ref.child(req.params.uid);
        usersRef.update({
            "active": true
        }, function (error) {
            if (error) {
                //güncelleme hatası
                console.log("Realtime DB update hatası: kullanıcı güncellenemedi. " + error);
                ref.orderByChild("active").equalTo(false).once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        usersVal.push(params.val());
                    })
                    res.render('dashboard/doctorAcceptList', {
                        layout: 'dashboard/layout',
                        status: "<strong>Hata!</strong> Kullanıcı güncellenemedi.<br>" + error,
                        users: usersVal
                    });
                }, function (errorObject) {
                    console.log("Realtime DB hatası: liste alınamadı. " + errorObject.code);

                    // TODO: hata mesajı verilecek
                    res.render('dashboard/doctorAcceptList', {
                        layout: 'dashboard/layout',
                        status: "<strong>Hata!</strong> Kullanıcı güncellenemedi.<br>" + error + "<strong>Hata!</strong> Liste yenilenemedi.",
                        users: usersVal
                    });
                });
            } else {
                //güncelleme başarılı
                ref.orderByChild("active").equalTo(false).once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        usersVal.push(params.val());
                    })

                    // mail şablonu alınıyor
                    db.ref("mailTemplate").once("value", function (snapshot) {
                        //mail gönderiliyor
                        var htxt = snapshot.val().acceptUser.html_text.replace(/\%UyeAdi\%/gi, req.params.name);
                        var sbj = snapshot.val().acceptUser.subject.replace(/\%UyeAdi\%/gi, req.params.name);
                        sendMail(htxt, sbj, req.params.email);

                        res.render('dashboard/doctorAcceptList', {
                            layout: 'dashboard/layout',
                            status: "ok",
                            users: usersVal
                        });
                    }, function (errorObject) {
                        console.log("Mail şablonu okuma hatası: " + errorObject.code);

                        res.render('dashboard/doctorAcceptList', {
                            layout: 'dashboard/layout',
                            status: "<strong>Kullanıcı onaylandı.</strong><br>Kulanıcıya E-Posta göderilemedi.",
                            users: usersVal
                        });
                    });

                }, function (errorObject) {
                    console.log("Realtime DB hatası: liste alınamadı. " + errorObject.code);

                    // TODO: hata mesajı verilecek
                    res.render('dashboard/doctorAcceptList', {
                        layout: 'dashboard/layout',
                        status: "<strong>Hata!</strong> Liste yenilenemedi.",
                        users: usersVal
                    });
                });

            }
        });


    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.doktorOnayIptalGet = function (req, res) {
    if (req.session.userName) {

        var usersVal = [];
        admin.auth().deleteUser(req.params.uid)
            .then(function () {

                db.ref("users").child(req.params.uid).remove(function (error) {
                    if (error) {
                        console.log("Realtime DB remove hatası: Kullanıcı silinemedi. " + error);
                        res.render('dashboard/doctorList', {
                            layout: 'dashboard/layout',
                            users: usersVal,
                            status: "<strong>Hata!</strong> Kullanıcı veritabanından silinemedi.<br>Authentication kaydı silindi."
                        });
                    } else {
                        //db'den Silme başarılı
                        var usrr = require("../model/entity/Users");
                        var usersVal = [];

                        db.ref("users").orderByChild("active").equalTo(false).once("value", function (snapshot) {
                            snapshot.forEach(function (params) {
                                usrr = params.val();
                                usersVal.push(usrr);
                            })
                            res.render('dashboard/doctorAcceptList', {
                                layout: 'dashboard/layout',
                                users: usersVal,
                                status: "del"
                            });
                        }, function (errorObject) {
                            res.render('dashboard/doctorAcceptList', {
                                layout: 'dashboard/layout',
                                users: usersVal,
                                status: "Doktor reddedildi.<br><strong>Hata!</strong> Kullanıcı bilgileri okunamadı, liste yenilenemiyor."
                            });
                        });

                    }
                });
            })
            .catch(function (error) { //Auth hatası
                res.render('dashboard/doctorList', {
                    layout: 'dashboard/layout',
                    users: usersVal,
                    status: "<strong>Hata!</strong> Kullanıcı veritabanı ve Authentication kaydı silinemedi!"
                });
            });
    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.doktorSilGet = function (req, res) {
    if (req.session.userName) {

        var usersVal = [];
        var branches = {};
        var brName = [];
        var brCount = [];

        admin.auth().deleteUser(req.params.uid)
            .then(function () {

                db.ref("users").child(req.params.uid).remove(function (error) {
                    if (error) {
                        console.log("Realtime DB remove hatası: Kullanıcı silinemedi. " + error);
                        res.render('dashboard/doctorList', {
                            layout: 'dashboard/layout',
                            users: usersVal,
                            branches,
                            status: "<strong>Hata!</strong> Kullanıcı veritabanından silinemedi.<br>Authentication kaydı silindi."
                        });
                    } else {
                        //db'den Silme başarılı
                        db.ref("users").orderByChild("active").equalTo(true).once("value", function (snapshot) {
                            snapshot.forEach(function (params) {
                                usersVal.push(params.val());

                                var isContains = false;
                                var ind = 0;
                                brName.forEach(function (name) {
                                    if (name == params.val().branchModel.branch_name) {
                                        isContains = true;
                                        ind = brName.indexOf(name);
                                    }
                                })
                                if (!isContains) {
                                    brName.push(params.val().branchModel.branch_name);
                                    brCount.push(1);
                                } else {
                                    brCount[ind] = brCount[ind] + 1;
                                }
                            })
                            brName.forEach(function (name) {
                                branches[name] = brCount[brName.indexOf(name)];
                            })
                            res.render('dashboard/doctorList', {
                                layout: 'dashboard/layout',
                                users: usersVal,
                                branches,
                                status: "ok"
                            });
                        }, function (errorObject) {
                            res.render('dashboard/doctorList', {
                                layout: 'dashboard/layout',
                                users: usersVal,
                                branches,
                                status: "<strong>Hata!</strong> Kullanıcı bilgileri okunamadı."
                            });
                        });

                    }
                });
            })
            .catch(function (error) { //Auth hatası
                res.render('dashboard/doctorList', {
                    layout: 'dashboard/layout',
                    users: usersVal,
                    branches,
                    status: "<strong>Hata!</strong> Kullanıcı veritabanı veya Authentication hatası!<br>" + error
                });
            });
    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

//Mail
module.exports.mailSablonuDuzenleGet = function (req, res) {
    //if (req.session.userName) {

    //    mailRef = db.ref("mailTemplate");

    //    mailRef.once("value", function (snapshot) {
    //        res.render('dashboard/mailTemplateEdit', {
    //            layout: 'dashboard/layout',
    //            status: "no",
    //            newUser: {
    //                subject: snapshot.val().newUser.subject,
    //                html_text: snapshot.val().newUser.html_text
    //            },
    //            acceptUser: {
    //                subject: snapshot.val().acceptUser.subject,
    //                html_text: snapshot.val().acceptUser.html_text
    //            },
    //        });
    //    }, function (errorObject) {
    //        console.log("The read failed: " + errorObject.code);

    //        res.render('dashboard/mailTemplateEdit', {
    //            layout: 'dashboard/layout',
    //            status: "<Strong>Hata!</Strong> Şablon bilgileri alınamadı.",
    //            newUser: {
    //                subject: "",
    //                html_text: ""
    //            },
    //            acceptUser: {
    //                subject: "",
    //                html_text: ""
    //            },
    //        });
    //    });

    //} else {
    //    res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    //}
}

module.exports.mailSablonuDuzenlePost = function (req, res) {
    if (req.session.userName) {

        var mailRef, mailTemplate;
        if (req.body.temp_type == "new") {
            mailRef = db.ref("mailTemplate/newUser");
            mailTemplate = {
                temp_type: req.body.temp_type,
                subject: req.body.subject,
                html_text: req.body.text
            }
        } else if (req.body.temp_type == "accept") {
            mailRef = db.ref("mailTemplate/acceptUser");
            mailTemplate = {
                temp_type: req.body.temp_type,
                subject: req.body.accept_subject,
                html_text: req.body.accept_text
            }
        }



        mailRef.update(mailTemplate, function (error) {
            if (error) {
                console.log("Realtime DB set hatası: Şablon kayıt edilemedi. " + error);

                res.render('dashboard/mailTemplateEdit', {
                    layout: 'dashboard/layout',
                    newUser: {
                        subject: "",
                        html_text: ""
                    },
                    acceptUser: {
                        subject: "",
                        html_text: ""
                    },
                    status: "<strong>Hata!</strong> Şablon kayıt edilemedi.<br>" + error
                });
            } else {
                //güncelleme başarılı
                ref = db.ref("mailTemplate");
                ref.once("value", function (snapshot) {
                    //güncelleme ve veri çekme başarılı
                    res.render('dashboard/mailTemplateEdit', {
                        layout: 'dashboard/layout',
                        newUser: {
                            subject: snapshot.val().newUser.subject,
                            html_text: snapshot.val().newUser.html_text
                        },
                        acceptUser: {
                            subject: snapshot.val().acceptUser.subject,
                            html_text: snapshot.val().acceptUser.html_text
                        },
                        status: "ok"
                    });
                }, function (errorObject) {
                    // güncelleme başarılı, veri çekme başarısız
                    console.log("The read failed: " + errorObject.code);

                    res.render('dashboard/mailTemplateEdit', {
                        layout: 'dashboard/layout',
                        status: "<Strong>Hata!</Strong> Şablon bilgileri alınamadı.",
                        newUser: {
                            subject: "",
                            html_text: ""
                        },
                        acceptUser: {
                            subject: "",
                            html_text: ""
                        },
                    });
                });
            }
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.mailTestGet = function (req, res) {
    if (req.session.userName) {

        res.render('dashboard/MailTest', {
            layout: 'dashboard/layout',
            status: "no"
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.mailTestPost = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("users");
        // var usersVal = [];
        var mail_to = "";

        ref.orderByChild("active").equalTo(true).once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                // usersVal.push(params.val());
                if (mail_to == "") {
                    mail_to += params.val().email;
                } else {
                    mail_to += ", " + params.val().email;
                }
            })

            //Mail gönderiliyor
            sendMail(req.body.text, req.body.subject, mail_to);
            // res.render('dashboard/doctorList', {layout: 'dashboard/layout', users: usersVal});
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });



    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

//Notifications
module.exports.bildirimGonderGet = function (req, res) {
    if (req.session.userName) {

        res.render('dashboard/notificationSend', {
            layout: 'dashboard/layout',
            status: "no"
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.bildirimGonderPost = function (req, res) {
    if (req.session.userName) {

        // The topic name can be optionally prefixed with "/topics/".
        var radio = req.body.radio_to;
        var topic = 'no';

        switch (radio) {
            case "doctor":
                topic = "doctor";
                break;
            case "all":
                topic = "all";
                break;
            default:
                var topic = 'no';
                break;
        }

        var message = {
            // data: {
            //     score: '850',
            //     time: '2:45'
            // },
            // topic: topic

            notification: {
                title: req.body.title,
                body: req.body.description,
            },
            android: {
                ttl: 3600 * 1000,
                notification: {
                    // title: req.body.title,
                    // body: req.body.description,
                    // icon: 'stock_ticker_update',
                    // color: '#f45342',
                },
            },
            apns: {
                // header: {
                //     "apns-priority": "10"
                // },
                payload: {
                    aps: {
                        // alert: {
                        //     // title: req.body.title,
                        //     // "action-loc-key": "open",
                        //     body: req.body.description,
                        // },
                        // "sound": "default",
                        badge: 1,
                    },
                },
            },
            topic: topic

        };

        // tanımladığımız konuyu(all, doctor) dinleyen cihazlara bildirim gönderiyoruz
        admin.messaging().send(message)
            .then((response) => {
                // Response is a message ID string.

                // gönderilen bildirim veritabanına kayıt ediliyor
                var trh = new Date().getTime();
                var ref = db.ref("notifications");
                var uid = trh + req.body.title;
                uid = clearSpecialChars(uid);
                var notificationsRef = ref.child(uid);

                notificationsRef.set({
                    title: req.body.title,
                    description: req.body.description,
                    topic: topic,
                    uid: uid
                }, function (error) {
                    if (error) {
                        console.log("Realtime DB set hatası: Bildirim gönderildi ancak kayıt edilemedi. " + error);
                        res.render('dashboard/notificationSend', {
                            layout: 'dashboard/layout',
                            status: "<strong>Hata!</strong> Bildirim gönderildi ancak kayıt edilemedi.<br>" + error
                        });
                    } else {
                        //kayıt başarılı

                        res.render('dashboard/notificationSend', {
                            layout: 'dashboard/layout',
                            status: "ok"
                        });
                    }
                });
            })
            .catch((error) => {
                console.log('Error sending message:', error);
                res.render('dashboard/notificationSend', {
                    layout: 'dashboard/layout',
                    status: "<Strong>Hata!</Strong> Bildirim gönderilemedi:<br>" + error
                });
            });


    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.bildirimAlmaTestGet = function (req, res) {
    if (req.session.userName) {

        res.render('dashboard/notificationReceiveTest', {
            layout: 'dashboard/layout',
            status: "no"
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.bildirimListeleGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("notifications");
        var notificationList = [];

        // uid'de prefix olarak tarih değerini kullandığımız için sıralama uid'ye göre
        ref.orderByChild("uid")/*.limitToLast(50)*/.once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                // notificationList.push(params.val()); // order by asc
                notificationList.unshift(params.val()); // order by desc
            })

            res.render('dashboard/notificationList', {
                layout: 'dashboard/layout',
                notificationList: notificationList,
                status: "no"
            });
        }, function (errorObject) {
            res.render('dashboard/notificationList', {
                layout: 'dashboard/layout',
                notificationList: notificationList,
                status: "<Strong>Hata!</Strong> Veritabanı okuma hatası: " + errorObject.code
            });
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

//Helpful Links
module.exports.faydaliLinkListeleGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("helpfulLinks");
        var hLinks = [];

        ref.orderByChild("title").once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                hLinks.push(params.val());
            })

            res.render('dashboard/helpfulLinkList', {
                layout: 'dashboard/layout',
                helpfulLinkList: hLinks,
                status: "no"
            });
        }, function (errorObject) {
            res.render('dashboard/helpfulLinkList', {
                layout: 'dashboard/layout',
                helpfulLinkList: hLinks,
                status: "<Strong>Hata!</Strong> Veritabanı okuma hatası: " + errorObject.code
            });
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.faydaliLinkEkleGet = function (req, res) {
    if (req.session.userName) {
        res.render('dashboard/helpfulLinkAdd', {
            layout: 'dashboard/layout',
            status: "no"
        });
    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.faydaliLinkEklePost = function (req, res) {
    if (req.session.userName) {

        var trh = new Date().getTime();
        var uid = trh + req.body.title;
        uid = clearSpecialChars(uid);
        var ref = db.ref("helpfulLinks");
        var linkRef = ref.child(uid);
        var url;

        if (req.body.url.substring(0, 7) == "http://" || req.body.url.substring(0, 8) == "https://") {
            url = req.body.url;
        } else {
            url = "http://" + req.body.url;
        }

        linkRef.set({
            title: req.body.title,
            description: req.body.description,
            url: url,
            uid: uid
        }, function (error) {
            if (error) {
                console.log("Realtime DB set hatası: Faydalı Bağlantı eklenemedi. " + error);
                res.render('dashboard/helpfulLinkAdd', {
                    layout: 'dashboard/layout',
                    status: "<strong>Hata!</strong> Faydalı Bağlantı eklenemedi.<br>" + error
                });
            } else {
                //kayıt başarılı

                res.render('dashboard/helpfulLinkAdd', {
                    layout: 'dashboard/layout',
                    status: "ok"
                });
            }
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.faydaliLinkDuzenleGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("helpfulLinks/" + req.params.uid);

        ref.once("value", function (snapshot) {
            res.render('dashboard/helpfulLinkEdit', {
                layout: 'dashboard/layout',
                hfLink: snapshot.val(),
                status: "no"
            });
        }, function (errorObject) {
            res.render('dashboard/helpfulLinkEdit', {
                layout: 'dashboard/layout',
                hfLink: {},
                status: "<Strong>Hata!</Strong> Veritabanı okuma hatası: " + errorObject.code
            });
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.faydaliLinkDuzenlePost = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("helpfulLinks");
        var linkRef = ref.child(req.body.uid);
        var url;

        if (req.body.url.substring(0, 7) == "http://" || req.body.url.substring(0, 8) == "https://") {
            url = req.body.url;
        } else {
            url = "http://" + req.body.url;
        }

        linkRef.update({
            title: req.body.title,
            description: req.body.description,
            url: url,
            // uid: req.body.uid
        }, function (error) {
            if (error) {
                console.log("Realtime DB update hatası: Faydalı Bağlantı güncellenemedi. " + error);
                res.render('dashboard/helpfulLinkEdit', {
                    layout: 'dashboard/layout',
                    hfLink: {
                        title: req.body.title,
                        description: req.body.description,
                        url: url
                    },
                    status: "<strong>Hata!</strong> Faydalı Bağlantı güncellenemedi.<br>" + error
                });
            } else {
                //güncelleme başarılı

                res.render('dashboard/helpfulLinkEdit', {
                    layout: 'dashboard/layout',
                    hfLink: {
                        title: req.body.title,
                        description: req.body.description,
                        url: url
                    },
                    status: "ok"
                });
            }
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.faydaliLinkSilGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("helpfulLinks");
        var hLinks = [];

        // var ref = db.ref("helpfulLinks");
        var linkRef = ref.child(req.params.uid);

        linkRef.remove(function (error) {
            if (error) {
                console.log("Realtime DB remove hatası: Faydalı Bağlantı silinemedi. " + error);
                res.render('dashboard/helpfulLinkList', {
                    layout: 'dashboard/layout',
                    helpfulLinkList: hLinks,
                    status: "<strong>Hata!</strong> Faydalı Bağlantı silinemedi.<br>" + error
                });
            } else {
                //Silme başarılı

                ref.orderByChild("title").once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        hLinks.push(params.val());
                    })
                }, function (errorObject) {
                });

                res.render('dashboard/helpfulLinkList', {
                    layout: 'dashboard/layout',
                    helpfulLinkList: hLinks,
                    status: "ok"
                });
            }
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

//Brand
module.exports.markalarGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("brands");
        var brands = [];

        ref.orderByChild("brandName").once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                brands.push(params.val());
            })

            res.render('dashboard/brand', {
                layout: 'dashboard/layout',
                brands: brands,
                status: "no"
            });
        }, function (errorObject) {
            res.render('dashboard/brand', {
                layout: 'dashboard/layout',
                brands: brands,
                status: "<Strong>Hata!</Strong> Marka listesi alınamadı: " + errorObject.code
            });
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.markaEklePost = function (req, res) {
    if (req.session.userName) {

        var trh = new Date().getTime();
        var uid = trh + req.body.brandName;
        uid = clearSpecialChars(uid);
        var ref = db.ref("brands");
        var brandRef = ref.child(uid);

        var ref = db.ref("brands");
        var brands = [];

        brandRef.set({
            brandName: req.body.brandName,
            uid: uid
        }, function (error) {
            if (error) {

                ref.orderByChild("brandName").once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        brands.push(params.val());
                    })

                    res.render('dashboard/brand', {
                        layout: 'dashboard/layout',
                        brands: brands,
                        status: "<strong>Hata!</strong> Marka eklenemedi.<br>" + error
                    });
                }, function (errorObject) {
                    res.render('dashboard/brand', {
                        layout: 'dashboard/layout',
                        brands: brands,
                        status: "<strong>Hata!</strong> Marka eklenemedi.<br>" + error +
                            "<br><hr><br><Strong>Hata!</Strong> Marka listesi alınamadı: " + errorObject.code
                    });
                });
            } else {
                ref.orderByChild("brandName").once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        brands.push(params.val());
                    })

                    res.render('dashboard/brand', {
                        layout: 'dashboard/layout',
                        brands: brands,
                        status: "ok"
                    });
                }, function (errorObject) {
                    res.render('dashboard/brand', {
                        layout: 'dashboard/layout',
                        brands: brands,
                        status: "<strong>Marka eklendi.</strong> <br><hr><br> Marka listesi alınamadı: " + errorObject.code
                    });
                });
            }
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.markaSilGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("brands");
        var brands = [];
        var brandRef = ref.child(req.params.uid);

        brandRef.remove(function (error) {
            if (error) {

                ref.orderByChild("brandName").once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        brands.push(params.val());
                    })

                    res.render('dashboard/brand', {
                        layout: 'dashboard/layout',
                        brands: brands,
                        status: "<strong>Hata!</strong> Marka silinemedi.<br>" + error
                    });
                }, function (errorObject) {
                    res.render('dashboard/brand', {
                        layout: 'dashboard/layout',
                        brands: brands,
                        status: "<strong>Hata!</strong> Marka silinemedi.<br>" + error +
                            "<br><hr><br><Strong>Hata!</Strong> Marka listesi alınamadı: " + errorObject.code
                    });
                });
            } else {
                //Silme başarılı

                ref.orderByChild("brandName").once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        brands.push(params.val());
                    })

                    res.render('dashboard/brand', {
                        layout: 'dashboard/layout',
                        brands: brands,
                        status: "<strong>Marka silindi.</strong><br>"
                    });
                }, function (errorObject) {
                    res.render('dashboard/brand', {
                        layout: 'dashboard/layout',
                        brands: brands,
                        status: "<strong>Marka silindi.</strong><br>" + error +
                            "<br><hr><br><Strong>Hata!</Strong> Marka listesi alınamadı: " + errorObject.code
                    });
                });
            }
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

//Branch
module.exports.branslarGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("branches");
        var branches = [];

        ref.orderByChild("branch_name").once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                branches.push(params.val());
            })

            res.render('dashboard/branch', {
                layout: 'dashboard/layout',
                branches: branches,
                status: "no"
            });
        }, function (errorObject) {
            res.render('dashboard/branch', {
                layout: 'dashboard/layout',
                branches: branches,
                status: "<Strong>Hata!</Strong> Branş listesi alınamadı: " + errorObject.code
            });
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.bransEklePost = function (req, res) {
    if (req.session.userName) {

        var trh = new Date().getTime();
        var uid = trh + req.body.branch_name;
        uid = clearSpecialChars(uid);
        var ref = db.ref("branches");
        var branchRef = ref.child(uid);

        var branches = [];

        branchRef.set({
            branch_name: req.body.branch_name,
            uid: uid
        }, function (error) {
            if (error) {

                ref.orderByChild("branch_name").once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        branches.push(params.val());
                    })

                    res.render('dashboard/branch', {
                        layout: 'dashboard/layout',
                        branches: branches,
                        status: "<strong>Hata!</strong> Branş eklenemedi.<br>" + error
                    });
                }, function (errorObject) {
                    res.render('dashboard/branch', {
                        layout: 'dashboard/layout',
                        branches: branches,
                        status: "<strong>Hata!</strong> Branş eklenemedi.<br>" + error +
                            "<br><hr><br><Strong>Hata!</Strong> Branş listesi alınamadı: " + errorObject.code
                    });
                });
            } else {
                ref.orderByChild("branch_name").once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        branches.push(params.val());
                    })

                    res.render('dashboard/branch', {
                        layout: 'dashboard/layout',
                        branches: branches,
                        status: "ok"
                    });
                }, function (errorObject) {
                    res.render('dashboard/branch', {
                        layout: 'dashboard/layout',
                        branches: branches,
                        status: "<strong>Branş eklendi.</strong> <br><hr><br> Branş listesi alınamadı: " + errorObject.code
                    });
                });
            }
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.bransSilGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("branches");
        var branches = [];
        var branchRef = ref.child(req.params.uid);

        branchRef.remove(function (error) {
            if (error) {

                ref.orderByChild("branch_name").once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        branches.push(params.val());
                    })

                    res.render('dashboard/branch', {
                        layout: 'dashboard/layout',
                        branches: branches,
                        status: "<strong>Hata!</strong> Branş silinemedi.<br>" + error
                    });
                }, function (errorObject) {
                    res.render('dashboard/branch', {
                        layout: 'dashboard/layout',
                        branches: branches,
                        status: "<strong>Hata!</strong> Branş silinemedi.<br>" + error +
                            "<br><hr><br><Strong>Hata!</Strong> Branş listesi alınamadı: " + errorObject.code
                    });
                });
            } else {
                //Silme başarılı

                ref.orderByChild("branch_name").once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        branches.push(params.val());
                    })

                    res.render('dashboard/branch', {
                        layout: 'dashboard/layout',
                        branches: branches,
                        status: "<strong>Branş silindi.</strong><br>"
                    });
                }, function (errorObject) {
                    res.render('dashboard/branch', {
                        layout: 'dashboard/layout',
                        branches: branches,
                        status: "<strong>Branş silindi.</strong><br>" + error +
                            "<br><hr><br><Strong>Hata!</Strong> Branş listesi alınamadı: " + errorObject.code
                    });
                });
            }
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

//Campaigns
module.exports.kampanyaEkleGet = function (req, res) {
    if (req.session.userName) {
        //token alınıyor
        admin.auth().createCustomToken(AdminUid)
            .then(function (customToken) {
                res.render('dashboard/campaignAdd', {
                    layout: 'dashboard/layout',
                    customToken,
                    status: "no"
                });
            })
            .catch(function (error) {
                console.log("Error creating custom token:", error);
                res.render('dashboard/campaignAdd', {
                    layout: 'dashboard/layout',
                    customToken: "",
                    status: "Kimlik doğrulama sağlanamadı, klasörler yüklenemeyebilir."
                });
            });
    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.kampanyaListeleGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("campaigns");
        var campaigns = [];

        //token alınıyor
        admin.auth().createCustomToken(AdminUid)
            .then(function (customToken) {

                ref.orderByChild("title").once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        var sd = new Date(Number(params.val().start_date));
                        var fd = new Date(Number(params.val().finish_date));
                        campaigns.push({
                            title: params.val().title,
                            description: params.val().description,
                            download_url: params.val().download_url,
                            storage_name: params.val().storage_name,
                            type: params.val().type,
                            start_date: sd.getDate() + "." + (sd.getMonth() + 1) + "." + sd.getFullYear(),
                            finish_date: fd.getDate() + "." + (fd.getMonth() + 1) + "." + fd.getFullYear(),
                            uid: params.val().uid
                        });
                    })

                    res.render('dashboard/campaignList', {
                        layout: 'dashboard/layout',
                        campaignList: campaigns,
                        customToken,
                        status: "no"
                    });
                }, function (errorObject) {
                    res.render('dashboard/campaignList', {
                        layout: 'dashboard/layout',
                        campaignList: campaigns,
                        customToken,
                        status: "<Strong>Hata!</Strong> Veritabanı okuma hatası: " + errorObject.code
                    });
                });
            })
            .catch(function (error) {
                console.log("Error creating custom token:", error);
                res.render('dashboard/campaignList', {
                    layout: 'dashboard/layout',
                    campaignList: campaigns,
                    customToken,
                    status: "<Strong>Hata!</Strong> Firebase token oluşturma hatası: " + errorObject.code
                });
            });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.kampanyaDuzenleGet = function (req, res) {
    if (req.session.userName) {
        //token alınıyor
        admin.auth().createCustomToken(AdminUid)
            .then(function (customToken) {

                var ref = db.ref("campaigns/" + req.params.uid);

                ref.once("value", function (snapshot) {
                    var cmpResult = snapshot.val();
                    cmpResult.start_date = longDateToDateInput(snapshot.val().start_date);
                    cmpResult.finish_date = longDateToDateInput(snapshot.val().finish_date);

                    res.render('dashboard/campaignEdit', {
                        layout: 'dashboard/layout',
                        customToken,
                        campaign: cmpResult,
                        status: "no"
                    });
                }, function (errorObject) {
                    res.render('dashboard/campaignEdit', {
                        layout: 'dashboard/layout',
                        customToken,
                        campaign: {},
                        status: "<Strong>Hata!</Strong> Veritabanı okuma hatası: " + errorObject.code
                    });
                });
            })
            .catch(function (error) {
                console.log("Error creating custom token:", error);
                res.render('dashboard/campaignEdit', {
                    layout: 'dashboard/layout',
                    customToken: "",
                    campaign: {},
                    status: "Kimlik doğrulama sağlanamadı, klasörler yüklenemeyebilir."
                });
            });
    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.kampanyaDuzenlePost = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("campaigns");
        var campRef = ref.child(req.body.uid);

        var sDate = new Date(req.body.start_date).getTime();
        var fDate = new Date(req.body.finish_date).getTime();

        campRef.update({
            title: req.body.campaign_title,
            description: req.body.campaign_description,
            download_url: req.body.download_url,
            storage_name: req.body.storage_name,
            start_date: sDate,
            finish_date: fDate,
        }, function (error) {
            if (error) {
                console.log("Realtime DB update hatası: Kampanya güncellenemedi. " + error);
                res.render('dashboard/campaignEdit', {
                    layout: 'dashboard/layout',
                    campaign: {
                        title: req.body.campaign_title,
                        description: req.body.campaign_description,
                        download_url: req.body.download_url,
                        storage_name: req.body.storage_name,
                        start_date: req.body.start_date,
                        finish_date: req.body.finish_date,
                        uid: req.body.uid,
                    },
                    status: "<strong>Hata!</strong> Kampanya güncellenemedi.<br>" + error
                });
            } else {
                //güncelleme başarılı

                res.render('dashboard/campaignEdit', {
                    layout: 'dashboard/layout',
                    campaign: {
                        title: req.body.campaign_title,
                        description: req.body.campaign_description,
                        download_url: req.body.download_url,
                        storage_name: req.body.storage_name,
                        start_date: req.body.start_date,
                        finish_date: req.body.finish_date,
                        uid: req.body.uid,
                    },
                    status: "ok"
                });
            }
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

//product category
module.exports.kategoriListeleGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("menu/productCategory");
        var foldersVal = [];

        ref.orderByChild("name").once("value", function (snapshot) {
            // ref.orderByChild("create_date").once("value", function(snapshot) {
            snapshot.forEach(function (params) {
                // var d = new Date(Number(params.create_date));
                // var a = d.getDate() + "." + (d.getMonth()+1) + "." + d.getFullYear();
                foldersVal.push(params.val());
            })

            //token alınıyor
            admin.auth().createCustomToken(AdminUid)
                .then(function (customToken) {
                    res.render('dashboard/storage/productCategoryList', {
                        layout: 'dashboard/layout',
                        folders: foldersVal,
                        customToken,
                        status: "ok"
                    });
                })
                .catch(function (error) {
                    console.log("Error creating custom token:", error);
                    res.render('dashboard/storage/productCategoryList', {
                        layout: 'dashboard/layout',
                        folders: foldersVal,
                        customToken: "",
                        status: "<Strong>Hata!</Strong> Kimlik doğrulama hatası:<br> " + error
                    });
                });
        }, function (errorObject) {
            res.render('dashboard/storage/productCategoryList', {
                layout: 'dashboard/layout',
                folders: foldersVal,
                customToken: "",
                status: "<Strong>Hata!</Strong> Veritabanı okuma hatası: " + errorObject.code
            });
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.kategoriEkleGet = function (req, res) {
    if (req.session.userName) {
        //token alınıyor
        admin.auth().createCustomToken(AdminUid)
            .then(function (customToken) {
                res.render('dashboard/storage/productCategoryAdd', {
                    layout: 'dashboard/layout',
                    customToken,
                    status: "no"
                });
            })
            .catch(function (error) {
                console.log("Error creating custom token:", error);
                res.render('dashboard/storage/productCategoryAdd', {
                    layout: 'dashboard/layout',
                    customToken: "",
                    status: "<strong>Hata!</strong> Kimlik doğrulamasında sorun oluştu, bu sayfayı yeniden açmayı deneyin."
                });
            });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.kategoriEklePost = function (req, res) {
    if (req.session.userName) {

        var trh = new Date().getTime();
        var uid = trh + req.body.folder_name;
        uid = clearSpecialChars(uid);
        var ref = db.ref("menu");
        var dRef = ref.child("productCategory");
        var menuRef = dRef.child(uid);

        var permission = true;
        if (req.body.folder_permission == "on") {
            permission = false;
        }

        //token alınıyor
        admin.auth().createCustomToken(AdminUid)
            .then(function (customToken) {
                menuRef.set({
                    name: req.body.folder_name,
                    uid: uid,
                    title: req.body.folder_title,
                    description: req.body.folder_description,
                    permission: permission,
                    protuct_type_logo_url: req.body.protuct_type_logo_url
                }, function (error) {
                    if (error) {
                        console.log("Realtime DB set hatası: (menu) Kategori eklenemedi. " + error);
                        res.render('dashboard/storage/productCategoryAdd', {
                            layout: 'dashboard/layout',
                            customToken,
                            status: "<strong>Hata!</strong> Klasör eklenemedi.<br>" + error
                        });
                    } else {
                        //kayıt başarılı

                        var ref = db.ref("folders");
                        var dRef = ref.child("productCategory");
                        var menuRef = dRef.child(uid);
                        menuRef.set({
                            name: req.body.folder_name,
                            uid: uid,
                            title: req.body.folder_title,
                            description: req.body.folder_description,
                            permission: permission,
                            protuct_type_logo_url: req.body.protuct_type_logo_url
                        }, function (error) {
                            if (error) {
                                console.log("Realtime DB set hatası: (folders) Kategori eklenemedi. " + error);
                                res.render('dashboard/storage/productCategoryAdd', {
                                    layout: 'dashboard/layout',
                                    customToken,
                                    status: "<strong>Hata!</strong> Klasör eklenemedi.<br>" + error
                                });
                            } else {
                                //kayıt başarılı
                                res.render('dashboard/storage/productCategoryAdd', {
                                    layout: 'dashboard/layout',
                                    customToken,
                                    status: "ok"
                                });
                            }
                        });
                    }
                });
            })
            .catch(function (error) {
                console.log("Error creating custom token:", error);
                res.render('dashboard/storage/productCategoryAdd', {
                    layout: 'dashboard/layout',
                    customToken: "",
                    status: "<strong>Hata!</strong> Kimlik doğrulamasında sorun oluştu, bu sayfayı yeniden açmayı deneyin.<br>" + error
                });
            });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.kategoriDuzenleGet = function (req, res) {
    if (req.session.userName) {

        var productCategoryModel = require("../model/entity/ProductCategory");
        var pcm = new productCategoryModel();

        var ref = db.ref("menu/productCategory/" + req.params.uid);

        //token alınıyor
        admin.auth().createCustomToken(AdminUid)
            .then(function (customToken) {
                ref.once("value", function (snapshot) {
                    // snapshot.forEach(function (params) {
                    pcm.name = snapshot.val().name;
                    pcm.title = snapshot.val().title;
                    pcm.description = snapshot.val().description;
                    pcm.permission = snapshot.val().permission;
                    pcm.protuct_type_logo_url = snapshot.val().protuct_type_logo_url;
                    pcm.uid = snapshot.val().uid;
                    // });

                    res.render('dashboard/storage/productCategoryEdit', {
                        layout: 'dashboard/layout',
                        prodCat: pcm,
                        customToken,
                        status: "no"
                    });
                }, function (errorObject) {
                    res.render('dashboard/storage/productCategoryEdit', {
                        layout: 'dashboard/layout',
                        prodCat: pcm,
                        customToken,
                        status: "<Strong>Hata!</Strong> Veritabanı okuma hatası: " + errorObject.code
                    });
                });
            })
            .catch(function (error) {
                console.log("Error creating custom token:", error);
                res.render('dashboard/storage/productCategoryEdit', {
                    layout: 'dashboard/layout',
                    prodCat: pcm,
                    customToken: "",
                    status: "<strong>Hata!</strong> Kimlik doğrulamasında sorun oluştu, bu sayfayı yeniden açmayı deneyin.<br>" + error
                });
            });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.kategoriDuzenlePost = function (req, res) {
    if (req.session.userName) {

        var productCategoryModel = require("../model/entity/ProductCategory");
        var pcm = new productCategoryModel();

        var menuRef = db.ref("menu/productCategory/" + req.body.folder_uid);

        var permission = true;
        if (req.body.folder_permission == "on") {
            permission = false;
        }

        pcm.name = req.body.folder_name;
        pcm.title = req.body.folder_title;
        pcm.description = req.body.folder_description;
        pcm.permission = permission;
        pcm.protuct_type_logo_url = req.body.protuct_type_logo_url;
        pcm.uid = req.body.folder_uid;

        //token alınıyor
        admin.auth().createCustomToken(AdminUid)
            .then(function (customToken) {
                menuRef.update(pcm, function (error) {
                    if (error) {
                        console.log("Realtime DB set hatası: (menu) Kategori eklenemedi. " + error);
                        res.render('dashboard/storage/productCategoryEdit', {
                            layout: 'dashboard/layout',
                            prodCat: pcm,
                            customToken,
                            status: "<strong>Hata!</strong> Klasör eklenemedi.<br>" + error
                        });
                    } else {
                        //kayıt başarılı

                        var foldersRef = db.ref("folders/productCategory/" + req.body.folder_uid);
                        foldersRef.update(pcm, function (error) {
                            if (error) {
                                console.log("Realtime DB set hatası: (folders) Kategori eklenemedi. " + error);
                                res.render('dashboard/storage/productCategoryEdit', {
                                    layout: 'dashboard/layout',
                                    prodCat: pcm,
                                    customToken,
                                    status: "<strong>Hata!</strong> Klasör eklenemedi.<br>" + error
                                });
                            } else {
                                //kayıt başarılı
                                res.render('dashboard/storage/productCategoryEdit', {
                                    layout: 'dashboard/layout',
                                    prodCat: pcm,
                                    customToken,
                                    status: "ok"
                                });
                            }
                        });
                    }
                });
            })
            .catch(function (error) {
                console.log("Error creating custom token:", error);
                res.render('dashboard/storage/productCategoryEdit', {
                    layout: 'dashboard/layout',
                    prodCat: pcm,
                    customToken,
                    status: "<strong>Hata!</strong> Kimlik doğrulamasında sorun oluştu, bu sayfayı yeniden açmayı deneyin.<br>" + error
                });
            });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.kategoriSilGet = function (req, res) {
    if (req.session.userName) {

        // var productCategoryModel = require("../model/entity/ProductCategory");
        // var pcm = new productCategoryModel();

        // var ref = db.ref("menu/productCategory/" + req.params.uid);

        // ref.once("value", function(snapshot) {
        //     // snapshot.forEach(function (params) {
        //         pcm.name = snapshot.val().name;
        //         pcm.title = snapshot.val().title;
        //         pcm.description = snapshot.val().description;
        //         pcm.permission = snapshot.val().permission;
        //         pcm.uid = snapshot.val().uid;
        //     // });

        //     res.render('dashboard/storage/productCategoryEdit', {
        //         layout: 'dashboard/layout',
        //         prodCat: pcm,
        //         status: "no"
        //     });
        // }, function (errorObject) {
        //         res.render('dashboard/storage/productCategoryEdit', {
        //             layout: 'dashboard/layout',
        //             prodCat: pcm,
        //             status: "<Strong>Hata!</Strong> Veritabanı okuma hatası: " + errorObject.code
        //         });
        // });

        var ref = db.ref("menu/productCategory");
        var foldersVal = [];

        db.ref("folders/productCategory/" + req.params.uid).remove(function (error) {
            if (error) {
                console.log("Realtime DB update hatası: Kategori bilgileri veritabanından (folders) silinemedi. " + error);
            } else {
                //datebase folders tablosundan silinen menu tablosundan da siliniyor
                db.ref("menu/productCategory/" + req.params.uid).remove(function (error) {
                    if (error) {
                        console.log("Realtime DB update hatası: Dosya bilgileri veritabanından (menu) silinemedi. " + error);
                    } else {
                        // console.log("dosya bilgileri dbden (menu) silindi");
                        ref.orderByChild("name").once("value", function (snapshot) {
                            snapshot.forEach(function (params) {
                                foldersVal.push(params.val());
                            })

                            //token alınıyor
                            admin.auth().createCustomToken(AdminUid)
                                .then(function (customToken) {
                                    res.render('dashboard/storage/productCategoryList', {
                                        layout: 'dashboard/layout',
                                        folders: foldersVal,
                                        customToken,
                                        status: "ok"
                                    });
                                })
                                .catch(function (error) {
                                    console.log("Error creating custom token:", error);
                                    res.render('dashboard/storage/productCategoryList', {
                                        layout: 'dashboard/layout',
                                        folders: foldersVal,
                                        customToken: "",
                                        status: "<Strong>Hata!</Strong> Kimlik doğrulama hatası:<br> " + error
                                    });
                                });
                        }, function (errorObject) {
                            res.render('dashboard/storage/productCategoryList', {
                                layout: 'dashboard/layout',
                                folders: foldersVal,
                                customToken: "",
                                status: "<Strong>Hata!</Strong> Veritabanı okuma hatası: " + errorObject.code
                            });
                        });
                    }
                });
            }
        });


    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

//product
module.exports.urunListeleGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("menu/productCategory");
        var prodCatList = [];

        ref.orderByChild("name").once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                prodCatList.push({
                    name: params.val().name,
                    uid: params.val().uid
                });
            })

            //token alınıyor
            admin.auth().createCustomToken(AdminUid)
                .then(function (customToken) {
                    res.render('dashboard/storage/productList', {
                        layout: 'dashboard/layout',
                        prodCatList,
                        customToken,
                        status: "ok"
                    });
                })
                .catch(function (error) {
                    console.log("Error creating custom token:", error);
                    res.render('dashboard/storage/productList', {
                        layout: 'dashboard/layout',
                        prodCatList,
                        customToken: "",
                        status: "Kimlik doğrulama sağlanamadı, klasörler yüklenemeyebilir."
                    });
                });

        }, function (errorObject) {
            res.render('dashboard/storage/productList', {
                layout: 'dashboard/layout',
                prodCatList,
                customToken: "",
                status: "<Strong>Hata!</Strong> Veritabanı okuma hatası: " + errorObject.code
            });
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.urunEkleGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("menu/productCategory");
        var prodCatVal = [];
        var brandList = [];
        // ref
        ref.orderByChild("name").once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                prodCatVal.push({
                    name: params.val().name,
                    uid: params.val().uid
                });
            });

            //token alınıyor
            admin.auth().createCustomToken(AdminUid)
                .then(function (customToken) {
                    db.ref("brands").orderByChild("brandName").once("value", function (snapshot) {
                        snapshot.forEach(function (params) {
                            brandList.push(params.val());
                        })
                        res.render('dashboard/storage/productAdd', {
                            layout: 'dashboard/layout',
                            prodCatList: prodCatVal,
                            brandList: brandList,
                            customToken,
                            status: "no"
                        });
                    });
                })
                .catch(function (error) {
                    console.log("Error creating custom token:", error);
                    res.render('dashboard/storage/productAdd', {
                        layout: 'dashboard/layout',
                        prodCatList: prodCatVal,
                        brandList: brandList,
                        customToken: "",
                        status: "Kimlik doğrulama sağlanamadı, klasörler yüklenemeyebilir."
                    });
                });
        }, function (errorObject) {
            console.log("Veri okuma hatası: " + errorObject.code);
        });
    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

//urunEklePost iptal edilecek işlemler client tarafında yapıldı
module.exports.urunEklePost = function (req, res) {
    if (req.session.userName) {

        //productCategory elemanları okunuyor
        var pcRef = db.ref("menu/productCategory");
        var prodCatList = [];
        var brandList = [];

        pcRef.orderByChild("name").once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                prodCatList.push({
                    name: params.val().name,
                    uid: params.val().uid
                });
            });
        }, function (errorObject) {
            console.log("Veri okuma hatası: " + errorObject.code);
        });

        db.ref("brands").orderByChild("brandName").once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                brandList.push(params.val());
            })
        });
        //productCategory elemanları okundu

        var trh = new Date().getTime();
        var uid = trh + req.body.folder_name;
        uid = clearSpecialChars(uid);
        var ref = db.ref("menu/productCategory");
        var parentRef = ref.child(req.body.parent_folder + "/product");
        var menuRef = parentRef.child(uid);

        var permission = true;
        if (req.body.folder_permission == "on") {
            permission = false;
        }

        menuRef.set({
            name: req.body.folder_name,
            uid: uid,
            title: req.body.folder_title,
            description: req.body.folder_description,
            permission: permission,
        }, function (error) {
            if (error) {
                console.log("Realtime DB set hatası: (menu) Ürün Klasörü eklenemedi. " + error);
                res.render('dashboard/storage/productAdd', {
                    layout: 'dashboard/layout',
                    prodCatList,
                    brandList,
                    status: "<strong>Hata!</strong> Klasör eklenemedi.<br>" + error
                });
            } else {
                //kayıt başarılı

                var ref = db.ref("folders/productCategory");
                var parentRef = ref.child(req.body.parent_folder + "/product");
                var menuRef = parentRef.child(uid);
                menuRef.set({
                    name: req.body.folder_name,
                    uid: uid,
                    title: req.body.folder_title,
                    brand: req.body.brandName,
                    description: req.body.folder_description,
                    permission: permission,
                }, function (error) {
                    if (error) {
                        console.log("Realtime DB set hatası: (folders) Ürün Klasörü eklenemedi. " + error);
                        res.render('dashboard/storage/productAdd', {
                            layout: 'dashboard/layout',
                            prodCatList,
                            brandList,
                            status: "<strong>Hata!</strong> Klasör eklenemedi.<br>" + error
                        });
                    } else {
                        //kayıt başarılı
                        res.render('dashboard/storage/productAdd', {
                            layout: 'dashboard/layout',
                            prodCatList,
                            brandList,
                            status: "ok"
                        });
                    }
                });
            }
        });
    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.urunDuzenleGet = function (req, res) {
    if (req.session.userName) {
        var productModel = require("../model/entity/Product");
        var pm = new productModel();

        var ref = db.ref("menu/productCategory");
        var prodCatVal = [];

        // ref
        ref.orderByChild("name").once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                prodCatVal.push({
                    name: params.val().name,
                    uid: params.val().uid
                });
            });
            //token alınıyor
            admin.auth().createCustomToken(AdminUid)
                .then(function (customToken) {

                    var ref = db.ref("menu/productCategory/" + req.params.pcuid + "/product/" + req.params.puid);
                    ref.once("value", function (snapshot) {
                        // snapshot.forEach(function (params) {
                        if (snapshot.val()) {
                            pm.name = snapshot.val().name;
                            pm.title = snapshot.val().title;
                            pm.description = snapshot.val().description;
                            pm.permission = snapshot.val().permission;
                            pm.uid = snapshot.val().uid;
                            pm.is_doctor = snapshot.val().is_doctor;
                            pm.doctor_url = snapshot.val().doctor_url;
                            pm.download_url = snapshot.val().download_url;
                            pm.storage_name = snapshot.val().storage_name;
                            pm.product_logo_url = snapshot.val().product_logo_url;
                        }
                        // });
                        res.render('dashboard/storage/productEdit', {
                            layout: 'dashboard/layout',
                            prodCatList: prodCatVal,
                            selectedProdCat: req.params.pcuid,
                            prod: pm,
                            customToken,
                            status: "no"
                        });
                    }, function (errorObject) {
                        res.render('dashboard/storage/productEdit', {
                            layout: 'dashboard/layout',
                            prodCatList: prodCatVal,
                            selectedProdCat: req.params.pcuid,
                            prod: pm,
                            customToken,
                            status: "<Strong>Hata!</Strong> Veritabanı okuma hatası: " + errorObject.code
                        });
                    });
                })
                .catch(function (error) {
                    console.log("Error creating custom token:", error);
                    res.render('dashboard/storage/productEdit', {
                        layout: 'dashboard/layout',
                        prodCatList: prodCatVal,
                        selectedProdCat: req.params.pcuid,
                        prod: pm,
                        customToken,
                        status: "<Strong>Hata!</Strong> Kimlik doğrulama hatası: " + errorObject.code
                    });
                });

        }, function (errorObject) {
            console.log("Veri okuma hatası: " + errorObject.code);

            ///////////////////////////////
            //TODO: hata mesajı (status) gönderilecek, authToken urunDuzenlePost daki gibi alınabilir
            //////////////////////////////

        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.urunDuzenlePost = function (req, res) {
    if (req.session.userName) {

        var productModel = require("../model/entity/Product");
        var pm = new productModel();

        var prodCatVal = [];
        var authToken = "";

        var menuRef = db.ref("menu/productCategory/" + req.body.product_category_uid + "/product/" + req.body.product_uid);
        var foldersRef = db.ref("folders/productCategory/" + req.body.product_category_uid + "/product/" + req.body.product_uid);

        var permission = true;
        if (req.body.folder_permission == "on") {
            permission = false;
        }
        var is_doctor = false;
        if (req.body.is_doctor == "on") {
            is_doctor = true;
        }

        pm.name = req.body.folder_name;
        pm.title = req.body.folder_title;
        pm.description = req.body.folder_description;
        pm.permission = permission;
        pm.uid = req.body.product_uid;
        pm.is_doctor = is_doctor;
        pm.doctor_url = req.body.doctor_url;
        pm.download_url = req.body.download_url;
        pm.storage_name = req.body.storage_name;
        pm.product_logo_url = req.body.product_logo_url;


        //token alınıyor
        admin.auth().createCustomToken(AdminUid)
            .then(function (customToken) {
                authToken = customToken;
            })
            .catch(function (error) {
                console.log("Error creating custom token:", error);
                res.render('dashboard/storage/productEdit', {
                    layout: 'dashboard/layout',
                    prodCatList: prodCatVal,
                    selectedProdCat: req.body.product_category_uid,
                    prod: pm,
                    customToken: authToken,
                    status: "<Strong>Hata!</Strong> Kimlik doğrulama hatası: " + error.code
                });
            });

        menuRef.update(pm, function (error) {
            if (error) {
                console.log("Realtime DB update hatası: (menu) ürün eklenemedi. " + error);
                res.render('dashboard/storage/productEdit', {
                    layout: 'dashboard/layout',
                    prodCatList: prodCatVal,
                    selectedProdCat: req.body.product_category_uid,
                    prod: pm,
                    customToken: authToken,
                    status: "<Strong>Hata!</Strong> Güncelleme hatası (menu): " + error.code
                });
            } else {
                //kayıt başarılı

                //ürün kategorileri alınıyor
                var ref = db.ref("menu/productCategory");
                ref.orderByChild("name").once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        prodCatVal.push({
                            name: params.val().name,
                            uid: params.val().uid
                        });


                        foldersRef.update(pm, function (error) {
                            if (error) {
                                console.log("Realtime DB update hatası: (folders) ürün eklenemedi. " + error);
                                //menuRef rollback
                                res.render('dashboard/storage/productEdit', {
                                    layout: 'dashboard/layout',
                                    prodCatList: prodCatVal,
                                    selectedProdCat: req.body.product_category_uid,
                                    prod: pm,
                                    customToken: authToken,
                                    status: "<Strong>Hata!</Strong> Güncelleme hatası (folders): " + error.code
                                });
                            } else {
                                //kayıt başarılı

                                res.render('dashboard/storage/productEdit', {
                                    layout: 'dashboard/layout',
                                    prodCatList: prodCatVal,
                                    selectedProdCat: req.body.product_category_uid,
                                    prod: pm,
                                    customToken: authToken,
                                    status: "ok"
                                });
                            }
                        });
                    });
                }, function (errorObject) {
                    console.log("Veri okuma hatası: " + errorObject.code);
                    // res.render('dashboard/storage/productEdit', {
                    //     layout: 'dashboard/layout',
                    //     prodCatList: prodCatVal,
                    //     selectedProdCat: req.body.product_category_uid,
                    //     prod: pm,
                    //     customToken: authToken,
                    //     status: "<Strong>Güncelleme başarılı.</Strong><br><br><Strong>Hata!</Strong> Ürün Kategori bilgisi alınamadı."
                    // });
                });
            }
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

//file category
module.exports.dosyaTipiListeleGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("menu/productCategory");
        var prodCatList = [];

        ref.orderByChild("name").once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                prodCatList.push({
                    name: params.val().name,
                    uid: params.val().uid
                });
            })

            //token alınıyor
            admin.auth().createCustomToken(AdminUid)
                .then(function (customToken) {
                    res.render('dashboard/storage/fileCategoryList', {
                        layout: 'dashboard/layout',
                        prodCatList,
                        customToken,
                        selectedProdCat: "",
                        selectedProduct: "",
                        status: "no"
                    });
                })
                .catch(function (error) {
                    console.log("Error creating custom token:", error);
                    res.render('dashboard/storage/fileCategoryList', {
                        layout: 'dashboard/layout',
                        prodCatList,
                        customToken: "",
                        selectedProdCat: "",
                        selectedProduct: "",
                        status: "Kimlik doğrulama sağlanamadı, klasörler yüklenemeyebilir."
                    });
                });

        }, function (errorObject) {
            res.render('dashboard/storage/fileCategoryList', {
                layout: 'dashboard/layout',
                prodCatList,
                customToken: "",
                selectedProdCat: "",
                selectedProduct: "",
                status: "<Strong>Hata!</Strong> Veritabanı okuma hatası: " + errorObject.code
            });
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.dosyaKategorisiEkleGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("menu/productCategory");
        var prodCatList = [];

        // productCategori lisetesi okunuyor
        ref.orderByChild("name").once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                prodCatList.push({
                    name: params.val().name,
                    uid: params.val().uid
                });
            });
            //token alınıyor
            admin.auth().createCustomToken(AdminUid)
                .then(function (customToken) {
                    res.render('dashboard/storage/fileCategoryAdd', {
                        layout: 'dashboard/layout',
                        prodCatList,
                        customToken,
                        status: "no"
                    });
                })
                .catch(function (error) {
                    console.log("Error creating custom token:", error);
                    res.render('dashboard/storage/fileCategoryAdd', {
                        layout: 'dashboard/layout',
                        customToken: "",
                        status: "Kimlik doğrulama sağlanamadı, klasörler yüklenemeyebilir."
                    });
                });

        }, function (errorObject) {
            console.log("Veri okuma hatası: " + errorObject.code);
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.dosyaKategorisiEklePost = function (req, res) {
    if (req.session.userName) {

        //fileCategory nesneleri
        var trh = new Date().getTime();
        var uid = trh + req.body.folder_name;
        uid = clearSpecialChars(uid);
        var ref = db.ref("folders/productCategory");
        var prodCatRef = ref.child(req.body.product_category);
        var pRef = prodCatRef.child("product/" + req.body.product + "/fileCategory");
        var menuRef = pRef.child(uid);

        //productCategory nesneleri
        var prcListref = db.ref("menu/productCategory");
        var prodCatList = [];

        var permission = true;
        if (req.body.folder_permission == "on") {
            permission = false;
        }

        //fileCategory DB'ye kayıt ediliyor
        menuRef.set({
            name: req.body.folder_name,
            uid: uid,
            title: req.body.folder_title,
            description: req.body.folder_description,
            permission: permission,
        }, function (error) {
            if (error) {
                console.log("Realtime DB set hatası: (fileCategory) Klasör eklenemedi. " + error);
                res.render('dashboard/storage/fileCategoryAdd', {
                    layout: 'dashboard/layout',
                    prodCatList,
                    customToken: "",
                    status: "<strong>Hata!</strong> Klasör eklenemedi.<br>" + error
                });
            } else {
                //kayıt başarılı

                // productCategori lisetesi okunuyor

                prcListref.orderByChild("name").once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        prodCatList.push({
                            name: params.val().name,
                            uid: params.val().uid
                        });
                    });

                    //token alınıyor
                    admin.auth().createCustomToken(AdminUid)
                        .then(function (customToken) {
                            res.render('dashboard/storage/fileCategoryAdd', {
                                layout: 'dashboard/layout',
                                prodCatList,
                                customToken,
                                status: "ok"
                            });
                        })
                        .catch(function (error) {
                            console.log("Error creating custom token:", error);
                            res.render('dashboard/storage/fileCategoryAdd', {
                                layout: 'dashboard/layout',
                                prodCatList,
                                customToken: "",
                                status: "Kimlik doğrulama sağlanamadı, klasörler yüklenemeyebilir."
                            });
                        });

                }, function (errorObject) {
                    console.log("Veri okuma hatası: " + errorObject.code);
                    res.render('dashboard/storage/fileCategoryAdd', {
                        layout: 'dashboard/layout',
                        prodCatList,
                        customToken: "",
                        status: "Veri okuma hatası: " + errorObject.code
                    });
                });

            }
        });


    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.dosyaTipiDuzenleGet = function (req, res) {
    if (req.session.userName) {

        var selectedRef = db.ref("folders/productCategory/" + req.params.prodCatUid + "/product/" + req.params.prodUid + "/fileCategory/" + req.params.fileCatUid);
        var prodCatRef = db.ref("menu/productCategory");
        var prodCatList = [];

        // productCategori lisetesi okunuyor
        prodCatRef.orderByChild("name").once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                prodCatList.push({
                    name: params.val().name,
                    uid: params.val().uid
                });
            });
            //token alınıyor
            admin.auth().createCustomToken(AdminUid)
                .then(function (customToken) {

                    selectedRef.once("value", function (snapshot) {

                        res.render('dashboard/storage/fileCategoryEdit', {
                            layout: 'dashboard/layout',
                            prodCatList,
                            customToken,
                            selectedProdCat: req.params.prodCatUid,
                            selectedProduct: req.params.prodUid,
                            fileCat: snapshot.val(),
                            status: "no"
                        });

                    }, function (errorObject) {
                        console.log("Veri okuma hatası: " + errorObject.code);
                        res.render('dashboard/storage/fileCategoryEdit', {
                            layout: 'dashboard/layout',
                            prodCatList,
                            customToken: "",
                            selectedProdCat: req.params.prodCatUid,
                            selectedProduct: req.params.prodUid,
                            fileCat: {},
                            status: "Dosya Tipi bilgileri alınamadı!<br>Kimlik doğrulama sağlanamadı, klasörler yüklenemeyebilir."
                        });
                    });

                })
                .catch(function (error) {
                    console.log("Error creating custom token:", error);
                    res.render('dashboard/storage/fileCategoryEdit', {
                        layout: 'dashboard/layout',
                        prodCatList,
                        customToken: "",
                        selectedProdCat: req.params.prodCatUid,
                        selectedProduct: req.params.prodUid,
                        fileCat: {},
                        status: "Kimlik doğrulama sağlanamadı, klasörler yüklenemeyebilir."
                    });
                });

        }, function (errorObject) {
            console.log("Veri okuma hatası: " + errorObject.code);
            res.render('dashboard/storage/fileCategoryEdit', {
                layout: 'dashboard/layout',
                prodCatList,
                customToken: "",
                selectedProdCat: req.params.prodCatUid,
                selectedProduct: req.params.prodUid,
                fileCat: {},
                status: "Veritabanı okuma hatası, ürün kategorisi listesi alınamadı."
            });
        });




    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.dosyaTipiDuzenlePost = function (req, res) {
    if (req.session.userName) {

        //productCategory nesneleri
        var prcListref = db.ref("menu/productCategory");
        var prodCatList = [];

        var permission = true;
        if (req.body.folder_permission == "on") {
            permission = false;
        }

        //fileCategory nesneleri
        var ref = db.ref("folders/productCategory/" + req.body.product_category + "/product/" + req.body.product + "/fileCategory/" + req.body.file_category_uid);
        fileCategory = {
            name: req.body.folder_name,
            title: req.body.folder_title,
            description: req.body.folder_description,
            permission: permission,
            uid: req.body.file_category_uid
        }

        //fileCategory DB'ye kayıt ediliyor
        ref.update({
            name: req.body.folder_name,
            title: req.body.folder_title,
            description: req.body.folder_description,
            permission: permission,
        }, function (error) {
            if (error) {
                console.log("Realtime DB set hatası: (fileCategory) Klasör eklenemedi. " + error);
                res.render('dashboard/storage/fileCategoryEdit', {
                    layout: 'dashboard/layout',
                    prodCatList,
                    customToken: "",
                    selectedProdCat: req.body.product_category,
                    selectedProduct: req.body.product,
                    fileCat: fileCategory,
                    status: "<strong>Hata!</strong> Klasör güncellenemedi.<br>" + error
                });
            } else {
                //kayıt başarılı

                prcListref.orderByChild("name").once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        prodCatList.push({
                            name: params.val().name,
                            uid: params.val().uid
                        });
                    });

                    //token alınıyor
                    admin.auth().createCustomToken(AdminUid)
                        .then(function (customToken) {
                            res.render('dashboard/storage/fileCategoryEdit', {
                                layout: 'dashboard/layout',
                                prodCatList,
                                customToken: customToken,
                                selectedProdCat: req.body.product_category,
                                selectedProduct: req.body.product,
                                fileCat: fileCategory,
                                status: "ok"
                            });
                        })
                        .catch(function (error) {
                            console.log("Error creating custom token:", error);
                            res.render('dashboard/storage/fileCategoryEdit', {
                                layout: 'dashboard/layout',
                                prodCatList,
                                customToken: "",
                                selectedProdCat: req.body.product_category,
                                selectedProduct: req.body.product,
                                fileCat: fileCategory,
                                status: "<strong>Dosya Tipi Klasörü Güncellendi.</strong><br><br><strong>Hata!</strong> Token alınamadı.<br>" + error
                            });
                        });

                }, function (errorObject) {
                    console.log("Veri okuma hatası: " + errorObject.code);
                    res.render('dashboard/storage/fileCategoryEdit', {
                        layout: 'dashboard/layout',
                        prodCatList,
                        customToken: "",
                        selectedProdCat: req.body.product_category,
                        selectedProduct: req.body.product,
                        fileCat: fileCategory,
                        status: "<strong>Hata!</strong> Ürün kategorisi verileri alınamadı.<br>" + error
                    });
                });

            }
        });


    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.dosyaTipiSilGet = function (req, res) {
    if (req.session.userName) {

        var fileCatRef = db.ref("folders/productCategory/" + req.params.prodCatUid + "/product/" + req.params.prodUid + "/fileCategory/" + req.params.fileCatUid);
        var prodCatList = [];

        fileCatRef.child("file").once("value", function (snapshot) {
            if (snapshot.val() == null) { //seçilen dosya tipinin altında dosya yoksa

                fileCatRef.remove(function (error) {
                    if (error) {
                        console.log("Realtime DB remove hatası: Dosya Tipi silinemedi. " + error);
                        res.render('dashboard/storage/fileCategoryList', {
                            layout: 'dashboard/layout',
                            prodCatList,
                            customToken: "",
                            selectedProdCat: req.params.prodCatUid,
                            selectedProduct: req.params.prodUid,
                            status: "<strong>Hata!</strong> Klasör silinemedi.<br>" + error
                        });
                    } else {
                        //Silme başarılı
                        db.ref("menu/productCategory").orderByChild("name").once("value", function (snapshot) {
                            snapshot.forEach(function (params) {
                                prodCatList.push({
                                    name: params.val().name,
                                    uid: params.val().uid
                                });
                            })

                            //token alınıyor
                            admin.auth().createCustomToken(AdminUid)
                                .then(function (customToken) {
                                    res.render('dashboard/storage/fileCategoryList', {
                                        layout: 'dashboard/layout',
                                        prodCatList,
                                        customToken: customToken,
                                        selectedProdCat: req.params.prodCatUid,
                                        selectedProduct: req.params.prodUid,
                                        status: "ok"
                                    });
                                })
                                .catch(function (error) {
                                    console.log("Error creating custom token:", error);
                                    res.render('dashboard/storage/fileCategoryList', {
                                        layout: 'dashboard/layout',
                                        prodCatList,
                                        customToken: "",
                                        selectedProdCat: req.params.prodCatUid,
                                        selectedProduct: req.params.prodUid,
                                        status: "<strong>Dosya tipi klasörü silindi.</strong><br><br><strong>Hata!</strong> Token alınamadı.<br>" + error
                                    });
                                });

                        }, function (errorObject) {
                            res.render('dashboard/storage/fileCategoryList', {
                                layout: 'dashboard/layout',
                                prodCatList,
                                customToken: "",
                                selectedProdCat: req.params.prodCatUid,
                                selectedProduct: req.params.prodUid,
                                status: "<strong>Dosya tipi klasörü silindi.</strong><br><br><strong>Hata!</strong> Ürün Kategorisi bilgileri alınamadı.<br>" + error
                            });
                        });
                    }
                });

            } else { // seçilen dosya tipinin altında dosya(lar) varsa
                // db dosyaların listesi
                // foreach dosya
                //storage sil
                //hepsi tamamsa bu else in if ini kopyala
            }

        }, function (errorObject) {
            console.log("Dosya tipinin altındaki dosyalar çekilirken hata oluştu.");
            res.render('dashboard/storage/fileCategoryList', {
                layout: 'dashboard/layout',
                prodCatList,
                customToken: "",
                selectedProdCat: req.params.prodCatUid,
                selectedProduct: req.params.prodUid,
                status: "<strong>Dosya tipi klasöründeki dosya bilgileri alınamadığı için silme işlemi gerçekleşmedi.<br>" + error
            });
        });
    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

//file
module.exports.dosyaListesiGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("menu/productCategory");
        var prodCatList = [];

        ref.orderByChild("name").once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                prodCatList.push({
                    name: params.val().name,
                    uid: params.val().uid
                });
            })

            //token alınıyor
            admin.auth().createCustomToken(AdminUid)
                .then(function (customToken) {
                    res.render('dashboard/storage/fileList', {
                        layout: 'dashboard/layout',
                        prodCatList,
                        customToken,
                        status: "ok"
                    });
                })
                .catch(function (error) {
                    console.log("Error creating custom token:", error);
                    res.render('dashboard/storage/fileList', {
                        layout: 'dashboard/layout',
                        prodCatList,
                        customToken: "",
                        status: "Kimlik doğrulama sağlanamadı, klasörler yüklenemeyebilir."
                    });
                });

        }, function (errorObject) {
            res.render('dashboard/storage/fileList', {
                layout: 'dashboard/layout',
                prodCatList,
                customToken: "",
                status: "<Strong>Hata!</Strong> Veritabanı okuma hatası: " + errorObject.code
            });
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.dosyaEkleGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("menu/productCategory");
        var prodCatList = [];

        ref.orderByChild("name").once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                prodCatList.push({
                    name: params.val().name,
                    uid: params.val().uid
                });
            })

            //token alınıyor
            admin.auth().createCustomToken(AdminUid)
                .then(function (customToken) {
                    res.render('dashboard/storage/fileAdd', {
                        layout: 'dashboard/layout',
                        prodCatList,
                        customToken,
                        status: "no"
                    });
                })
                .catch(function (error) {
                    console.log("Error creating custom token:", error);
                    res.render('dashboard/storage/fileAdd', {
                        layout: 'dashboard/layout',
                        prodCatList,
                        customToken: "",
                        status: "Kimlik doğrulama sağlanamadı, klasörler yüklenemeyebilir."
                    });
                });

        }, function (errorObject) {
            res.render('dashboard/storage/fileAdd', {
                layout: 'dashboard/layout',
                prodCatList,
                customToken: "",
                status: "<Strong>Hata!</Strong> Veritabanı okuma hatası: " + errorObject.code
            });
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.dosyaDuzenleGet = function (req, res) {
    if (req.session.userName) {

        var selectedRef = db.ref("folders/productCategory/" + req.params.prodCatUid + "/product/" + req.params.prodUid +
            "/fileCategory/" + req.params.fileCatUid + "/file/" + req.params.fileUid);
        var prodCatRef = db.ref("menu/productCategory");
        var prodCatList = [];

        // productCategori lisetesi okunuyor
        prodCatRef.orderByChild("name").once("value", function (snapshot) {
            snapshot.forEach(function (params) {
                prodCatList.push({
                    name: params.val().name,
                    uid: params.val().uid
                });
            });
            //token alınıyor
            admin.auth().createCustomToken(AdminUid)
                .then(function (customToken) {

                    selectedRef.once("value", function (snapshot) {

                        res.render('dashboard/storage/fileEdit', {
                            layout: 'dashboard/layout',
                            prodCatList,
                            customToken,
                            selectedProdCat: req.params.prodCatUid,
                            selectedProduct: req.params.prodUid,
                            selectedFileCat: req.params.fileCatUid,
                            file: snapshot.val(),
                            status: "no"
                        });

                    }, function (errorObject) {
                        console.log("Veri okuma hatası: " + errorObject.code);
                        res.render('dashboard/storage/fileEdit', {
                            layout: 'dashboard/layout',
                            prodCatList,
                            customToken: "",
                            selectedProdCat: req.params.prodCatUid,
                            selectedProduct: req.params.prodUid,
                            selectedFileCat: req.params.fileCatUid,
                            file: {},
                            status: "Dosya Tipi bilgileri alınamadı!<br>Kimlik doğrulama sağlanamadı, klasörler yüklenemeyebilir."
                        });
                    });

                })
                .catch(function (error) {
                    console.log("Error creating custom token:", error);
                    res.render('dashboard/storage/fileEdit', {
                        layout: 'dashboard/layout',
                        prodCatList,
                        customToken: "",
                        selectedProdCat: req.params.prodCatUid,
                        selectedProduct: req.params.prodUid,
                        selectedFileCat: req.params.fileCatUid,
                        file: {},
                        status: "Kimlik doğrulama sağlanamadı, klasörler yüklenemeyebilir."
                    });
                });

        }, function (errorObject) {
            console.log("Veri okuma hatası: " + errorObject.code);
            res.render('dashboard/storage/fileEdit', {
                layout: 'dashboard/layout',
                prodCatList,
                customToken: "",
                selectedProdCat: req.params.prodCatUid,
                selectedProduct: req.params.prodUid,
                selectedFileCat: req.params.fileCatUid,
                file: {},
                status: "Veritabanı okuma hatası, ürün kategorisi listesi alınamadı."
            });
        });




    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.dosyaDuzenlePost = function (req, res) {
    if (req.session.userName) {

        //productCategory nesneleri
        var prdCatListRef = db.ref("menu/productCategory");
        var prodCatList = [];

        var permission = true;
        if (req.body.file_permission == "on") {
            permission = false;
        }

        //file nesneleri
        var fileRef = db.ref("folders/productCategory/" + req.body.product_category + "/product/" + req.body.product +
            "/fileCategory/" + req.body.file_category + "/file/" + req.body.file_uid);
        file = {
            name: req.body.file_name,
            title: req.body.file_title,
            description: req.body.file_description,
            permission: permission,
            uid: req.body.file_uid
        }

        //fileCategory DB'ye kayıt ediliyor
        fileRef.update({
            name: req.body.file_name,
            title: req.body.file_title,
            description: req.body.file_description,
            permission: permission,
        }, function (error) {
            if (error) {
                console.log("Realtime DB set hatası: (file) güncellenemedi. " + error);
                res.render('dashboard/storage/fileEdit', {
                    layout: 'dashboard/layout',
                    prodCatList,
                    customToken: "",
                    selectedProdCat: req.body.product_category,
                    selectedProduct: req.body.product,
                    selectedFileCat: req.body.file_category,
                    file: file,
                    status: "<strong>Hata!</strong> Dosya güncellenemedi.<br>" + error
                });
            } else {
                //kayıt başarılı

                prdCatListRef.orderByChild("name").once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        prodCatList.push({
                            name: params.val().name,
                            uid: params.val().uid
                        });
                    });

                    //token alınıyor
                    admin.auth().createCustomToken(AdminUid)
                        .then(function (customToken) {
                            res.render('dashboard/storage/fileEdit', {
                                layout: 'dashboard/layout',
                                prodCatList,
                                customToken: customToken,
                                selectedProdCat: req.body.product_category,
                                selectedProduct: req.body.product,
                                selectedFileCat: req.body.file_category,
                                file: file,
                                status: "ok"
                            });
                        })
                        .catch(function (error) {
                            console.log("Error creating custom token:", error);
                            res.render('dashboard/storage/fileEdit', {
                                layout: 'dashboard/layout',
                                prodCatList,
                                customToken: "",
                                selectedProdCat: req.body.product_category,
                                selectedProduct: req.body.product,
                                selectedFileCat: req.body.file_category,
                                file: file,
                                status: "<strong>Dosya Güncellendi.</strong><br><br><strong>Hata!</strong> Token alınamadı.<br>" + error
                            });
                        });

                }, function (errorObject) {
                    console.log("Veri okuma hatası: " + errorObject.code);
                    res.render('dashboard/storage/fileEdit', {
                        layout: 'dashboard/layout',
                        prodCatList,
                        customToken: "",
                        selectedProdCat: req.body.product_category,
                        selectedProduct: req.body.product,
                        selectedFileCat: req.body.file_category,
                        file: file,
                        status: "<strong>Hata!</strong> Dosya verileri alınamadı.<br>" + error
                    });
                });

            }
        });


    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.dosyaSilGet = function (req, res) {
    if (req.session.userName) {

        var fileRef = db.ref("folders/productCategory/" + req.params.prodCatUid + "/product/" + req.params.prodUid +
            "/fileCategory/" + req.params.fileCatUid + "/file/" + req.params.fileUid);
        var prodCatList = [];

        fileRef.remove(function (error) {
            if (error) {
                console.log("Realtime DB remove hatası: Dosya silinemedi. " + error);
                res.render('dashboard/storage/fileList', {
                    layout: 'dashboard/layout',
                    prodCatList,
                    customToken: "",
                    // selectedProdCat: req.params.prodCatUid,
                    // selectedProduct: req.params.prodUid,
                    // selectedFileCat: req.params.fileCatUid,
                    status: "<strong>Hata!</strong> Klasör silinemedi.<br>" + error
                });
            } else {
                //Silme başarılı
                db.ref("menu/productCategory").orderByChild("name").once("value", function (snapshot) {
                    snapshot.forEach(function (params) {
                        prodCatList.push({
                            name: params.val().name,
                            uid: params.val().uid
                        });
                    })

                    //token alınıyor
                    admin.auth().createCustomToken(AdminUid)
                        .then(function (customToken) {
                            res.render('dashboard/storage/fileList', {
                                layout: 'dashboard/layout',
                                prodCatList,
                                customToken: customToken,
                                // selectedProdCat: req.params.prodCatUid,
                                // selectedProduct: req.params.prodUid,
                                status: "ok"
                            });
                        })
                        .catch(function (error) {
                            console.log("Error creating custom token:", error);
                            res.render('dashboard/storage/fileList', {
                                layout: 'dashboard/layout',
                                prodCatList,
                                customToken: "",
                                // selectedProdCat: req.params.prodCatUid,
                                // selectedProduct: req.params.prodUid,
                                status: "<strong>Dosya silindi.</strong><br><br><strong>Hata!</strong> Token alınamadı.<br>" + error
                            });
                        });

                }, function (errorObject) {
                    res.render('dashboard/storage/fileList', {
                        layout: 'dashboard/layout',
                        prodCatList,
                        customToken: "",
                        // selectedProdCat: req.params.prodCatUid,
                        // selectedProduct: req.params.prodUid,
                        status: "<strong>Dosya silindi.</strong><br><br><strong>Hata!</strong> Ürün Kategorisi bilgileri alınamadı.<br>" + error
                    });
                });
            }
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

//Ayarlar
module.exports.sifreAyarlariGet = function (req, res) {
    if (req.session.userName) {

        var ref = db.ref("auth");

        ref.once("value", function (snapshot) {

            res.render('dashboard/authSettings', {
                layout: 'dashboard/layout',
                user: snapshot.val().user,
                status: "no"
            });
        }, function (errorObject) {
            res.render('dashboard/authSettings', {
                layout: 'dashboard/layout',
                user: "",
                status: "<Strong>Hata!</Strong> Yönetici bilgileri veitabanından alınamadı: " + errorObject.code
            });
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

module.exports.sifreAyarlariPost = function (req, res) {
    if (req.session.userName) {

        var authRef = db.ref("auth");

        var user = req.body.loginUsername;
        var pass = req.body.loginPassword;

        authRef.update({
            user: user,
            pass: pass
        }, function (error) {
            if (error) {
                res.render('dashboard/authSettings', {
                    layout: 'dashboard/layout',
                    user,
                    status: "<Strong>Hata!</Strong> Yönetici bilgileri güncellenemedi: " + errorObject.code
                });
            } else {
                res.render('dashboard/authSettings', {
                    layout: 'dashboard/layout',
                    user,
                    status: "ok"
                });
            }
        });

    } else {
        res.render('login', { layout: 'login', status: 'Oturum açmalısınız!' });
    }
}

// dosyaEklePost işlemleri fileAdd.ejs dosyasında yapılmaktadır. (client side)

module.exports.testGet = function (req, res) {
    // if(req.session.userName){
    //     // Imports the Google Cloud client library.
    //     // const Storage = require('@google-cloud/storage');

    //     // Instantiates a client. If you don't specify credentials when constructing
    //     // the client, the client library will look for credentials in the
    //     // environment.
    //     // const storage = Storage();

    //     // Makes an authenticated API request.
    //     //storage
    //     gcs
    //     .getBuckets()
    //     .then((results) => {
    //         const buckets = results[0];

    //         console.log('Buckets:');
    //         buckets.forEach((bucket) => {
    //         console.log(bucket.name);
    //         console.log("*****************************");
    //         // console.log(bucket);
    //         });
    //     })
    //     .catch((err) => {
    //         console.error('ERROR:', err);
    //     });

    //     //////////////////////////////////////////////
    //     // // Your Google Cloud Platform project ID
    //     // const projectId = 'mezoklinik-app';

    //     // // Creates a client
    //     // const storage = new storage({
    //     // projectId: projectId,
    //     // });

    //     // // The name for the new bucket
    //     // const bucketName = 'my-new-bucket';

    //     // // Creates the new bucket
    //     // // 
    //     // gcs
    //     // .createBucket(bucketName)
    //     // .then(() => {
    //     //     console.log(`Bucket ${bucketName} created.`);
    //     // })
    //     // .catch(err => {
    //     //     console.error('ERROR:', err);
    //     // });
    //     //////////////////////////////////////////////


    //     res.render('dashboard/storage/test', {
    //         layout: 'dashboard/layout',
    //         status: "no"
    //     });
    // } else {
    //     res.render('login', {layout: 'login', status: 'Oturum açmalısınız!'});
    // }
}


/**
 * Mail Gönderme Fonksiyonu
 * @returns Boolean
 * @param html_text E-Posta içeriği (HTML etiketlerini destekler)
 * @param subject E-Posta konusu
 * @param to E-Posta alıcı (Birden fazla kişiye göndermek için adresleri virgülle ayırın)
 */
function sendMail(html_text, subject, to) {

    /**
     * Gmail Ayarları
     */
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com', // x
        port: 587,
        secure: false, // true for 465, false for other ports(587)
        auth: {
            user: 'mezoklinik',
            pass: '$mezo5909'
        }
    });

    /**
     * Test Settings
     */
    // const transporter = nodemailer.createTransport({
    //     host: 'smtp.ethereal.email',
    //     port: 587,
    //     auth: {
    //         user: 'f3mwyetjs33doqsb@ethereal.email',
    //         pass: '4BeGvbnw3fyt6nKCsF'
    //     }
    // });

    // var mailOptions = {
    //     from: 'f3mwyetjs33doqsb@ethereal.email',
    //     to: 'gm.mrtt@gmail.com',
    //     subject: 'Sending Email using Node.js',
    //     text: 'That was easy!',
    //     html: '<b>HTML</b><i>Test</i>success (öçşiğü)'
    // };

    var mailOptions = {
        from: 'mezoklinik@gmail.com',
        to: to,
        subject: subject,
        // text: text,
        html: html_text,
        // html: '<b>HTML</b> <i>Test</i> başarılı (öçşiğü)'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            return false;
            // res.render('dashboard/MailTest', {
            //     layout: 'dashboard/layout',
            //     status: "<Strong>Hata! </Strong><br>" + error
            // });
        } else {
            console.log('Email sent: ' + info.response);
            return true;
            // res.render('dashboard/MailTest', {
            //     layout: 'dashboard/layout',
            //     status: "ok"
            // });
        }
    });

}

/**
 * Firebase için özel karakter temizleme
 * @returns String
 * @param text String
 */
function clearSpecialChars(text) {
    return text.replace(/\./gi, "").replace(/\#/gi, "").replace(/\$/gi, "").replace(/\[/gi, "").replace(/\]/gi, "").replace(/\ /gi, "")
        .replace(/\\/gi, "").replace(/\//gi, "").replace(/\"/gi, "").replace(/\'/gi, "").replace(/\?/gi, "").replace(/\&/gi, "").replace(/\%/gi, "");
}

/**
 * Long tipinde kayıtlı tarihi Date tipindeki input'un kabul ettiği formata çevirir
 * @returns String
 * @param longDate Long
 */
function longDateToDateInput(longDate) {
    var newDate = new Date(longDate);
    var year = newDate.getFullYear();
    var month = newDate.getMonth();
    month += 1; //0'dan başladığı için
    if (month < 10) {
        month = "0" + month;
    }
    var day = newDate.getDate();
    if (day < 10) {
        day = "0" + day;
    }
    var formattedDate = year + "-" + month + "-" + day;
    return formattedDate;
}
