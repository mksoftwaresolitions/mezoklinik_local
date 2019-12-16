var express = require('express');

var router = express.Router();

var ctrlHome = require('../controller/homeController');

router.get('/', ctrlHome.index);
router.get('/login', ctrlHome.indexGet);
router.get('/index.*', ctrlHome.index);
router.post('/login', ctrlHome.indexPost);

router.get('/logout', ctrlHome.logout);

// router.get('/db', ctrlHome.db);
router.get('/userAdd', ctrlHome.userAdd);
router.get('/userList', ctrlHome.userList);
router.get('/userUpdate', ctrlHome.userUpdate);
// router.get('/index.html', ctrlHome.index);

// router.get('/kullanicilar', ctrlHome.kullanicilar);
// router.get('/kullanicilar/:kullaniciId', ctrlHome.kullaniciDuzenle);
// router.post('/kullanicilar', ctrlHome.kullaniciDuzenlePost);
// router.get('/kullaniciEkle', ctrlHome.kullaniciEkleGet);
// router.post('/kullaniciEkle', ctrlHome.kullaniciEklePost);
// router.delete('/kullanicilar', ctrlHome.kullaniciSil);


module.exports = router;