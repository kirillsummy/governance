'use strict';

const path = require('node:path');
const { createDialogServer, readConfig } = require('./dialog-server.cjs');

const args = process.argv.slice(2);
const configIndex = args.indexOf('--config');
const config = readConfig(configIndex >= 0 ? args[configIndex + 1] : '');
const root = path.resolve(args.find((value, index) => !value.startsWith('--') && (configIndex < 0 || index !== configIndex + 1)) || process.cwd());
const port = Number.isInteger(config.port) ? config.port : 8770;

createDialogServer({ root, config, port }).listen().then(() => {
  process.stdout.write(`Окно Claude: http://127.0.0.1:${port}\n`);
});
