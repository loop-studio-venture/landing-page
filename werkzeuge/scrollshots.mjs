// Screenshots an echten Scroll-Positionen ueber das Chrome-DevTools-Protokoll.
// Der --screenshot-Weg von Headless-Chrome malt sticky/fixed nach scrollTo falsch,
// dieser Weg nicht. Aufruf:
//   node werkzeuge/scrollshots.mjs <url> <ausgabeordner> [breite] [hoehe] pos1 pos2 ...
// pos = Zahl (px) | "sel:#id:0.5" (Element-Top + 0.5 Viewporthoehen) | "ende" | "max" | "wait:3000" (nur warten, dann Bild)
import fs from 'node:fs';
import { spawn } from 'node:child_process';
const [url, out, W = '1440', H = '900', ...posn] = process.argv.slice(2);
const port = 9333, CH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome = spawn(CH, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, '--user-data-dir=/tmp/cdp-profil', 'about:blank'], { stdio: 'ignore' });
const wait = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 40; i++) { try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch { await wait(250); } }
const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id = 0; const pend = {};
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m.result || m.error); delete pend[m.id]; } };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
await new Promise(r => ws.onopen = r);
await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled', { cacheDisabled: true });
const fehler=[]; ws.addEventListener('message',e=>{const m=JSON.parse(e.data); if(m.method==='Runtime.exceptionThrown') fehler.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text); if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error') fehler.push('console.error: '+m.params.args.map(a=>a.value||a.description).join(' '));});
await send('Emulation.setDeviceMetricsOverride', { width: +W, height: +H, deviceScaleFactor: 1, mobile: +W < 768 });
await send('Page.navigate', { url });
await wait(2500);
fs.mkdirSync(out, { recursive: true });
let n = 0;
for (const p of posn) {
  n++;
  let js;
  if (p.startsWith('wait:')) { await wait(+p.slice(5)); js = 'void 0'; }
  else if (p === 'max') js = `scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})`;
  else if (p === 'ende') js = `scrollTo({top:document.documentElement.scrollHeight-innerHeight*1.15,behavior:'instant'})`;
  else if (p.startsWith('sel:')) { const [, sel, f] = p.split(':'); js = `(()=>{const e=document.querySelector('${sel}');scrollTo({top:e.getBoundingClientRect().top+scrollY+innerHeight*${f || 0},behavior:'instant'})})()`; }
  else js = `scrollTo({top:${p},behavior:'instant'})`;
  await send('Runtime.evaluate', { expression: js });
  await wait(1100);
  const r = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${out}/s${n}.png`, Buffer.from(r.data, 'base64'));
  const y = await send('Runtime.evaluate', { expression: 'scrollY', returnByValue: true });
  console.log(`s${n}.png  ${p}  scrollY=${y.result?.value}`);
}
console.log(fehler.length?'JS-FEHLER:\n'+fehler.join('\n'):'keine JS-Fehler');
ws.close(); chrome.kill();
