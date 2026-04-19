const { execFile } = require('child_process');
const path = require('path');

let cachedIcons = [];
let lastScanTime = 0;
const SCAN_INTERVAL = 30000;

function scanDesktopIcons() {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, 'get-desktop-icons.ps1');
    execFile('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-File', scriptPath,
    ], { timeout: 10000 }, (err, stdout) => {
      if (err) {
        resolve(cachedIcons);
        return;
      }
      try {
        const icons = JSON.parse(stdout.trim());
        cachedIcons = icons.map((icon) => ({
          ...icon,
          category: categorizeIcon(icon.name),
        }));
        lastScanTime = Date.now();
        resolve(cachedIcons);
      } catch {
        resolve(cachedIcons);
      }
    });
  });
}

function categorizeIcon(name) {
  const lower = name.toLowerCase();

  const browsers = ['chrome', 'edge', 'firefox', 'brave', 'opera', 'whale', '웨일', 'arc'];
  if (browsers.some((b) => lower.includes(b))) return 'browser';

  const games = ['steam', 'epic', 'riot', 'league', 'overwatch', 'minecraft', 'roblox', 'battle.net', 'genshin', '원신', 'maplestory', '메이플', 'valorant', '발로란트', 'game', '게임'];
  if (games.some((g) => lower.includes(g))) return 'game';

  const work = ['word', 'excel', 'powerpoint', 'outlook', 'teams', 'slack', 'notion', 'obsidian', 'onenote', 'hancom', '한글', 'hwp'];
  if (work.some((w) => lower.includes(w))) return 'work';

  const code = ['visual studio', 'vscode', 'code', 'intellij', 'pycharm', 'webstorm', 'cursor', 'terminal', 'git', 'postman'];
  if (code.some((c) => lower.includes(c))) return 'code';

  const media = ['spotify', 'youtube', 'vlc', 'music', '음악', 'melon', '멜론', 'flo', 'genie', '지니', 'netflix', 'twitch', 'obs'];
  if (media.some((m) => lower.includes(m))) return 'media';

  const sns = ['kakaotalk', '카카오톡', 'discord', 'telegram', 'line', 'instagram', 'twitter', 'x', 'threads', 'facebook', 'messenger'];
  if (sns.some((s) => lower.includes(s))) return 'sns';

  const creative = ['photoshop', 'illustrator', 'figma', 'canva', 'premiere', 'blender', 'clip studio', 'paint'];
  if (creative.some((c) => lower.includes(c))) return 'creative';

  const files = ['문서', '사진', '다운로드', 'documents', 'pictures', 'downloads', 'desktop', 'videos', '동영상'];
  if (files.some((f) => lower.includes(f))) return 'folder';

  if (lower.endsWith('.txt') || lower.endsWith('.pdf') || lower.endsWith('.docx')) return 'document';
  if (lower.endsWith('.jpg') || lower.endsWith('.png') || lower.endsWith('.psd')) return 'image';

  return 'other';
}

async function getIcons() {
  const now = Date.now();
  if (now - lastScanTime < SCAN_INTERVAL && cachedIcons.length > 0) {
    return cachedIcons;
  }
  return scanDesktopIcons();
}

module.exports = { getIcons, scanDesktopIcons };
