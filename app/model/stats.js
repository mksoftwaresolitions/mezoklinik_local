
var admin = require("firebase-admin");

//mail
var nodemailer = require('nodemailer');

var statsref = admin.database().ref("stats");

//faydalı link istatistikleri
var helpfullinkcount = 0;

admin.database().ref('helpfulLinks').on("child_added", function (event) {
    helpfullinkcount += 1;
  statsref.once("value", function(snapshot) {
    if (helpfullinkcount > snapshot.val().helpfulLinks ) {
      statsref.update({
          helpfulLinks: helpfullinkcount 
      }, function(error) {
          if (error) {
              console.error("istatistik (helpfulLinks)(child_added) güncellenemedi. " + error);
          } else {
              //güncelleme başarılı
          }
      });
    }
  }, function (errorobject) {
    console.error("(helpfulLinks) istatistikler veritabanından okunamadı: " + errorobject);
  });

}, function (errorobject) {
  console.error("helpfulLinks.on(child_added) hatası: " + errorobject);
});

admin.database().ref('helpfulLinks').on("child_removed", function(event) {
    helpfullinkcount -= 1;

  statsref.once("value", function(snapshot) {
    if (helpfullinkcount < snapshot.val().helpfulLinks ) {
      statsref.update({
          helpfulLinks: helpfullinkcount
      }, function(error) {
        if (error) {
            console.error("istatistik (helpfulLinks)(child_removed) güncellenemedi. " + error);
          } else {
            //güncelleme başarılı
          }
      });
    }
  }, function (errorobject) {
    console.error("(helpfulLinks) istatistikler veritabanından okunamadı: " + errorobject);
  });

}, function (errorobject) {
  console.error("helpfulLinks.on(child_removed) hatası: " + errorobject);
});

//kullanıcı istatistikleri
var usercount = 0;
var doctorcount = 0;
admin.database().ref('users').on("child_added", function(event) {
  usercount += 1;
  if (event.val().user_role == 1){
    doctorcount += 1;
  }
  // mobilden kayıt yapan onaylanmamış kullanıcıya mail gönderiyoruz
  if (event.val().active == false){
    admin.database().ref("mailtemplate").child("newuser").once("value", function(mailparams) {
      // kullanıcı adı mail şablona yerleştiriliyor
      var htxt = mailparams.val().html_text.replace(/\%uyeadi\%/gi, event.val().name_surname);
      var sbj = mailparams.val().subject.replace(/\%uyeadi\%/gi, event.val().name_surname);
      //mail gönderiliyor
      sendmail(htxt, sbj, event.val().email);
    });
  }
  statsref.once("value", function(snapshot) {
    if (usercount > snapshot.val().users ) {

      //toplam kullanıcı sayısı (doktor dahil) güncelleniyor
      statsref.update({
        users: usercount
      }, function(error) {
          if (error) {
              console.error("istatistik (users)(child_added) fonksiyonu içinde users güncellenemedi. " + error);
          } else {
              //güncelleme başarılı
          }
      });
    }

    if (doctorcount > snapshot.val().doctors ) {
      //doktor sayısı güncelleniyor
        statsref.update({
          doctors: doctorcount
        }, function(error) {
          if (error) {
              console.error("istatistik (users)(child_added) fonksiyonu içinde doctors güncellenemedi. " + error);
          } else {
              //güncelleme başarılı
          }
        });
    }

  }, function (errorobject) {
    console.error("(users) istatistikler veritabanından okunamadı: " + errorobject);
  });

}, function (errorobject) {
  console.error("users.on(child_added) hatası: " + errorobject);
});

admin.database().ref('users').on("child_removed", function(event) {
  usercount -= 1;
  if (event.val().user_role == 1){
    doctorcount -= 1;
  }
  statsref.once("value", function(snapshot) {
    if (usercount < snapshot.val().users ) {
      statsref.update({
        users: usercount
      }, function(error) {
        if (error) {
            console.error("istatistik (users)(child_removed) güncellenemedi. " + error);
          } else {
            //güncelleme başarılı
          }
      });

    if (usercount < snapshot.val().doctors ) {
      //doktor sayısı güncelleniyor
      statsref.update({
        doctors: doctorcount
      }, function(error) {
        if (error) {
            console.error("istatistik (users)(child_removed) fonksiyonu içinde doctors güncellenemedi. " + error);
        } else {
            //güncelleme başarılı
        }
      });
    }

    }
  }, function (errorobject) {
    console.error("(users) istatistikler veritabanından okunamadı: " + errorobject);
  });

}, function (errorobject) {
  console.error("users.on(child_removed) hatası: " + errorobject);
});

//kampanya istatistikleri
var campaigncount = 0;
admin.database().ref('campaigns').on("child_added", function(event) {
  campaigncount += 1;
  statsref.once("value", function(snapshot) {
    if (campaigncount > snapshot.val().campaigns ) {
      statsref.update({
        campaigns: campaigncount
      }, function(error) {
          if (error) {
              console.error("istatistik (campaigns)(child_added) güncellenemedi. " + error);
          } else {
             // güncelleme başarılı
          }
      });
    }
  }, function (errorobject) {
    console.error("(campaigns) istatistikler veritabanından okunamadı: " + errorobject);
  });

}, function (errorobject) {
  console.error("campaigns.on(child_added) hatası: " + errorobject);
});

admin.database().ref('campaigns').on("child_removed", function(event) {
  campaigncount -= 1;

  statsref.once("value", function(snapshot) {
    if (campaigncount < snapshot.val().campaigns ) {
      statsref.update({
        campaigns: campaigncount
      }, function(error) {
        if (error) {
            console.error("istatistik (campaigns)(child_removed) güncellenemedi. " + error);
          } else {
            //güncelleme başarılı
          }
      });
    }
  }, function (errorobject) {
    console.error("(campaigns) istatistikler veritabanından okunamadı: " + errorobject);
  });

}, function (errorobject) {
  console.error("campaigns.on(child_removed) hatası: " + errorobject);
});

//bildirim istatistikleri
var notificationcount = 0;
admin.database().ref('notifications').on("child_added", function(event) {
  notificationcount += 1;
  statsref.once("value", function(snapshot) {
    if (notificationcount > snapshot.val().notifications ) {
      statsref.update({
        notifications: notificationcount
      }, function(error) {
          if (error) {
              console.error("istatistik (notifications)(child_added) güncellenemedi. " + error);
          } else {
              //güncelleme başarılı
          }
      });
    }
  }, function (errorobject) {
    console.error("(notifications) istatistikler veritabanından okunamadı: " + errorobject);
  });

}, function (errorobject) {
  console.error("notifications.on(child_added) hatası: " + errorobject);
});

admin.database().ref('notifications').on("child_removed", function(event) {
  notificationcount -= 1;

  statsref.once("value", function(snapshot) {
    if (notificationcount < snapshot.val().notifications ) {
      statsref.update({
        notifications: notificationcount
      }, function(error) {
        if (error) {
            console.error("istatistik (notifications)(child_removed) güncellenemedi. " + error);
          } else {
            //güncelleme başarılı
          }
      });
    }
  }, function (errorobject) {
    console.error("(notifications) istatistikler veritabanından okunamadı: " + errorobject);
  });

}, function (errorobject) {
  console.error("notifications.on(child_removed) hatası: " + errorobject);
});


/**
 * mail gönderme fonksiyonu
 * @returns boolean
 * @param html_text e-posta içeriği (html etiketlerini destekler)
 * @param subject e-posta konusu
 * @param to e-posta alıcı (birden fazla kişiye göndermek için adresleri virgülle ayırın)
 */
function sendmail(html_text, subject, to) {
            
  /**
   * gmail ayarları
   */
  //var transporter = nodemailer.createtransport({
  //    service: 'gmail',
  //    host: 'smtp.gmail.com',
  //    port: 587,
  //    secure: false, // true for 465, false for other ports
  //    auth: {
  //        user: 'mezoklinik.app@gmail.com',
  //        pass: ''
  //    }
  //});
  
  //var mailoptions = {
  //    from: 'mezoklinik.app@gmail.com',
  //    to: to,
  //    subject: subject,
  //     text: text,
  //    html: html_text,
  //};

  //transporter.sendmail(mailoptions, function(error, info){
  //    if (error) {
  //        return false;
  //    } else {
  //        return true;
  //    }
  //});

}