import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { SICHEN_LANDING_PATH } from '../src/config/productUrls.js';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const templatePath = path.join(distDir, 'index.html');
const serverEntry = path.join(root, '.ssr', 'entry-server.js');
const siteUrl = (process.env.SITE_URL || 'https://shiguanglab.com').replace(/\/$/, '');
const template = await readFile(templatePath, 'utf8');
const { render } = await import(`${pathToFileURL(serverEntry).href}?t=${Date.now()}`);

/** @param {string} value */
const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

/** @param {string} pathname @param {string} productName */
const buildPage = (pathname, productName) => {
  const { html, meta } = render(pathname);
  const canonicalUrl = `${siteUrl}${pathname === '/' ? '/' : pathname}`;
  const structuredData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: productName,
    applicationCategory: 'BusinessApplication',
    operatingSystem: pathname === SICHEN_LANDING_PATH ? 'Web, Windows, macOS, Linux' : 'Web',
    url: canonicalUrl,
    description: meta.description,
  });
  const head = [
    `<link rel="canonical" href="${canonicalUrl}" />`,
    '<meta property="og:type" content="website" />',
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    '<meta property="og:locale" content="zh_CN" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<script type="application/ld+json">${structuredData}</script>`,
  ].join('\n    ');

  return template
    .replace('<!--app-head-->', head)
    .replace('<!--app-html-->', html)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);
};

await writeFile(templatePath, buildPage('/', '拾光'));
const sichenDir = path.join(distDir, SICHEN_LANDING_PATH.slice(1));
await mkdir(sichenDir, { recursive: true });
await writeFile(path.join(sichenDir, 'index.html'), buildPage(SICHEN_LANDING_PATH, '司辰'));

const appDocument = template
  .replace('<!--app-head-->', '<meta name="robots" content="noindex" />')
  .replace('<!--app-html-->', '')
  .replace(/<title>.*?<\/title>/, '<title>拾光产品工作台</title>');
await writeFile(path.join(distDir, 'app.html'), appDocument);
const loginDocument = template
  .replace('<!--app-head-->', '<meta name="robots" content="noindex, nofollow" />')
  .replace('<!--app-html-->', '')
  .replace(/<title>.*?<\/title>/, '<title>登录拾光</title>');
const loginDir = path.join(distDir, 'login');
await mkdir(loginDir, { recursive: true });
await writeFile(path.join(loginDir, 'index.html'), loginDocument);
const registerDocument = template
  .replace('<!--app-head-->', '<meta name="robots" content="noindex, nofollow" />')
  .replace('<!--app-html-->', '')
  .replace(/<title>.*?<\/title>/, '<title>注册拾光</title>');
const registerDir = path.join(distDir, 'register');
await mkdir(registerDir, { recursive: true });
await writeFile(path.join(registerDir, 'index.html'), registerDocument);
const accountDocument = template
  .replace('<!--app-head-->', '<meta name="robots" content="noindex, nofollow" />')
  .replace('<!--app-html-->', '')
  .replace(/<title>.*?<\/title>/, '<title>账号中心 · 拾光</title>');
const accountDir = path.join(distDir, 'account');
await mkdir(accountDir, { recursive: true });
await writeFile(path.join(accountDir, 'index.html'), accountDocument);
for (const page of [
  { pathname: '/terms', productName: '拾光用户协议', robots: 'index, follow' },
  { pathname: '/privacy', productName: '拾光隐私政策', robots: 'index, follow' },
  { pathname: '/login-help', productName: '拾光登录帮助', robots: 'noindex, follow' },
]) {
  const pageDir = path.join(distDir, page.pathname.slice(1));
  await mkdir(pageDir, { recursive: true });
  const document = buildPage(page.pathname, page.productName)
    .replace('</head>', `  <meta name="robots" content="${page.robots}" />\n</head>`);
  await writeFile(path.join(pageDir, 'index.html'), document);
}
for (const appId of ['sichen', 'chat', 'knowledge', 'workflow', 'market', 'team']) {
  const appDir = path.join(distDir, 'app', appId);
  await mkdir(appDir, { recursive: true });
  await writeFile(path.join(appDir, 'index.html'), appDocument);
}

await mkdir(distDir, { recursive: true });
await writeFile(path.join(distDir, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /app/\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(path.join(distDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>${siteUrl}${SICHEN_LANDING_PATH}</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>${siteUrl}/terms</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
  <url><loc>${siteUrl}/privacy</loc><changefreq>yearly</changefreq><priority>0.3</priority></url>
</urlset>\n`);

/** Account sub-route fallbacks — SPA handles actual rendering client-side. */
for (const sub of ['profile', 'security', 'organizations']) {
  const subDir = path.join(distDir, 'account', sub);
  await mkdir(subDir, { recursive: true });
  await writeFile(path.join(subDir, 'index.html'), accountDocument);
}
console.log(`Pre-rendered ${siteUrl}/ and ${siteUrl}${SICHEN_LANDING_PATH}`);
