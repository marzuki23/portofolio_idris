const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const ROOT = __dirname;
const LOG_FILE = path.join(ROOT, 'visitor-log.csv');
const LOG_HEADER = 'Timestamp,IP,Country,City,Device,Browser,OS,Page,Referrer,User Agent\n';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function csvEscape(v) {
  if (v == null) return '';
  v = String(v);
  if (/[",\r\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
  return v;
}

function htmlEscape(v) {
  if (v == null || v === '') return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseCSVLine(line) {
  const out = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

function countBy(rows, idx) {
  const map = {};
  rows.forEach((r) => {
    const k = r[idx] || '(tidak diketahui)';
    map[k] = (map[k] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function statCard(label, value, accent) {
  return (
    '<div class="card"><div class="num" style="color:' + accent + '">' + value + '</div>' +
    '<div class="lbl">' + label + '</div></div>'
  );
}

function statRow(title, entries) {
  const max = entries.length ? entries[0][1] : 1;
  const bars = entries.map(([k, v]) =>
    '<div class="bar-row"><span class="bar-lbl">' + htmlEscape(k) + '</span>' +
    '<span class="bar-track"><span class="bar-fill" style="width:' +
    Math.round((v / max) * 100) + '%"></span></span>' +
    '<span class="bar-num">' + v + '</span></div>'
  ).join('');
  return '<div class="panel"><h3>' + title + '</h3>' + bars + '</div>';
}

function renderStatsHTML(rows, fileExists) {
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
  const uniqueIps = new Set(rows.map((r) => r[1])).size;
  const todayCount = rows.filter((r) => r[0].slice(0, 10) === today).length;

  const LABELS = ['Waktu', 'IP', 'Negara', 'Kota', 'Device', 'Browser', 'OS', 'Halaman', 'Referrer', 'User Agent'];
  const HIDE_MOBILE = [8, 9]; // Referrer & User Agent terlalu panjang untuk HP

  const tableRows = fileExists && rows.length
    ? rows.slice().reverse().map((r) =>
        '<tr>' + r.map((c, i) =>
          '<td data-label="' + LABELS[i] + '"' +
          (HIDE_MOBILE.includes(i) ? ' class="hide-mobile"' : '') + '>' +
          htmlEscape(c) + '</td>'
        ).join('') + '</tr>'
      ).join('')
    : '<tr><td colspan="11" class="empty">Belum ada data pengunjung. Buka website-nya dulu lewat browser.</td></tr>';

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="15">
<title>Laporan Pengunjung</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #0b1220; color: #e6edf7; padding: 24px; }
  .wrap { max-width: 1100px; margin: 0 auto; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .sub { color: #8ea3c0; font-size: 13px; margin-bottom: 20px; }
  .sub a { color: #00C4FF; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; margin-bottom: 20px; }
  .card { background: #152238; border: 1px solid #22344f; border-radius: 12px; padding: 18px; text-align: center; }
  .num { font-size: 30px; font-weight: 700; }
  .lbl { font-size: 12px; color: #8ea3c0; margin-top: 4px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-bottom: 20px; }
  .panel { background: #152238; border: 1px solid #22344f; border-radius: 12px; padding: 16px; }
  .panel h3 { font-size: 14px; color: #00C4FF; margin-bottom: 12px; }
  .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px; }
  .bar-lbl { width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bar-track { flex: 1; background: #0b1220; border-radius: 6px; height: 10px; overflow: hidden; }
  .bar-fill { display: block; height: 100%; background: #00C4FF; border-radius: 6px; }
  .bar-num { width: 34px; text-align: right; color: #8ea3c0; }
  .table-wrap { background: #152238; border: 1px solid #22344f; border-radius: 12px; padding: 16px; overflow-x: auto; }
  .table-wrap h3 { font-size: 14px; color: #00C4FF; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; min-width: 900px; }
  th { text-align: left; color: #8ea3c0; font-weight: 600; padding: 8px 10px; border-bottom: 1px solid #22344f; position: sticky; top: 0; background: #152238; }
  td { padding: 8px 10px; border-bottom: 1px solid #1b2c45; white-space: nowrap; }
  tr:hover td { background: #1b2c45; }
  .empty { text-align: center; color: #8ea3c0; padding: 30px !important; white-space: normal !important; }
  .auto { font-size: 12px; color: #5b7390; margin-top: 12px; text-align: center; }
  @media (max-width: 600px) {
    body { padding: 14px; }
    h1 { font-size: 18px; }
    .sub { font-size: 12px; }
    .cards { grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .card { padding: 12px 6px; }
    .num { font-size: 22px; }
    .lbl { font-size: 10px; }
    .grid { grid-template-columns: 1fr 1fr; gap: 10px; }
    .panel { padding: 12px; }
    .panel h3 { font-size: 12px; }
    .bar-lbl { width: 70px; font-size: 11px; }
    .table-wrap { padding: 12px; border-radius: 10px; }
    table, thead, tbody, tr, th, td { display: block; }
    thead { display: none; }
    table { min-width: 0; width: 100%; }
    tr { border: 1px solid #22344f; border-radius: 10px; padding: 6px 0; margin-bottom: 10px; background: #0f1a2e; }
    td { border: none; display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 5px 12px; white-space: normal; text-align: right; }
    td::before { content: attr(data-label); color: #8ea3c0; font-weight: 600; flex-shrink: 0; text-align: left; }
    tr:hover td { background: transparent; }
    td.hide-mobile { display: none; }
  }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Laporan Pengunjung — Portofolio</h1>
    <div class="sub">Halaman ini otomatis refresh tiap 15 detik · <a href="/api/log.csv">Unduh CSV (Excel)</a></div>
    <div class="cards">
      ${statCard('Total Kunjungan', rows.length, '#00C4FF')}
      ${statCard('Pengunjung Unik (IP)', uniqueIps, '#7ee787')}
      ${statCard('Hari Ini', todayCount, '#ffab70')}
    </div>
    <div class="grid">
      ${statRow('Device', countBy(rows, 4))}
      ${statRow('Browser', countBy(rows, 5))}
      ${statRow('Negara', countBy(rows, 2))}
      ${statRow('Halaman', countBy(rows, 7))}
    </div>
    <div class="table-wrap">
      <h3>Riwayat Pengunjung (terbaru di atas)</h3>
      <table>
        <thead><tr>
          <th>Waktu</th><th>IP</th><th>Negara</th><th>Kota</th><th>Device</th><th>Browser</th><th>OS</th><th>Halaman</th>
          <th class="hide-mobile">Referrer</th><th class="hide-mobile">User Agent</th>
        </tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
    <div class="auto">Auto-refresh 15 detik · klik di luar tabel untuk scroll &nbsp;·&nbsp; IP pengunjung hanya tersimpan di komputer ini (visitor-log.csv)</div>
  </div>
</body>
</html>`;
}

function serveStatic(req, res, urlPath) {
  let filePath = path.normalize(path.join(ROOT, decodeURIComponent(urlPath)));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  if (urlPath === '/') {
    filePath = path.join(ROOT, 'index.html');
  } else if (!path.extname(urlPath)) {
    const htmlCandidate = path.join(ROOT, decodeURIComponent(urlPath) + '.html');
    if (fs.existsSync(htmlCandidate)) filePath = htmlCandidate;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/log') {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      let p = {};
      try { p = JSON.parse(body); } catch (e) { p = {}; }
      const line = [
        new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }),
        p.ip, p.country, p.city, p.device, p.browser, p.os, p.page, p.referrer, p.ua
      ].map(csvEscape).join(',') + '\n';

      if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, LOG_HEADER);

      fs.appendFile(LOG_FILE, line, (err) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      });
    });
    return;
  }

  if (req.method === 'GET' && (url.pathname === '/api/log' || url.pathname === '/api/log.csv')) {
    fs.readFile(LOG_FILE, (err, data) => {
      const fileExists = !err;
      const text = fileExists ? data.toString() : LOG_HEADER;

      if (url.pathname === '/api/log.csv') {
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="visitor-log.csv"'
        });
        res.end(text);
        return;
      }

      const lines = text.split(/\r?\n/).filter(Boolean);
      const rows = lines.slice(1).map(parseCSVLine);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderStatsHTML(rows, fileExists));
    });
    return;
  }

  serveStatic(req, res, url.pathname);
});

server.listen(PORT, () => {
  console.log('Portofolio berjalan di: http://localhost:' + PORT);
  console.log('Laporan pengunjung    : http://localhost:' + PORT + '/api/log');
  console.log('Unduh data (CSV/Excel): http://localhost:' + PORT + '/api/log.csv');
});
