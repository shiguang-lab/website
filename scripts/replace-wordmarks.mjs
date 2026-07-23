import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const assets = resolve(import.meta.dirname, '..', 'assets');

function painted(path, color) {
  const svg = readFileSync(path, 'utf8');
  const body = svg.match(/<svg[^>]*>\s*([\s\S]*?)<\/svg>/)[1];
  return body.replace('fill="#000000"', `fill="${color}"`);
}

function replaceWordmark(filename, layers) {
  const path = resolve(assets, filename);
  const source = readFileSync(path, 'utf8');
  const wordmark = `  <g id="wordmark">\n    ${layers.join('\n    ')}\n  </g>\n</svg>\n`;
  const output = source.replace(/  <g id="wordmark">[\s\S]*?<\/g>\s*<\/svg>\s*$/, wordmark);
  writeFileSync(path, output);
}

replaceWordmark('微信图片_20260722101555_796_4.svg', [
  painted('/private/tmp/796-cn.svg', '#f3f7ff')
]);

replaceWordmark('微信图片_20260722101555_797_4.svg', [
  painted('/private/tmp/797-cn.svg', '#f3f7ff'),
  painted('/private/tmp/797-en.svg', '#8eb9ff'),
  painted('/private/tmp/797-line.svg', '#52d8ff'),
  '<path d="M190 877H247M777 877H833" stroke="#cbd3df" stroke-width="1" stroke-linecap="round" opacity=".65"/>',
  `<g transform="translate(-2 0) scale(.64)">${painted('/private/tmp/798-tag.svg', '#cbd3df')}</g>`
]);

replaceWordmark('微信图片_20260722101556_798_4.svg', [
  painted('/private/tmp/798-cn.svg', '#f3f7ff'),
  painted('/private/tmp/798-en.svg', '#8eb9ff'),
  painted('/private/tmp/798-line.svg', '#52d8ff'),
  painted('/private/tmp/798-tag.svg', '#cbd3df')
]);
