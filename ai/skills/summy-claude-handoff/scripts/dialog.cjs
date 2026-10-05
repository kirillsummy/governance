'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createDialogServer, readConfig } = require('./dialog-server.cjs');
const { createLimitsData } = require('./dialog-limits-data.cjs');
const { createUsageRefresh } = require('./usage-refresh.cjs');

const args = process.argv.slice(2);
const configIndex = args.indexOf('--config');
const config = readConfig(configIndex >= 0 ? args[configIndex + 1] : path.join(__dirname, 'dialog-config.json'));
const root = path.resolve(args.find((value, index) => !value.startsWith('--') && (configIndex < 0 || index !== configIndex + 1)) || process.cwd());
const port = Number(process.env.SUMMY_DIALOG_PORT) > 0 ? Number(process.env.SUMMY_DIALOG_PORT) : Number.isInteger(config.port) ? config.port : 8770;
const refreshUsage = createUsageRefresh(root, config);
const assets = { '/dialog-limits-client.js': 'text/javascript; charset=utf-8', '/dialog-limits.css': 'text/css; charset=utf-8' };
let limitsData = null;

const extension = {
  head: '<link rel="stylesheet" href="/dialog-limits.css">',
  top: '<section id="claude-limits"></section>',
  scripts: '<script src="/dialog-limits-client.js"></script>',
  async routes(request, url, response) {
    if (url.pathname === '/api/limits') {
      refreshUsage({ force: url.searchParams.get('refresh') === '1' }).catch(() => {});
      const state = refreshUsage.getState();
      response.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
      response.end(JSON.stringify({ ...limitsData.limits(), refreshing: state.running, refreshError: state.lastError }));
      return true;
    }
    if (assets[url.pathname]) {
      response.writeHead(200, { 'content-type': assets[url.pathname], 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
      response.end(fs.readFileSync(path.join(__dirname, url.pathname.slice(1))));
      return true;
    }
    return false;
  },
};

const instance = createDialogServer({ root, config, port, extension });
limitsData = createLimitsData(root, instance.data);
instance.listen().then(() => process.stdout.write(`Окно Claude: http://127.0.0.1:${port}\n`));
