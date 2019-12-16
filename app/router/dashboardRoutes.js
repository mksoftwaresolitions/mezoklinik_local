var express = require('express');

var router = express.Router();

var ctrlDashboard = require('../controller/dashboardController');

router.get('/', ctrlDashboard.index);
router.get('/index.*', ctrlDashboard.index);
router.get('/dashboard', ctrlDashboard.index);

router.get('/doktorListesi', ctrlDashboard.doktorListGet);
router.get('/doktorEkle', ctrlDashboard.doktorEkleGet);
router.post('/doktorEkle', ctrlDashboard.doktorEklePost);
router.get('/doktorDuzenle/:uid', ctrlDashboard.doktorDuzenleGet);
router.post('/doktorDuzenle', ctrlDashboard.doktorDuzenlePost);
router.get('/doktorOnayListesi', ctrlDashboard.doktorOnayListGet);
router.get('/doktorOnayListesi/:uid&:email&:name', ctrlDashboard.doktorOnayGet);
router.get('/doktorOnayIptal/:uid', ctrlDashboard.doktorOnayIptalGet);
router.get('/doktorSil/:uid', ctrlDashboard.doktorSilGet);

router.get('/mailTest', ctrlDashboard.mailTestGet);
router.post('/mailTest', ctrlDashboard.mailTestPost);
router.get('/mailSablonuDuzenle', ctrlDashboard.mailSablonuDuzenleGet);
router.post('/mailSablonuDuzenle', ctrlDashboard.mailSablonuDuzenlePost);

router.get('/bildirimGonder', ctrlDashboard.bildirimGonderGet);
router.post('/bildirimGonder', ctrlDashboard.bildirimGonderPost);
router.get('/bildirimAlmaTest', ctrlDashboard.bildirimAlmaTestGet);
router.get('/bildirimListesi', ctrlDashboard.bildirimListeleGet);

router.get('/faydaliLinkListesi', ctrlDashboard.faydaliLinkListeleGet);
router.get('/faydaliLinkEkle', ctrlDashboard.faydaliLinkEkleGet);
router.post('/faydaliLinkEkle', ctrlDashboard.faydaliLinkEklePost);
router.get('/faydaliLinkDuzenle/:uid', ctrlDashboard.faydaliLinkDuzenleGet);
router.post('/faydaliLinkDuzenle', ctrlDashboard.faydaliLinkDuzenlePost);
router.get('/faydaliLinkSil/:uid', ctrlDashboard.faydaliLinkSilGet);

router.get('/markalar', ctrlDashboard.markalarGet);
router.post('/markaEkle', ctrlDashboard.markaEklePost);
router.get('/markaSil/:uid', ctrlDashboard.markaSilGet);

router.get('/branslar', ctrlDashboard.branslarGet);
router.post('/bransEkle', ctrlDashboard.bransEklePost);
router.get('/bransSil/:uid', ctrlDashboard.bransSilGet);

router.get('/kampanyaListesi', ctrlDashboard.kampanyaListeleGet);
router.get('/kampanyaEkle', ctrlDashboard.kampanyaEkleGet);
// router.post('/kampanyaEkle', ctrlDashboard.kampanyaEklePost);
router.get('/kampanyaDuzenle/:uid', ctrlDashboard.kampanyaDuzenleGet);
router.post('/kampanyaDuzenle', ctrlDashboard.kampanyaDuzenlePost);

router.get('/test', ctrlDashboard.testGet);

router.get('/kategoriListesi', ctrlDashboard.kategoriListeleGet);
router.get('/kategoriEkle', ctrlDashboard.kategoriEkleGet);
router.post('/kategoriEkle', ctrlDashboard.kategoriEklePost);
router.get('/kategoriDuzenle/:uid', ctrlDashboard.kategoriDuzenleGet);
router.post('/kategoriDuzenle', ctrlDashboard.kategoriDuzenlePost);
router.get('/kategoriSil/:uid', ctrlDashboard.kategoriSilGet);

router.get('/urunListesi', ctrlDashboard.urunListeleGet);
router.get('/urunEkle', ctrlDashboard.urunEkleGet);
router.post('/urunEkle', ctrlDashboard.urunEklePost);
router.get('/urunDuzenle/:pcuid&:puid', ctrlDashboard.urunDuzenleGet);
router.post('/urunDuzenle', ctrlDashboard.urunDuzenlePost);

router.get('/dosyaTipiListesi', ctrlDashboard.dosyaTipiListeleGet);
router.get('/dosyaKategorisiEkle', ctrlDashboard.dosyaKategorisiEkleGet);
router.post('/dosyaKategorisiEkle', ctrlDashboard.dosyaKategorisiEklePost);
router.get('/dosyaTipiDuzenle/:prodCatUid&:prodUid&:fileCatUid', ctrlDashboard.dosyaTipiDuzenleGet);
router.post('/dosyaTipiDuzenle', ctrlDashboard.dosyaTipiDuzenlePost);
router.get('/dosyaTipiSil/:prodCatUid&:prodUid&:fileCatUid', ctrlDashboard.dosyaTipiSilGet);

router.get('/dosyaListesi', ctrlDashboard.dosyaListesiGet);
router.get('/dosyaEkle', ctrlDashboard.dosyaEkleGet);
router.get('/dosyaDuzenle/:prodCatUid&:prodUid&:fileCatUid&:fileUid', ctrlDashboard.dosyaDuzenleGet);
router.post('/dosyaDuzenle', ctrlDashboard.dosyaDuzenlePost);
router.get('/dosyaSil/:prodCatUid&:prodUid&:fileCatUid&:fileUid', ctrlDashboard.dosyaSilGet);

router.get('/ayarlar', ctrlDashboard.sifreAyarlariGet);
router.post('/ayarlar', ctrlDashboard.sifreAyarlariPost);

router.get('/charts', ctrlDashboard.chartsGet);
router.get('/forms', ctrlDashboard.formsGet);
router.get('/login', ctrlDashboard.loginGet);
router.get('/tables', ctrlDashboard.tablesGet);


// router.get('/', ctrlAdmin.indexGet);
// router.post('/', ctrlAdmin.indexPost);
// router.get('/logout', ctrlAdmin.logoutGet);

// router.get('/kurumlar', ctrlAdmin.kurumlarGet);
// router.get('/kurumDuzenle/:kurumId', ctrlAdmin.kurumDuzenleGet);
// router.post('/kurumDuzenle/:kurumId', ctrlAdmin.kurumDuzenlePost);
// router.get('/kurumEkle/', ctrlAdmin.kurumEkleGet);
// router.post('/kurumEkle', ctrlAdmin.kurumEklePost);

// router.get('/kullaniciEkle', ctrlAdmin.kullaniciEkleGet);
// router.post('/kullaniciEkle', ctrlAdmin.kullaniciEklePost);

// router.get('/mpGenelAyarlar', ctrlAdmin.mpGenelAyarlarGet);
// router.post('/mpGenelAyarlar', ctrlAdmin.mpGenelAyarlarPost);
// router.get('/mpHeader', ctrlAdmin.mpHeaderGet);
// router.get('/mpIntro', ctrlAdmin.mpIntroGet);
// router.get('/mpFeatured', ctrlAdmin.mpFeaturedGet);
// router.get('/mpAbout', ctrlAdmin.mpAboutGet);
// router.get('/mpServices', ctrlAdmin.mpServicesGet);
// router.get('/mpCallToAction', ctrlAdmin.mpCallToActionGet);
// router.get('/mpFacts', ctrlAdmin.mpFactsGet);
// router.get('/mpClients', ctrlAdmin.mpClientsGet);
// router.get('/mpContact', ctrlAdmin.mpContactGet);
// router.get('/mpFooter', ctrlAdmin.mpFooterGet);


module.exports = router;