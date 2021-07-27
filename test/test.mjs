import assert from 'assert/strict';
import fs from 'fs';
import { rm } from 'fs/promises';
import cproc from 'child_process';
import util from 'util';
import vroutify from '../index.mjs';

const exec = util.promisify(cproc.exec);

describe('Vroutify', function () {
  let expectedOutput = 'expected';
  let actualOutput = '';
  before(async function () {
    await rm('./example/src/myrouter/routes.js', { force: true });
    expectedOutput = fs.readFileSync('./test/routes.js', { encoding: 'utf8' });
    const output = await exec(
      'npx c8 node ./bin/vroutify.mjs --pages-dir example/src/mypages --router-dir example/src/myrouter --source-dir example/src --source-dir-alias @'
    );
    actualOutput = fs.readFileSync('./example/src/myrouter/routes.js', { encoding: 'utf8' });
  });
  it('Should provide vroutify as a callable function', function () {
    if (typeof vroutify !== 'function') throw Error();
  });
  it('Should create a non-blank file', async function () {
    if (actualOutput.length == 0) throw Error();
  });
  it('Should write the expected file', async function () {
    assert.deepEqual(actualOutput, expectedOutput);
  });
  it('Should cover the code', async function () {
    const actualOutput = await vroutify('example/src/mypages', 'example/src', '@');
    assert.deepEqual(actualOutput + '\n', expectedOutput);
  });
});
