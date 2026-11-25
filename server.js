const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec, spawn } = require('child_process');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const IS_CLOUD_RUN = Boolean(
  process.env.K_SERVICE ||
    process.env.RENDER ||
    process.env.RAILWAY_ENVIRONMENT ||
    process.env.FLY_APP_NAME
);
function normalizeSupabaseOrigin(rawUrl) {
  const s = String(rawUrl || '').trim();
  if (!s) return '';
  try {
    return new URL(s).origin;
  } catch (e) {
    return s.replace(/\/rest\/v1\/?.*$/i, '').replace(/\/$/, '');
  }
}
const SUPABASE_URL = normalizeSupabaseOrigin(process.env.SUPABASE_URL);
const SUPABASE_KEY = String(
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || ''
).trim();
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'presentations';
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_KEY);
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'hub_database_v2.json');

// Ensure directories exist
[PUBLIC_DIR, DATA_DIR, UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function makeId() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Built-in Class 204 Roster (1 ~ 35)
const CLASS_204_ROSTER = [
  { groupOrSeat: '01', presenterName: '王鵬睿' },
  { groupOrSeat: '02', presenterName: '田浩嚴' },
  { groupOrSeat: '03', presenterName: '吳泉孟' },
  { groupOrSeat: '04', presenterName: '宋珩睿' },
  { groupOrSeat: '05', presenterName: '李昀諺' },
  { groupOrSeat: '06', presenterName: '李柏宏' },
  { groupOrSeat: '07', presenterName: '沈孟劭' },
  { groupOrSeat: '08', presenterName: '林可捷' },
  { groupOrSeat: '09', presenterName: '林承佑' },
  { groupOrSeat: '10', presenterName: '林昶志' },
  { groupOrSeat: '11', presenterName: '林聖庭' },
  { groupOrSeat: '12', presenterName: '邱正碩' },
  { groupOrSeat: '13', presenterName: '紀柏瑜' },
  { groupOrSeat: '14', presenterName: '夏清彥' },
  { groupOrSeat: '15', presenterName: '高睿毅' },
  { groupOrSeat: '16', presenterName: '張宇椉' },
  { groupOrSeat: '17', presenterName: '張定魁' },
  { groupOrSeat: '18', presenterName: '張庭睿' },
  { groupOrSeat: '19', presenterName: '章奕勛' },
  { groupOrSeat: '20', presenterName: '陳子璿' },
  { groupOrSeat: '21', presenterName: '黃伸億' },
  { groupOrSeat: '22', presenterName: '黃柏勳' },
  { groupOrSeat: '23', presenterName: '黃羿凱' },
  { groupOrSeat: '24', presenterName: '楊家淳' },
  { groupOrSeat: '25', presenterName: '楊家鈞' },
  { groupOrSeat: '26', presenterName: '溫家誠' },
  { groupOrSeat: '27', presenterName: '虞立安' },
  { groupOrSeat: '28', presenterName: '詹崴宇' },
  { groupOrSeat: '29', presenterName: '劉彥甫' },
  { groupOrSeat: '30', presenterName: '蔡明峻' },
  { groupOrSeat: '31', presenterName: '鄭智嘉' },
  { groupOrSeat: '32', presenterName: '鄭澈星' },
  { groupOrSeat: '33', presenterName: '賴柏維' },
  { groupOrSeat: '34', presenterName: '謝汯志' },
  { groupOrSeat: '35', presenterName: '鍾孟勳' }
];

// Default Subjects (國英數地歷公化物生)
const DEFAULT_SUBJECTS = [
  { id: '國文', name: '國文', icon: '📖', isDefault: true },
  { id: '英文', name: '英文', icon: '🔤', isDefault: true },
  { id: '數學', name: '數學', icon: '📐', isDefault: true },
  { id: '地理', name: '地理', icon: '🌍', isDefault: true },
  { id: '歷史', name: '歷史', icon: '🏛️', isDefault: true },
  { id: '公民', name: '公民', icon: '⚖️', isDefault: true },
  { id: '化學', name: '化學', icon: '🧪', isDefault: true },
  { id: '物理', name: '物理', icon: '⚡', isDefault: true },
  { id: '生物', name: '生物', icon: '🧬', isDefault: true }
];

function createBoardFromRoster(roster) {
  return roster.map((s, idx) => ({
    id: makeId(),
    groupOrSeat: String(s.groupOrSeat || '').trim(),
    presenterName: String(s.presenterName || '').trim(),
    title: '',
    type: 'none',
    url: '',
    fileUrl: '',
    storedFileName: '',
    originalFileName: '',
    fileSize: 0,
    openMode: 'auto',
    note: '',
    hasSubmitted: false,
    status: 'unsubmitted',
    order: idx + 1,
    createdAt: Date.now(),
    updatedAt: null
  }));
}

function normalizeItem(p, idx) {
  const hasSubmitted = Boolean((p.fileUrl && p.fileUrl.trim()) || (p.url && p.url.trim()));
  let status = p.status || (hasSubmitted ? 'pending' : 'unsubmitted');
  if (!hasSubmitted) {
    status = 'unsubmitted';
  } else if (status === 'unsubmitted') {
    status = 'pending';
  }
  return {
    id: p.id || makeId(),
    groupOrSeat: String(p.groupOrSeat || '').trim(),
    presenterName: String(p.presenterName || '').trim() || '未具名',
    title: String(p.title || '').trim(),
    type: hasSubmitted ? (p.type || 'link') : 'none',
    url: String(p.url || '').trim(),
    fileUrl: p.fileUrl || '',
    storedFileName: p.storedFileName || '',
    originalFileName: p.originalFileName || '',
    fileSize: p.fileSize || 0,
    openMode: p.openMode || 'auto',
    note: String(p.note || '').trim(),
    hasSubmitted,
    status,
    order: typeof p.order === 'number' ? p.order : idx + 1,
    createdAt: p.createdAt || Date.now(),
    updatedAt: p.updatedAt || null
  };
}

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.classes) && Array.isArray(parsed.subjects) && parsed.boards) {
        if (!parsed.topics) parsed.topics = {};
        return parsed;
      }
    }
  } catch (err) {
    console.error('讀取資料庫失敗，將建立新資料庫:', err.message);
  }

  const initial = {
    classes: [
      {
        id: '204班',
        name: '204班',
        roster: [...CLASS_204_ROSTER]
      }
    ],
    subjects: [...DEFAULT_SUBJECTS],
    topics: {}, // key: `${classId}__${subjectId}` -> [{ id, name, createdAt }]
    boards: {}  // key: `${classId}__${subjectId}__${topicId}` -> array of presentation items
  };
  saveDB(initial);
  return initial;
}

let supabaseSaveChain = Promise.resolve();
function saveDbToSupabase(dbData) {
  if (!USE_SUPABASE) return;
  const snapshot = JSON.stringify(dbData);
  supabaseSaveChain = supabaseSaveChain
    .then(async () => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/hub_state?on_conflict=id`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          id: 'main',
          data: JSON.parse(snapshot),
          updated_at: new Date().toISOString()
        })
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        console.error('Supabase save error:', res.status, txt);
      }
    })
    .catch((err) => console.error('Supabase save failed:', err.message));
}

async function initSupabase() {
  if (!USE_SUPABASE) return;
  try {
    // Ensure public storage bucket exists
    await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: SUPABASE_BUCKET,
        name: SUPABASE_BUCKET,
        public: true
      })
    }).catch(() => {});

    // Load persisted DB state
    const res = await fetch(`${SUPABASE_URL}/rest/v1/hub_state?id=eq.main&select=data`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    if (!res.ok) {
      console.error('Supabase load error:', res.status, await res.text().catch(() => ''));
      return;
    }
    const rows = await res.json();
    if (Array.isArray(rows) && rows[0] && rows[0].data) {
      const parsed = rows[0].data;
      if (Array.isArray(parsed.classes) && Array.isArray(parsed.subjects) && parsed.boards) {
        if (!parsed.topics) parsed.topics = {};
        db = parsed;
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
        console.log('  ☁️ 已從 Supabase 雲端資料庫載入班級報告資料');
      }
    } else {
      saveDbToSupabase(db);
      console.log('  ☁️ 已初始化 Supabase 雲端資料庫');
    }
  } catch (err) {
    console.error('Supabase init failed:', err.message);
  }
}

function saveDB(dbData) {
  fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');
  saveDbToSupabase(dbData);
}

function deleteStoredFileIfExist(storedFileName) {
  if (!storedFileName) return;
  const baseName = path.basename(storedFileName);
  const fp = path.join(UPLOADS_DIR, baseName);
  if (fs.existsSync(fp)) {
    try {
      fs.unlinkSync(fp);
    } catch (e) {}
  }
  if (USE_SUPABASE) {
    fetch(`${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${encodeURIComponent(baseName)}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    }).catch(() => {});
  }
}

let db = loadDB();

function getTopicKey(classId, subjectId) {
  return `${classId}__${subjectId}`;
}

function getBoardKey(classId, subjectId, topicId) {
  return `${classId}__${subjectId}__${topicId}`;
}

function getOrCreateTopics(classId, subjectId) {
  const tKey = getTopicKey(classId, subjectId);
  if (!Array.isArray(db.topics[tKey])) {
    db.topics[tKey] = [];
  }
  return db.topics[tKey];
}

function getOrCreateBoard(classId, subjectId, topicId) {
  const cls = db.classes.find((c) => c.id === classId) || db.classes[0];
  if (!cls || !topicId) return [];
  const topics = getOrCreateTopics(cls.id, subjectId);
  const resolvedTopicId = topicId;

  // Ensure topic exists in topics list if passed via URL
  if (!topics.some((t) => t.id === resolvedTopicId)) {
    topics.push({
      id: resolvedTopicId,
      name: resolvedTopicId,
      createdAt: Date.now()
    });
  }

  const bKey = getBoardKey(cls.id, subjectId, resolvedTopicId);
  if (!Array.isArray(db.boards[bKey]) || db.boards[bKey].length === 0) {
    db.boards[bKey] = createBoardFromRoster(cls.roster || []);
    saveDB(db);
  } else {
    db.boards[bKey] = db.boards[bKey].map(normalizeItem);
  }
  return db.boards[bKey];
}

// Sync a class's updated roster across all existing boards of that class
function syncRosterAcrossClassBoards(classId, newRoster, mode = 'smart_sync') {
  const prefix = `${classId}__`;
  for (const key of Object.keys(db.boards)) {
    if (!key.startsWith(prefix)) continue;
    const oldList = db.boards[key] || [];

    if (mode === 'replace') {
      oldList.forEach((p) => deleteStoredFileIfExist(p.storedFileName));
      db.boards[key] = createBoardFromRoster(newRoster);
    } else if (mode === 'smart_sync') {
      const oldBySeat = new Map();
      const oldByName = new Map();
      oldList.forEach((p) => {
        if (p.groupOrSeat) oldBySeat.set(String(p.groupOrSeat).replace(/^0+/, ''), p);
        if (p.presenterName) oldByName.set(p.presenterName, p);
      });

      const usedIds = new Set();
      const nextList = newRoster.map((entry, idx) => {
        const seatKey = String(entry.groupOrSeat || '').replace(/^0+/, '');
        const matched =
          (seatKey && oldBySeat.get(seatKey)) || oldByName.get(entry.presenterName);
        if (matched && !usedIds.has(matched.id)) {
          usedIds.add(matched.id);
          matched.groupOrSeat = String(entry.groupOrSeat || '').trim();
          matched.presenterName = String(entry.presenterName || '').trim();
          matched.order = idx + 1;
          return normalizeItem(matched, idx);
        }
        return normalizeItem(
          {
            id: makeId(),
            groupOrSeat: entry.groupOrSeat,
            presenterName: entry.presenterName,
            order: idx + 1,
            status: 'unsubmitted'
          },
          idx
        );
      });

      oldList.forEach((p) => {
        if (!usedIds.has(p.id)) {
          deleteStoredFileIfExist(p.storedFileName);
        }
      });

      db.boards[key] = nextList;
    }
  }
}

// Summary stats for subjects and topics
function getHierarchySummary() {
  const summary = {};
  for (const cls of db.classes) {
    summary[cls.id] = {};
    const defaultTotal = (cls.roster || []).length;
    for (const sub of db.subjects) {
      const tKey = getTopicKey(cls.id, sub.id);
      const topics = db.topics[tKey] || [];
      const topicStats = topics.map((t) => {
        const bKey = getBoardKey(cls.id, sub.id, t.id);
        const board = db.boards[bKey];
        const total = board ? board.length : defaultTotal;
        const submitted = board ? board.filter((p) => p.hasSubmitted).length : 0;
        const done = board ? board.filter((p) => p.status === 'done').length : 0;
        return {
          id: t.id,
          name: t.name,
          createdAt: t.createdAt,
          total,
          submitted,
          done
        };
      });
      summary[cls.id][sub.id] = {
        topicCount: topics.length,
        topics: topicStats
      };
    }
  }
  return summary;
}

// SSE Clients for real-time updates
const sseClients = new Set();

function broadcastUpdate(
  eventType = 'update',
  classId = null,
  subjectId = null,
  topicId = null,
  payload = null
) {
  const message = JSON.stringify({
    type: eventType,
    classId,
    subjectId,
    topicId,
    classes: db.classes.map((c) => ({ id: c.id, name: c.name, count: (c.roster || []).length })),
    subjects: db.subjects,
    hierarchySummary: getHierarchySummary(),
    presentations:
      classId && subjectId && topicId
        ? getOrCreateBoard(classId, subjectId, topicId)
        : null,
    payload,
    timestamp: Date.now()
  });
  for (const res of sseClients) {
    try {
      res.write(`data: ${message}\n\n`);
    } catch (e) {
      sseClients.delete(res);
    }
  }
}

function getLanAddresses() {
  const interfaces = os.networkInterfaces();
  const results = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        results.push({
          name,
          address: iface.address,
          url: `http://${iface.address}:${PORT}`
        });
      }
    }
  }
  return results;
}

// Short code mapping for compact QR URLs (/u/:code)
const shortCodeToBoard = new Map();
const boardKeyToShortCode = new Map();
let nextShortCodeSeq = 1;
let activeSession = { classId: '204班', subjectId: '', topicId: '', shortCode: '' };

function getOrCreateShortCode(classId, subjectId, topicId) {
  if (!classId || !subjectId || !topicId) return '';
  const bKey = getBoardKey(classId, subjectId, topicId);
  if (boardKeyToShortCode.has(bKey)) {
    return boardKeyToShortCode.get(bKey);
  }
  const code = String(nextShortCodeSeq++);
  boardKeyToShortCode.set(bKey, code);
  shortCodeToBoard.set(code, { classId, subjectId, topicId });
  return code;
}

// Always-On Public Tunnel (localhost.run via SSH, no password page)
let tunnelProcess = null;
let tunnelUrl = null;
let tunnelStatus = 'stopped';
let tunnelError = null;
let tunnelManualStop = false;
let tunnelRetryTimer = null;

function startPublicTunnel() {
  if (tunnelProcess && (tunnelStatus === 'running' || tunnelStatus === 'starting')) return;
  tunnelManualStop = false;
  if (tunnelRetryTimer) {
    clearTimeout(tunnelRetryTimer);
    tunnelRetryTimer = null;
  }
  tunnelStatus = 'starting';
  tunnelError = null;
  tunnelUrl = null;
  broadcastUpdate('tunnel', null, null, null, { tunnelStatus, tunnelUrl, tunnelError });

  const cloudflaredPath = path.join(__dirname, 'bin', process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared');
  const useCloudflared = fs.existsSync(cloudflaredPath);

  const proc = useCloudflared
    ? spawn(cloudflaredPath, ['tunnel', '--no-autoupdate', '--url', `http://127.0.0.1:${PORT}`])
    : spawn('ssh', [
        '-o',
        'StrictHostKeyChecking=no',
        '-o',
        'ServerAliveInterval=20',
        '-o',
        'ExitOnForwardFailure=yes',
        '-R',
        `80:127.0.0.1:${PORT}`,
        'nokey@localhost.run'
      ]);
  tunnelProcess = proc;

  const handleOutput = (data) => {
    if (tunnelProcess !== proc) return;
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9.-]+\.(?:trycloudflare\.com|lhr\.life)/);
    if (match && tunnelUrl !== match[0]) {
      tunnelUrl = match[0];
      tunnelStatus = 'running';
      tunnelError = null;
      console.log(`  🌐 跨網路公開上傳網址已就緒: ${tunnelUrl}`);
      broadcastUpdate('tunnel', null, null, null, { tunnelStatus, tunnelUrl, tunnelError: null });
    }
  };

  proc.stdout.on('data', handleOutput);
  proc.stderr.on('data', handleOutput);

  proc.on('close', (code) => {
    if (tunnelProcess !== proc) return;
    tunnelProcess = null;
    if (!tunnelManualStop) {
      tunnelStatus = 'starting';
      tunnelUrl = null;
      broadcastUpdate('tunnel', null, null, null, {
        tunnelStatus,
        tunnelUrl,
        tunnelError: '正在重新連線跨網路通道...'
      });
      tunnelRetryTimer = setTimeout(() => startPublicTunnel(), 2000);
    } else {
      tunnelStatus = 'stopped';
      tunnelUrl = null;
      broadcastUpdate('tunnel', null, null, null, {
        tunnelStatus,
        tunnelUrl,
        tunnelError: code ? `通道已關閉 (代碼 ${code})` : null
      });
    }
  });
}

function stopPublicTunnel() {
  tunnelManualStop = true;
  if (tunnelRetryTimer) {
    clearTimeout(tunnelRetryTimer);
    tunnelRetryTimer = null;
  }
  const oldProc = tunnelProcess;
  tunnelProcess = null;
  tunnelStatus = 'stopped';
  tunnelUrl = null;
  if (oldProc && oldProc.pid) {
    try {
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${oldProc.pid} /T /F`);
      } else {
        oldProc.kill('SIGTERM');
      }
    } catch (e) {}
  }
  broadcastUpdate('tunnel', null, null, null, { tunnelStatus, tunnelUrl, tunnelError: null });
}

function restartPublicTunnel() {
  stopPublicTunnel();
  startPublicTunnel();
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString('utf8');
      if (body.length > 5 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache'
  });
  res.end(JSON.stringify(data));
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.ppsx': 'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
  '.odp': 'application/vnd.oasis.opendocument.presentation',
  '.key': 'application/x-iwork-keynote-sffkey',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

function openFileOnHost(filePath, slideShowMode = false) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(filePath).toLowerCase();
    const isPowerPoint = ['.pptx', '.ppt', '.ppsx'].includes(ext);

    if (process.platform === 'win32') {
      if (isPowerPoint && slideShowMode) {
        const psScript = `
          $file = '${filePath.replace(/'/g, "''")}';
          $pptExe = (Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\powerpnt.exe' -ErrorAction SilentlyContinue).'(default)';
          if (-not $pptExe) {
            $pptExe = (Get-ItemProperty 'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\powerpnt.exe' -ErrorAction SilentlyContinue).'(default)';
          }
          if ($pptExe -and (Test-Path $pptExe)) {
            Start-Process -FilePath $pptExe -ArgumentList '/s', "\`"$file\`"";
          } else {
            Start-Process -FilePath $file;
          }
        `;
        exec(
          `powershell -NoProfile -ExecutionPolicy Bypass -Command "${psScript.replace(/\r?\n/g, ' ')}"`,
          (err) => {
            if (err) {
              exec(`cmd /c start "" "${filePath}"`, (err2) => {
                if (err2) reject(err2);
                else resolve({ mode: 'default' });
              });
            } else {
              resolve({ mode: 'slideshow' });
            }
          }
        );
      } else {
        exec(`cmd /c start "" "${filePath}"`, (err) => {
          if (err) reject(err);
          else resolve({ mode: 'default' });
        });
      }
    } else if (process.platform === 'darwin') {
      exec(`open "${filePath}"`, (err) => (err ? reject(err) : resolve({ mode: 'default' })));
    } else {
      exec(`xdg-open "${filePath}"`, (err) => (err ? reject(err) : resolve({ mode: 'default' })));
    }
  });
}

function serveFile(req, res, filePath, forceDownload = false, downloadName = '') {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('找不到檔案 (404 Not Found)');
    return;
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const headers = {
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes'
  };

  if (['.html', '.js', '.css'].includes(ext)) {
    headers['Cache-Control'] = 'no-store, no-cache, must-revalidate';
  }

  if (forceDownload && downloadName) {
    headers['Content-Disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`;
  } else if (ext === '.pdf') {
    headers['Content-Disposition'] = 'inline';
  }

  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = end - start + 1;
    headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
    headers['Content-Length'] = chunksize;
    res.writeHead(206, headers);
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    headers['Content-Length'] = stat.size;
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  }
}

function findItemInBoards(itemId, classId, subjectId, topicId) {
  if (classId && subjectId && topicId) {
    const board = getOrCreateBoard(classId, subjectId, topicId);
    const idx = board.findIndex((p) => p.id === itemId);
    if (idx !== -1) return { board, idx, classId, subjectId, topicId };
  }
  for (const key of Object.keys(db.boards)) {
    const board = db.boards[key];
    const idx = board.findIndex((p) => p.id === itemId);
    if (idx !== -1) {
      const [cId, sId, tId] = key.split('__');
      return { board, idx, classId: cId, subjectId: sId, topicId: tId };
    }
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);
  const queryClassId = parsedUrl.searchParams.get('classId') || '';
  const querySubjectId = parsedUrl.searchParams.get('subjectId') || '';
  const queryTopicId = parsedUrl.searchParams.get('topicId') || '';

  // 1. SSE Endpoint
  if (req.method === 'GET' && pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(
      `data: ${JSON.stringify({
        type: 'init',
        classes: db.classes.map((c) => ({ id: c.id, name: c.name, count: (c.roster || []).length })),
        subjects: db.subjects,
        hierarchySummary: getHierarchySummary(),
        tunnel: { tunnelStatus, tunnelUrl, tunnelError }
      })}\n\n`
    );
    sseClients.add(res);
    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // Short QR redirect route (/u or /u/:code) -> redirects to standalone mobile upload website
  if (req.method === 'GET' && (pathname === '/u' || pathname.startsWith('/u/'))) {
    const code = pathname.replace(/^\/u\/?/, '').trim();
    const target = (code && shortCodeToBoard.get(code)) || activeSession;
    if (target && target.classId && target.subjectId && target.topicId) {
      const q = new URLSearchParams({
        classId: target.classId,
        subjectId: target.subjectId,
        topicId: target.topicId
      });
      res.writeHead(302, {
        Location: `/mobile.html?${q.toString()}`,
        'Cache-Control': 'no-store'
      });
      res.end();
      return;
    }
    res.writeHead(302, {
      Location: '/mobile.html',
      'Cache-Control': 'no-store'
    });
    res.end();
    return;
  }

  // 2. Server Info + Classes, Subjects, Topics Summary
  if (req.method === 'GET' && pathname === '/api/info') {
    const remoteIp = req.socket.remoteAddress || '';
    const hostHeader = (req.headers.host || '').toLowerCase();
    const isTunnelRequest =
      hostHeader.includes('.trycloudflare.com') ||
      hostHeader.includes('.lhr.life') ||
      hostHeader.includes('.loca.lt') ||
      Boolean(req.headers['x-forwarded-for']);
    const isLocalHost =
      !isTunnelRequest &&
      (remoteIp === '127.0.0.1' || remoteIp === '::1' || remoteIp === '::ffff:127.0.0.1');

    sendJson(res, 200, {
      port: PORT,
      lanAddresses: getLanAddresses(),
      isLocalHost,
      isCloudHosted: IS_CLOUD_RUN,
      supabasePublicBase: USE_SUPABASE
        ? `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}`
        : '',
      classes: db.classes.map((c) => ({ id: c.id, name: c.name, count: (c.roster || []).length })),
      subjects: db.subjects,
      hierarchySummary: getHierarchySummary(),
      activeSession,
      tunnel: { tunnelStatus, tunnelUrl, tunnelError }
    });
    return;
  }

  // 3. Get presentations for (classId, subjectId, topicId)
  if (req.method === 'GET' && pathname === '/api/presentations') {
    const cId = queryClassId || (db.classes[0] && db.classes[0].id) || '204班';
    const sId = querySubjectId || (db.subjects[0] && db.subjects[0].id) || '國文';
    const topics = getOrCreateTopics(cId, sId);
    const tId = queryTopicId || (topics[0] && topics[0].id) || '';
    const presentations = tId ? getOrCreateBoard(cId, sId, tId) : [];
    const shortCode = tId ? getOrCreateShortCode(cId, sId, tId) : '';
    if (tId) {
      activeSession = { classId: cId, subjectId: sId, topicId: tId, shortCode };
    }
    sendJson(res, 200, {
      classId: cId,
      subjectId: sId,
      topicId: tId,
      shortCode,
      presentations,
      hierarchySummary: getHierarchySummary()
    });
    return;
  }

  // 4. Add or Delete Class (/api/classes)
  if (pathname === '/api/classes' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const className = String(body.name || '').trim();
      if (!className) {
        sendJson(res, 400, { error: '請輸入班級名稱' });
        return;
      }
      if (db.classes.some((c) => c.id === className)) {
        sendJson(res, 400, { error: '該班級已經存在' });
        return;
      }
      const roster =
        Array.isArray(body.roster) && body.roster.length > 0
          ? body.roster
          : CLASS_204_ROSTER;
      const newClass = {
        id: className,
        name: className,
        roster
      };
      db.classes.push(newClass);
      saveDB(db);
      broadcastUpdate('classes_updated');
      sendJson(res, 201, { ok: true, classItem: newClass });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  if (pathname === '/api/classes' && req.method === 'PUT') {
    try {
      const body = await parseJsonBody(req);
      const oldId = String(body.oldId || '').trim();
      const newName = String(body.newName || '').trim();
      if (!oldId || !newName) {
        sendJson(res, 400, { error: '請輸入新的班級名稱' });
        return;
      }
      if (oldId === newName) {
        sendJson(res, 200, { ok: true, newId: newName });
        return;
      }
      if (db.classes.some((c) => c.id === newName)) {
        sendJson(res, 400, { error: '該班級名稱已經存在' });
        return;
      }
      const cls = db.classes.find((c) => c.id === oldId);
      if (!cls) {
        sendJson(res, 404, { error: '找不到原班級' });
        return;
      }
      cls.id = newName;
      cls.name = newName;

      // Migrate topics keys: `${oldId}__${subjectId}` -> `${newName}__${subjectId}`
      for (const key of Object.keys(db.topics)) {
        if (key.startsWith(`${oldId}__`)) {
          const rest = key.slice(`${oldId}__`.length);
          db.topics[`${newName}__${rest}`] = db.topics[key];
          delete db.topics[key];
        }
      }

      // Migrate boards keys: `${oldId}__${subjectId}__${topicId}` -> `${newName}__${subjectId}__${topicId}`
      for (const key of Object.keys(db.boards)) {
        if (key.startsWith(`${oldId}__`)) {
          const rest = key.slice(`${oldId}__`.length);
          db.boards[`${newName}__${rest}`] = db.boards[key];
          delete db.boards[key];
        }
      }

      saveDB(db);
      broadcastUpdate('classes_updated');
      sendJson(res, 200, { ok: true, newId: newName });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  if (pathname.startsWith('/api/classes/') && req.method === 'DELETE') {
    const classId = pathname.replace('/api/classes/', '');
    if (db.classes.length <= 1) {
      sendJson(res, 400, { error: '至少需保留一個班級' });
      return;
    }
    db.classes = db.classes.filter((c) => c.id !== classId);
    for (const key of Object.keys(db.topics)) {
      if (key.startsWith(`${classId}__`)) delete db.topics[key];
    }
    for (const key of Object.keys(db.boards)) {
      if (key.startsWith(`${classId}__`)) {
        db.boards[key].forEach((p) => deleteStoredFileIfExist(p.storedFileName));
        delete db.boards[key];
      }
    }
    saveDB(db);
    broadcastUpdate('classes_updated');
    sendJson(res, 200, { ok: true });
    return;
  }

  // 5. Add or Delete Subject (/api/subjects)
  if (pathname === '/api/subjects' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const subName = String(body.name || '').trim();
      const subIcon = String(body.icon || '📘').trim();
      if (!subName) {
        sendJson(res, 400, { error: '請輸入科目名稱' });
        return;
      }
      if (db.subjects.some((s) => s.id === subName)) {
        sendJson(res, 400, { error: '該科目已經存在' });
        return;
      }
      const newSub = {
        id: subName,
        name: subName,
        icon: subIcon,
        isDefault: false
      };
      db.subjects.push(newSub);
      saveDB(db);
      broadcastUpdate('subjects_updated');
      sendJson(res, 201, { ok: true, subject: newSub });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  if (pathname === '/api/subjects' && req.method === 'PUT') {
    try {
      const body = await parseJsonBody(req);
      const oldId = String(body.oldId || '').trim();
      const newName = String(body.newName || '').trim();
      if (!oldId || !newName) {
        sendJson(res, 400, { error: '請輸入新的科目名稱' });
        return;
      }
      if (oldId === newName) {
        sendJson(res, 200, { ok: true, newId: newName });
        return;
      }
      if (db.subjects.some((s) => s.id === newName)) {
        sendJson(res, 400, { error: '該科目名稱已經存在' });
        return;
      }
      const sub = db.subjects.find((s) => s.id === oldId);
      if (!sub) {
        sendJson(res, 404, { error: '找不到原科目' });
        return;
      }
      sub.id = newName;
      sub.name = newName;

      // Migrate topics keys: `${classId}__${oldId}` -> `${classId}__${newName}`
      for (const key of Object.keys(db.topics)) {
        const parts = key.split('__');
        if (parts[1] === oldId) {
          const newKey = `${parts[0]}__${newName}`;
          db.topics[newKey] = db.topics[key];
          delete db.topics[key];
        }
      }

      // Migrate boards keys: `${classId}__${oldId}__${topicId}` -> `${classId}__${newName}__${topicId}`
      for (const key of Object.keys(db.boards)) {
        const parts = key.split('__');
        if (parts[1] === oldId) {
          const newKey = `${parts[0]}__${newName}__${parts.slice(2).join('__')}`;
          db.boards[newKey] = db.boards[key];
          delete db.boards[key];
        }
      }

      saveDB(db);
      broadcastUpdate('subjects_updated');
      sendJson(res, 200, { ok: true, newId: newName });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  if (pathname.startsWith('/api/subjects/') && req.method === 'DELETE') {
    const subId = pathname.replace('/api/subjects/', '');
    db.subjects = db.subjects.filter((s) => s.id !== subId);
    for (const key of Object.keys(db.topics)) {
      if (key.endsWith(`__${subId}`)) delete db.topics[key];
    }
    for (const key of Object.keys(db.boards)) {
      const parts = key.split('__');
      if (parts[1] === subId) {
        db.boards[key].forEach((p) => deleteStoredFileIfExist(p.storedFileName));
        delete db.boards[key];
      }
    }
    saveDB(db);
    broadcastUpdate('subjects_updated');
    sendJson(res, 200, { ok: true });
    return;
  }

  // 6. Add or Delete Report Topic under a Class & Subject (/api/topics)
  if (pathname === '/api/topics' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const classId = String(body.classId || '').trim();
      const subjectId = String(body.subjectId || '').trim();
      const topicName = String(body.name || '').trim();

      if (!classId || !subjectId || !topicName) {
        sendJson(res, 400, { error: '請輸入報告名稱' });
        return;
      }

      const topics = getOrCreateTopics(classId, subjectId);
      if (topics.some((t) => t.id === topicName)) {
        sendJson(res, 400, { error: '該科目下已有相同名稱的報告項目' });
        return;
      }

      const newTopic = {
        id: topicName,
        name: topicName,
        createdAt: Date.now()
      };
      topics.push(newTopic);
      // Pre-create board for this topic
      getOrCreateBoard(classId, subjectId, newTopic.id);
      saveDB(db);
      broadcastUpdate('topics_updated', classId, subjectId, newTopic.id);
      sendJson(res, 201, { ok: true, topic: newTopic });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  if (pathname === '/api/topics' && req.method === 'PUT') {
    try {
      const body = await parseJsonBody(req);
      const classId = String(body.classId || '').trim();
      const subjectId = String(body.subjectId || '').trim();
      const oldId = String(body.oldId || '').trim();
      const newName = String(body.newName || '').trim();

      if (!classId || !subjectId || !oldId || !newName) {
        sendJson(res, 400, { error: '請輸入新的報告名稱' });
        return;
      }
      if (oldId === newName) {
        sendJson(res, 200, { ok: true, newId: newName });
        return;
      }

      const topics = getOrCreateTopics(classId, subjectId);
      if (topics.some((t) => t.id === newName)) {
        sendJson(res, 400, { error: '該科目下已有相同名稱的報告項目' });
        return;
      }

      const topicObj = topics.find((t) => t.id === oldId);
      if (!topicObj) {
        sendJson(res, 404, { error: '找不到原報告項目' });
        return;
      }

      topicObj.id = newName;
      topicObj.name = newName;

      // Migrate board key
      const oldBKey = getBoardKey(classId, subjectId, oldId);
      const newBKey = getBoardKey(classId, subjectId, newName);
      if (db.boards[oldBKey]) {
        db.boards[newBKey] = db.boards[oldBKey];
        delete db.boards[oldBKey];
      }

      saveDB(db);
      broadcastUpdate('topics_updated', classId, subjectId, newName);
      sendJson(res, 200, { ok: true, newId: newName });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  if (pathname === '/api/topics' && req.method === 'DELETE') {
    const classId = queryClassId;
    const subjectId = querySubjectId;
    const topicId = queryTopicId;
    const topics = getOrCreateTopics(classId, subjectId);
    const tKey = getTopicKey(classId, subjectId);
    db.topics[tKey] = topics.filter((t) => t.id !== topicId);
    const bKey = getBoardKey(classId, subjectId, topicId);
    if (db.boards[bKey]) {
      db.boards[bKey].forEach((p) => deleteStoredFileIfExist(p.storedFileName));
      delete db.boards[bKey];
    }
    saveDB(db);
    broadcastUpdate('topics_updated', classId, subjectId);
    sendJson(res, 200, { ok: true });
    return;
  }

  // 7. Import / Update Class Roster (/api/roster/import)
  if (req.method === 'POST' && pathname === '/api/roster/import') {
    try {
      const body = await parseJsonBody(req);
      const classId = body.classId || queryClassId || (db.classes[0] && db.classes[0].id);
      const subjectId = body.subjectId || querySubjectId || (db.subjects[0] && db.subjects[0].id);
      const topicId = body.topicId || queryTopicId || '第一次報告';
      const entries = Array.isArray(body.entries) ? body.entries : [];
      const mode = body.mode || 'smart_sync';

      if (entries.length === 0) {
        sendJson(res, 400, { error: '名單不可為空' });
        return;
      }

      let cls = db.classes.find((c) => c.id === classId);
      if (!cls) {
        cls = { id: classId, name: classId, roster: [] };
        db.classes.push(cls);
      }

      if (mode === 'append') {
        cls.roster = [...(cls.roster || []), ...entries];
      } else {
        cls.roster = entries.map((e) => ({
          groupOrSeat: String(e.groupOrSeat || '').trim(),
          presenterName: String(e.presenterName || '').trim()
        }));
      }

      getOrCreateBoard(classId, subjectId, topicId);
      syncRosterAcrossClassBoards(
        classId,
        cls.roster,
        mode === 'replace' ? 'replace' : 'smart_sync'
      );

      saveDB(db);
      broadcastUpdate('roster_updated', classId, subjectId, topicId);
      sendJson(res, 200, {
        ok: true,
        presentations: getOrCreateBoard(classId, subjectId, topicId)
      });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // 7b. Preview & Import Public Google Drive Folder
  if (req.method === 'POST' && pathname === '/api/gdrive-preview') {
    try {
      const body = await parseJsonBody(req);
      const rawUrl = String(body.folderUrl || '').trim();
      const classId = body.classId || queryClassId || (db.classes[0] && db.classes[0].id);
      const subjectId = body.subjectId || querySubjectId || (db.subjects[0] && db.subjects[0].id);
      const topicId = body.topicId || queryTopicId || '';

      const folderMatch =
        rawUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/) ||
        rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
        rawUrl.match(/^([a-zA-Z0-9_-]{15,})$/);
      if (!folderMatch) {
        sendJson(res, 400, {
          error: '請貼上正確的 Google 雲端硬碟資料夾網址（例如 https://drive.google.com/drive/folders/...）'
        });
        return;
      }

      const folderId = folderMatch[1];
      const embedRes = await fetch(
        `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#list`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
          }
        }
      );

      if (!embedRes.ok || embedRes.url.includes('accounts.google.com')) {
        sendJson(res, 400, {
          error:
            '無法讀取該資料夾！請確認資料夾共用權限已設為「知道連結的任何人皆可檢視」。'
        });
        return;
      }

      const html = await embedRes.text();
      if (html.includes('accounts.google.com/ServiceLogin') || html.includes('Sign in')) {
        sendJson(res, 400, {
          error:
            '此資料夾目前需要登入才能存取，請在 Google 雲端硬碟將資料夾設為「知道連結的任何人皆可檢視」。'
        });
        return;
      }

      const decodeHtml = (s) =>
        String(s || '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

      const files = [];
      const entryRegex =
        /<div[^>]*class="flip-entry"[^>]*id="entry-([^"]+)"[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<div[^>]*class="flip-entry-title"[^>]*>([\s\S]*?)<\/div>/g;
      let match;
      while ((match = entryRegex.exec(html)) !== null) {
        const fileId = match[1].trim();
        const rawHref = decodeHtml(match[2].trim());
        const fileName = decodeHtml(match[3].replace(/<[^>]+>/g, '').trim());
        if (!fileId || !fileName) continue;

        const lowerName = fileName.toLowerCase();
        let type = 'link';
        let url = rawHref;
        if (rawHref.includes('docs.google.com/presentation/')) {
          type = 'gslides';
          url = `https://docs.google.com/presentation/d/${fileId}/present`;
        } else if (lowerName.endsWith('.pdf')) {
          type = 'pdf';
          url = `https://drive.google.com/file/d/${fileId}/preview`;
        } else if (
          lowerName.endsWith('.pptx') ||
          lowerName.endsWith('.ppt') ||
          lowerName.endsWith('.ppsx')
        ) {
          type = 'pptx';
          url = `https://drive.google.com/file/d/${fileId}/preview`;
        } else if (rawHref.includes('drive.google.com/file/d/')) {
          type = 'link';
          url = `https://drive.google.com/file/d/${fileId}/preview`;
        }

        files.push({ fileId, fileName, type, url });
      }

      if (files.length === 0) {
        sendJson(res, 400, {
          error:
            '資料夾內沒有找到檔案（或資料夾權限尚未設為「知道連結的任何人皆可檢視」）。'
        });
        return;
      }

      const board = getOrCreateBoard(classId, subjectId, topicId);
      const sortedRosterByNameLen = [...board].sort(
        (a, b) => (b.presenterName || '').length - (a.presenterName || '').length
      );
      const usedStudentIds = new Set();

      const previewItems = files.map((f) => {
        let matchedStudent = null;
        // 1. Match by full name inside filename
        for (const s of sortedRosterByNameLen) {
          if (
            s.presenterName &&
            s.presenterName !== '未具名' &&
            f.fileName.includes(s.presenterName)
          ) {
            matchedStudent = s;
            break;
          }
        }
        // 2. Fallback: match by seat number (e.g. 01, 1號, 01_, 1-)
        if (!matchedStudent) {
          const numMatches = f.fileName.match(/(?:^|[^\d])(\d{1,2})(?=[^\d]|$)/g) || [];
          for (const token of numMatches) {
            const num = parseInt(token.replace(/[^\d]/g, ''), 10);
            if (!Number.isNaN(num)) {
              const foundBySeat = board.find(
                (s) =>
                  s.groupOrSeat &&
                  parseInt(String(s.groupOrSeat).replace(/[^\d]/g, ''), 10) === num &&
                  !usedStudentIds.has(s.id)
              );
              if (foundBySeat) {
                matchedStudent = foundBySeat;
                break;
              }
            }
          }
        }

        if (matchedStudent) usedStudentIds.add(matchedStudent.id);
        return {
          ...f,
          matchedStudentId: matchedStudent ? matchedStudent.id : ''
        };
      });

      sendJson(res, 200, { ok: true, folderId, items: previewItems });
    } catch (err) {
      sendJson(res, 400, { error: `讀取資料夾失敗: ${err.message}` });
    }
    return;
  }

  if (req.method === 'POST' && pathname === '/api/gdrive-import') {
    try {
      const body = await parseJsonBody(req);
      const classId = body.classId || queryClassId || (db.classes[0] && db.classes[0].id);
      const subjectId = body.subjectId || querySubjectId || (db.subjects[0] && db.subjects[0].id);
      const topicId = body.topicId || queryTopicId || '';
      const mappings = Array.isArray(body.mappings) ? body.mappings : [];
      const board = getOrCreateBoard(classId, subjectId, topicId);

      let importedCount = 0;
      for (const m of mappings) {
        if (!m.studentId || !m.url) continue;
        const item = board.find((p) => p.id === m.studentId);
        if (!item) continue;

        deleteStoredFileIfExist(item.storedFileName);
        item.fileUrl = '';
        item.storedFileName = '';
        item.originalFileName = '';
        item.fileSize = 0;
        item.url = m.url;
        item.type = m.type || 'link';
        item.title = (m.fileName || '').replace(/\.[^/.]+$/, '');
        item.openMode = 'embed';
        item.hasSubmitted = true;
        if (item.status === 'unsubmitted') {
          item.status = 'pending';
        }
        item.updatedAt = Date.now();
        importedCount++;
      }

      saveDB(db);
      broadcastUpdate('roster_updated', classId, subjectId, topicId);
      sendJson(res, 200, {
        ok: true,
        importedCount,
        presentations: board
      });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // 8. File Upload
  if (req.method === 'POST' && pathname === '/api/upload') {
    try {
      const rawFileName = req.headers['x-file-name']
        ? decodeURIComponent(req.headers['x-file-name'])
        : 'presentation.bin';
      const safeExt = path.extname(rawFileName).toLowerCase().replace(/[^a-z0-9.]/g, '');
      const uniqueId = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const storedFileName = `${uniqueId}${safeExt}`;
      const destPath = path.join(UPLOADS_DIR, storedFileName);

      const writeStream = fs.createWriteStream(destPath);
      let fileSize = 0;

      req.on('data', (chunk) => {
        fileSize += chunk.length;
      });

      req.pipe(writeStream);

      writeStream.on('finish', async () => {
        if (USE_SUPABASE) {
          try {
            const fileBuf = fs.readFileSync(destPath);
            const contentType = MIME_TYPES[safeExt] || 'application/octet-stream';
            const upRes = await fetch(
              `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${encodeURIComponent(
                storedFileName
              )}`,
              {
                method: 'POST',
                headers: {
                  apikey: SUPABASE_KEY,
                  Authorization: `Bearer ${SUPABASE_KEY}`,
                  'Content-Type': contentType,
                  'x-upsert': 'true'
                },
                body: fileBuf
              }
            );
            if (!upRes.ok) {
              const errTxt = await upRes.text().catch(() => '');
              throw new Error(`Supabase Storage 上傳失敗 (${upRes.status}): ${errTxt}`);
            }
          } catch (cloudErr) {
            console.error('Supabase file upload error:', cloudErr);
            sendJson(res, 500, { error: '雲端檔案儲存失敗，請檢查 Supabase Storage 設定' });
            return;
          }
        }
        sendJson(res, 200, {
          ok: true,
          fileUrl: `/uploads/${storedFileName}`,
          storedFileName,
          originalFileName: rawFileName,
          fileSize
        });
      });

      writeStream.on('error', (err) => {
        console.error('Upload error:', err);
        sendJson(res, 500, { error: '檔案寫入失敗' });
      });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return;
  }

  // 9. Create a new presentation or student slot in a board
  if (req.method === 'POST' && pathname === '/api/presentations') {
    try {
      const body = await parseJsonBody(req);
      const classId = body.classId || queryClassId || (db.classes[0] && db.classes[0].id);
      const subjectId = body.subjectId || querySubjectId || (db.subjects[0] && db.subjects[0].id);
      const topicId = body.topicId || queryTopicId || '第一次報告';
      const board = getOrCreateBoard(classId, subjectId, topicId);

      const maxOrder = board.reduce((max, p) => Math.max(max, p.order || 0), 0);
      const hasSubmitted = Boolean(
        (body.fileUrl && body.fileUrl.trim()) || (body.url && body.url.trim())
      );

      const newItem = normalizeItem(
        {
          id: makeId(),
          groupOrSeat: body.groupOrSeat,
          presenterName: body.presenterName,
          title: body.title,
          type: body.type,
          url: body.url,
          fileUrl: body.fileUrl,
          storedFileName: body.storedFileName,
          originalFileName: body.originalFileName,
          fileSize: body.fileSize,
          openMode: body.openMode || 'auto',
          note: body.note,
          status: hasSubmitted ? 'pending' : 'unsubmitted',
          order: maxOrder + 1,
          createdAt: Date.now(),
          updatedAt: hasSubmitted ? Date.now() : null
        },
        maxOrder
      );

      board.push(newItem);
      saveDB(db);
      broadcastUpdate('added', classId, subjectId, topicId, newItem);
      sendJson(res, 201, { ok: true, item: newItem });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // 10. Bulk Reorder / Shuffle for a board
  if (req.method === 'PUT' && pathname === '/api/presentations/reorder') {
    try {
      const body = await parseJsonBody(req);
      const classId = body.classId || queryClassId || (db.classes[0] && db.classes[0].id);
      const subjectId = body.subjectId || querySubjectId || (db.subjects[0] && db.subjects[0].id);
      const topicId = body.topicId || queryTopicId || '第一次報告';
      const board = getOrCreateBoard(classId, subjectId, topicId);

      if (Array.isArray(body.orderedIds)) {
        const orderMap = new Map();
        body.orderedIds.forEach((id, idx) => orderMap.set(id, idx + 1));
        board.forEach((p) => {
          if (orderMap.has(p.id)) {
            p.order = orderMap.get(p.id);
          }
        });
        board.sort((a, b) => (a.order || 0) - (b.order || 0));
        saveDB(db);
        broadcastUpdate('reordered', classId, subjectId, topicId, {
          isLottery: !!body.isLottery
        });
      }
      sendJson(res, 200, { ok: true, presentations: board });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // 11. Batch Reset / Clear Operations for a board
  if (req.method === 'POST' && pathname === '/api/presentations/clear') {
    try {
      const body = await parseJsonBody(req);
      const classId = body.classId || queryClassId || (db.classes[0] && db.classes[0].id);
      const subjectId = body.subjectId || querySubjectId || (db.subjects[0] && db.subjects[0].id);
      const topicId = body.topicId || queryTopicId || '第一次報告';
      const board = getOrCreateBoard(classId, subjectId, topicId);
      const mode = body.mode || 'new_round';

      if (mode === 'reset_status') {
        board.forEach((p) => {
          p.status = p.hasSubmitted ? 'pending' : 'unsubmitted';
        });
      } else if (mode === 'new_round') {
        board.forEach((p) => {
          deleteStoredFileIfExist(p.storedFileName);
          p.title = '';
          p.type = 'none';
          p.url = '';
          p.fileUrl = '';
          p.storedFileName = '';
          p.originalFileName = '';
          p.fileSize = 0;
          p.note = '';
          p.hasSubmitted = false;
          p.status = 'unsubmitted';
          p.updatedAt = null;
        });
      }

      saveDB(db);
      broadcastUpdate('cleared', classId, subjectId, topicId, { mode });
      sendJson(res, 200, { ok: true, presentations: board });
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
    return;
  }

  // 12. Update or Delete single presentation / student slot
  if (pathname.startsWith('/api/presentations/')) {
    const id = pathname.replace('/api/presentations/', '');
    const found = findItemInBoards(id, queryClassId, querySubjectId, queryTopicId);
    if (!found) {
      sendJson(res, 404, { error: '找不到該筆學生/組別資料' });
      return;
    }
    const { board, idx, classId, subjectId, topicId } = found;

    if (req.method === 'PUT' || req.method === 'PATCH') {
      try {
        const body = await parseJsonBody(req);
        const item = board[idx];

        if (
          body.storedFileName !== undefined &&
          item.storedFileName &&
          body.storedFileName !== item.storedFileName
        ) {
          deleteStoredFileIfExist(item.storedFileName);
        }

        if (body.clearSubmission) {
          deleteStoredFileIfExist(item.storedFileName);
          item.title = '';
          item.type = 'none';
          item.url = '';
          item.fileUrl = '';
          item.storedFileName = '';
          item.originalFileName = '';
          item.fileSize = 0;
          item.note = '';
          item.hasSubmitted = false;
          item.status = 'unsubmitted';
          item.updatedAt = null;
          saveDB(db);
          broadcastUpdate('updated', classId, subjectId, topicId, item);
          sendJson(res, 200, { ok: true, item });
          return;
        }

        if (body.status === 'presenting' && body.autoCompletePrevious) {
          board.forEach((p) => {
            if (p.id !== id && p.status === 'presenting') {
              p.status = 'done';
            }
          });
        }

        const editableFields = [
          'groupOrSeat',
          'presenterName',
          'title',
          'type',
          'url',
          'fileUrl',
          'storedFileName',
          'originalFileName',
          'fileSize',
          'openMode',
          'note',
          'status',
          'order'
        ];
        const wasSubmitted = item.hasSubmitted;

        editableFields.forEach((field) => {
          if (body[field] !== undefined) {
            item[field] = body[field];
          }
        });

        item.hasSubmitted = Boolean(
          (item.fileUrl && item.fileUrl.trim()) || (item.url && item.url.trim())
        );

        if (!item.hasSubmitted) {
          item.status = 'unsubmitted';
          item.type = 'none';
        } else {
          if (item.status === 'unsubmitted') {
            item.status = 'pending';
          }
          if (!wasSubmitted || body.fileUrl || body.url) {
            item.updatedAt = Date.now();
          }
        }

        saveDB(db);
        broadcastUpdate(
          !wasSubmitted && item.hasSubmitted ? 'submitted' : 'updated',
          classId,
          subjectId,
          topicId,
          item
        );
        sendJson(res, 200, { ok: true, item });
      } catch (err) {
        sendJson(res, 400, { error: err.message });
      }
      return;
    }

    if (req.method === 'DELETE') {
      const removed = board.splice(idx, 1)[0];
      if (removed && removed.storedFileName) {
        deleteStoredFileIfExist(removed.storedFileName);
      }
      saveDB(db);
      broadcastUpdate('deleted', classId, subjectId, topicId, { id });
      sendJson(res, 200, { ok: true });
      return;
    }
  }

  // 13. Open local file on classroom host PC
  if (req.method === 'POST' && pathname.startsWith('/api/open-local/')) {
    const id = pathname.replace('/api/open-local/', '');
    const found = findItemInBoards(id, queryClassId, querySubjectId, queryTopicId);
    if (!found || !found.board[found.idx].storedFileName) {
      sendJson(res, 404, { error: '找不到對應的本機簡報檔案' });
      return;
    }
    const { board, idx, classId, subjectId, topicId } = found;
    const item = board[idx];

    try {
      const body = await parseJsonBody(req);
      const slideShowMode =
        body.slideShowMode !== undefined
          ? !!body.slideShowMode
          : item.openMode !== 'powerpoint_normal';

      const filePath = path.join(UPLOADS_DIR, path.basename(item.storedFileName));
      if (!fs.existsSync(filePath)) {
        sendJson(res, 404, { error: '檔案不存在於伺服器 uploads 資料夾中' });
        return;
      }

      board.forEach((p) => {
        if (p.id !== id && p.status === 'presenting') {
          p.status = 'done';
        }
      });
      item.status = 'presenting';
      saveDB(db);
      broadcastUpdate('updated', classId, subjectId, topicId, item);

      const result = await openFileOnHost(filePath, slideShowMode);
      sendJson(res, 200, { ok: true, mode: result.mode, item });
    } catch (err) {
      sendJson(res, 500, { error: `無法在電腦上開啟檔案: ${err.message}` });
    }
    return;
  }

  // 14. Toggle Public Tunnel
  if (req.method === 'POST' && pathname === '/api/tunnel') {
    try {
      const body = await parseJsonBody(req);
      if (body.action === 'restart') {
        restartPublicTunnel();
      } else if (body.action === 'start') {
        startPublicTunnel();
      } else if (body.action === 'stop') {
        stopPublicTunnel();
      }
      sendJson(res, 200, { ok: true, tunnelStatus, tunnelUrl, tunnelError });
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
    return;
  }

  // 15. Serve uploaded files
  if (req.method === 'GET' && pathname.startsWith('/uploads/')) {
    const fileName = path.basename(pathname.replace('/uploads/', ''));
    const filePath = path.join(UPLOADS_DIR, fileName);
    const forceDownload = parsedUrl.searchParams.get('download') === '1';
    let downloadName = fileName;
    for (const key of Object.keys(db.boards)) {
      const found = db.boards[key].find((p) => p.storedFileName === fileName);
      if (found && found.originalFileName) {
        downloadName = found.originalFileName;
        break;
      }
    }
    if (!fs.existsSync(filePath) && USE_SUPABASE) {
      const dlParam = forceDownload ? `?download=${encodeURIComponent(downloadName)}` : '';
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${encodeURIComponent(
        fileName
      )}${dlParam}`;
      res.writeHead(302, {
        Location: publicUrl,
        'Cache-Control': forceDownload ? 'no-cache' : 'public, max-age=3600'
      });
      res.end();
      return;
    }
    serveFile(req, res, filePath, forceDownload, downloadName);
    return;
  }

  // 16. Serve static frontend files
  let staticPath = pathname === '/' ? '/index.html' : pathname;
  const fullStaticPath = path.join(
    PUBLIC_DIR,
    path.normalize(staticPath).replace(/^(\.\.[\/\\])+/, '')
  );
  if (
    fullStaticPath.startsWith(PUBLIC_DIR) &&
    fs.existsSync(fullStaticPath) &&
    !fs.statSync(fullStaticPath).isDirectory()
  ) {
    serveFile(req, res, fullStaticPath);
    return;
  }

  serveFile(req, res, path.join(PUBLIC_DIR, 'index.html'));
});

server.listen(PORT, '0.0.0.0', async () => {
  const lanList = getLanAddresses();
  console.log('====================================================');
  console.log('  🎓 班級報告彙整系統已啟動！');
  console.log(`  📌 本機開啟 (講台電腦): http://localhost:${PORT}`);
  if (lanList.length > 0) {
    lanList.forEach((net) => {
      console.log(`  📱 同學連線網址 (${net.name}): ${net.url}`);
    });
  } else {
    console.log('  ⚠️ 未偵測到區域網路 IP，請確認網路連線或開啟跨網路通道');
  }
  console.log('====================================================');
  if (USE_SUPABASE) {
    await initSupabase();
  }
  if (!IS_CLOUD_RUN) {
    // Automatically start the cross-network public upload tunnel on local host
    startPublicTunnel();
  }
});
