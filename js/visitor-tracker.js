/*
 * VISITOR TRACKER
 * Mencatat pengunjung dari mana pun (jaringan apa saja) ke dua tempat:
 *   1. Google Apps Script → Google Sheet (untuk pengunjung web public)
 *   2. server lokal /api/log → visitor-log.csv (untuk tes di komputermu)
 *
 * CARA SETUP PUBLIC (sekali saja):
 * 1. Buka Sheet-mu → Extensions > Apps Script → tempel isi
 *    apps-script/visitor-logger.gs → simpan.
 * 2. Deploy > New deployment > Web app → Execute as: Me, access: Anyone.
 * 3. Tempel URL .../exec ke WEB_APP_URL di bawah.
 * 4. Push ulang website ke GitHub.
 *
 * Setelah itu, siapa pun yang membuka website (link GitHub Pages)
 * otomatis tercatat di Google Sheet.
 *
 * Data yang dicatat: waktu, IP, negara, kota, device, browser, OS,
 * halaman, referrer, dan user agent.
 */
(function () {
  'use strict';

  if (!location.protocol.match(/^http/)) return;

  // GANTI dengan URL deployment web app, contoh:
  // var WEB_APP_URL = 'https://script.google.com/macros/s/ABCDEF1234/exec';
  var WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyB0QlnWmGOujtypX1pwiXjp40okE4XG28WP75q1K6LXQNCPu62otvb4cJ-YKf_GNHW/exec';

  var key = 'visitorLogged_' + location.pathname;
  if (window.sessionStorage.getItem(key)) return;

  var info = {
    ip: '',
    country: '',
    city: '',
    device: /Mobi|Android|iPhone|iPad|Tablet/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
    browser: (function () {
      var ua = navigator.userAgent;
      if (/Edg\//.test(ua)) return 'Edge';
      if (/OPR\/|Opera/.test(ua)) return 'Opera';
      if (/Firefox\//.test(ua)) return 'Firefox';
      if (/Chrome\//.test(ua)) return 'Chrome';
      if (/Safari\//.test(ua)) return 'Safari';
      return 'Lainnya';
    })(),
    os: (function () {
      var ua = navigator.userAgent;
      if (/Windows NT/.test(ua)) return 'Windows';
      if (/Android/.test(ua)) return 'Android';
      if (/iPhone|iPad|iOS/.test(ua)) return 'iOS';
      if (/Mac OS X/.test(ua)) return 'macOS';
      if (/Linux/.test(ua)) return 'Linux';
      return 'Lainnya';
    })(),
    page: location.pathname,
    referrer: document.referrer || '',
    ua: navigator.userAgent
  };

  function sendAll() {
    var sent = [];
    if (WEB_APP_URL) {
      sent.push(fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(info)
      }).catch(function () {}));
    }
    sent.push(fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info)
    }).catch(function () {}));

    Promise.all(sent).then(function () {
      window.sessionStorage.setItem(key, '1');
    }).catch(function () {});
  }

  // Ambil IP & lokasi (opsional, layanan ipapi.co). Kalau gagal,
  // data tetap tercatat hanya tanpa kolom IP/negara/kota.
  fetch('https://ipapi.co/json/')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d && d.ip) info.ip = d.ip;
      if (d && d.country_name) info.country = d.country_name;
      if (d && d.city) info.city = d.city;
      sendAll();
    })
    .catch(sendAll);
})();
