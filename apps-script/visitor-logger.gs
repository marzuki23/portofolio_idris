/*
 * VISITOR LOGGER — Google Apps Script
 * Menerima data pengunjung dari website (siapapun, dari jaringan mana pun)
 * lalu menyimpannya ke Google Sheet secara real-time.
 *
 * CARA SETUP (sekali saja):
 * 1. Buka Google Sheet-mu (yang sudah dibuat tadi) → menu: Extensions > Apps Script
 * 2. Hapus isi Code.gs, tempel seluruh isi file ini, lalu simpan (Ctrl+S).
 * 3. Deploy > New deployment > pilih type: Web app
 *    - Description : Visitor Logger
 *    - Execute as  : Me
 *    - Who has access : Anyone
 *    - Klik Deploy, izinkan akses, lalu salin URL yang berakhiran .../exec
 * 4. Tempel URL itu ke konstanta WEB_APP_URL di file js/visitor-tracker.js,
 *    lalu upload ulang website ke GitHub.
 *
 * Setelah itu, siapa pun yang mengunjungi website (dari jaringan mana pun)
 * otomatis tercatat di Sheet ini.
 */

var SEND_EMAIL_NOTIF = true;          // true = email tiap ada pengunjung baru
var NOTIF_EMAIL = 'muh.idrismarzuki2301@gmail.com'; // ganti dengan email tujuan notif

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(); // script terikat ke Sheet
  if (!ss) {
    ss = SpreadsheetApp.openById('1--TcZ9uAnklxwZ6P5IqoogKcsIkUcN2CaM6EZJciWXE'); // script berdiri sendiri
  }
  return ss.getSheetByName('Visitors') || ss.insertSheet('Visitors');
}

function ensureHeader(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow([
    'No', 'Waktu (WIB)', 'IP Address', 'Negara', 'Kota',
    'Device', 'Browser', 'OS', 'Halaman', 'Referrer', 'User Agent'
  ]);
  sheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#d9eaff');
}

function doPost(e) {
  try {
    var sheet = getSheet();
    ensureHeader(sheet);

    var p = {};
    if (e && e.postData && e.postData.contents) {
      try { p = JSON.parse(e.postData.contents); } catch (err) { p = e.parameter || {}; }
    } else {
      p = (e && e.parameter) || {};
    }

    var now = new Date();
    var row = [
      sheet.getLastRow() + 1,
      Utilities.formatDate(now, 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss'),
      p.ip || '',
      p.country || '',
      p.city || '',
      p.device || '',
      p.browser || '',
      p.os || '',
      p.page || '',
      p.referrer || '',
      p.ua || ''
    ];
    sheet.appendRow(row);

    if (SEND_EMAIL_NOTIF && NOTIF_EMAIL) {
      MailApp.sendEmail({
        to: NOTIF_EMAIL,
        subject: 'Pengunjung baru: ' + (p.device || '?') + ' - ' + (p.country || '?'),
        body:
          'Waktu   : ' + row[1] + '\n' +
          'IP      : ' + (p.ip || '-') + '\n' +
          'Negara  : ' + (p.country || '-') + '\n' +
          'Kota    : ' + (p.city || '-') + '\n' +
          'Device  : ' + (p.device || '-') + '\n' +
          'Browser : ' + (p.browser || '-') + '\n' +
          'OS      : ' + (p.os || '-') + '\n' +
          'Halaman : ' + (p.page || '-') + '\n' +
          'Referrer: ' + (p.referrer || '-') + '\n' +
          'UserAgent: ' + (p.ua || '-')
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true }));
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, err: err.message }));
  }
}

// Dukung pengecekan cepat lewat GET (opsional)
function doGet(e) { return doPost(e); }
