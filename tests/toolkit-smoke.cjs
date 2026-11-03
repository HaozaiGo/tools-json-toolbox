/* Run from any directory. See --help for local and deployed usage. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { parseArgs } = require('node:util');
const { values } = parseArgs({ options: {
  root: {type:'string', default:path.resolve(__dirname, '../..')},
  playwright: {type:'string'}, chrome: {type:'string'},
  online: {type:'boolean', default:false},
  repo: {type:'string', multiple:true},
  screenshots: {type:'string'}, help: {type:'boolean'},
}});
const sites = {
  'json-toolbox':'https://json.toolkitbox.org',
  'base64-tool':'https://base64.toolkitbox.org',
  'diff-checker':'https://diff.toolkitbox.org',
  'regex-tester':'https://regex.toolkitbox.org',
  'url-checker':'https://url.toolkitbox.org',
  'uuid-generator':'https://uuid.toolkitbox.org',
  'color-tool':'https://color.toolkitbox.org',
};
async function main() {
  if (values.help) {
    console.log('node toolkit-smoke.cjs [--root /path/to/tools] [--playwright /path/to/playwright] [--chrome /path/to/chrome] [--online] [--repo name] [--screenshots /path]\nRequires Playwright (installed package or explicit path) and Chrome/Chromium. Local mode serves the seven repos on an ephemeral port. Online mode tests their production subdomains using the local test modules. All third-party requests are blocked, including YAML CDNs. No fixture files are required.');
    return;
  }
  const {chromium} = require(values.playwright || process.env.PLAYWRIGHT_MODULE || 'playwright');
  const root = path.resolve(values.root);
  const repos = values.repo || Object.keys(sites);
  for (const repo of repos) assert.ok(Object.hasOwn(sites,repo), `Unknown repo: ${repo}`);
  let server, browser, base;
  let passed = 0, failed = 0;
  try {
    if (!values.online) {
      server = http.createServer(async (req,res) => {
        const pathname = new URL(req.url,'http://localhost').pathname;
        if (!Object.hasOwn(sites,pathname.split('/')[1])) { res.writeHead(204).end(); return; }
        try {
          const file = path.resolve(root,'.'+pathname,pathname.endsWith('/')?'index.html':'');
          if (!file.startsWith(root+path.sep)) { res.writeHead(403).end(); return; }
          const body = await fs.readFile(file);
          res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');
          res.end(body);
        } catch { res.writeHead(404).end(); }
      });
      await new Promise((resolve,reject) => {server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
      base = `http://127.0.0.1:${server.address().port}`;
    }
    const executablePath = values.chrome || process.env.CHROME_PATH;
    browser = await chromium.launch(executablePath ? {executablePath,headless:true} : {channel:'chrome',headless:true});
    if (values.screenshots) await fs.mkdir(values.screenshots,{recursive:true});
    for (const repo of repos) for (const lang of ['en','zh']) {
      const origin = values.online ? sites[repo] : base;
      const url = `${origin}/${values.online?'':repo+'/'}${lang==='zh'?'zh/':''}`;
      const page = await browser.newPage({viewport:{width:1280,height:900}});
      page.setDefaultTimeout(10000);
      const errors = [];
      page.on('pageerror',error => errors.push(error.message));
      await page.route('**/*',route => {
        const target = new URL(route.request().url());
        return target.origin === origin ? route.continue() : route.fulfill({status:204,body:''});
      });
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await require(path.join(root,repo,'tests/browser-smoke.cjs'))(page,assert,lang);
        assert.deepEqual(errors,[],'Uncaught page errors');
        if (values.screenshots) await page.screenshot({path:path.join(values.screenshots,`${repo}-${lang}.png`),animations:'disabled'});
        console.log(`PASS ${repo} ${lang}`); passed++;
      } catch (error) {
        console.error(`FAIL ${repo} ${lang}: ${error.stack}`); failed++;
      } finally { await page.close(); }
    }
    console.log(JSON.stringify({passed,failed,mode:values.online?'online':'local'}));
    if (failed) process.exitCode=1;
  } finally {
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => {console.error(error);process.exitCode=1;});
