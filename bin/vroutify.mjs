#!/usr/bin/env node

import { createWriteStream } from 'fs';
import path from 'path';
import process from 'process';

import vroutify from '../lib/index.mjs';

async function main() {
  const args = process.argv;
  let pagesDir = '';
  let routesDir = path.join('src', 'router');
  let sourceDir = '';
  let sourceDirAlias = '@';
  args.forEach((arg, index) => {
    if (arg.toLowerCase() === '--pages-dir') {
      pagesDir = args[index + 1];
    } else if (arg.toLowerCase() === '--routes-dir') {
      routesDir = args[index + 1];
    } else if (arg.toLowerCase() === '--source-dir') {
      sourceDir = args[index + 1];
    } else if (arg.toLowerCase() === '--source-dir-alias') {
      sourceDirAlias = args[index + 1];
    }
  });
  const outputStream = createWriteStream(path.join(routesDir, 'routes.js'), { flags: 'w' });
  const outputConsole = new console.Console(outputStream);
  outputConsole.log(await vroutify(pagesDir, sourceDir, sourceDirAlias));
}

await main();
