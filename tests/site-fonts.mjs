import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { siteFonts } from '../scripts/site-fonts.mjs';

test('Only supplied web kits are published; local preview also loads prototype faces', async t => {
  const root = await mkdtemp(join(tmpdir(), 'invitro-fonts-'));
  t.after(() => rm(root, {recursive: true, force: true}));
  const licensed = join(root, 'private/webfonts');
  const preview = join(root, 'work/font-preview');
  await Promise.all([licensed, preview].map(dir => mkdir(dir, {recursive: true})));
  const display = 'DrukWideInvitro-SuperItalicCyr-Web.woff2';
  const body = 'code-next-700-normal.woff2';
  await writeFile(join(licensed, display), 'official');
  for (const name of [body, 'ticket-700.woff2', 'code-next-bold.typeface.json']) {
    await writeFile(join(preview, name), 'preview');
  }
  for (const development of [false, true]) {
    const plugin = siteFonts(root, development);
    const output = new Map();
    plugin.generateBundle.call({environment: {name: 'client'}, emitFile: asset => output.set(asset.fileName, asset.source)});
    const css = output.get('brand-type/fonts.css').toString();
    assert.ok(css.includes(display));
    assert.equal(css.includes(body), development);
    assert.equal(output.has('brand-type/code-next-bold.typeface.json'), development);
    const exports = plugin.load(plugin.resolveId('virtual:invitro-typography'));
    assert.equal(exports.includes(Buffer.from('preview').toString('base64')), development);
  }
});
