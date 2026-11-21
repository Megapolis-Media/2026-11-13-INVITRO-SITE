// Private web kits are provisioned beside the checkout. Only dev serves local trial files.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const prefix = '/brand-type/';
const moduleId = 'virtual:invitro-typography';

export function siteFonts(root, development) {
  const licensed = join(root, 'private/webfonts');
  const preview = join(root, 'work/font-preview');
  const entries = new Map();
  const styles = [];
  const ticketStyles = [];
  function read(name) {
    const approved = join(licensed, name);
    if (existsSync(approved)) return readFileSync(approved);
    const sample = join(preview, name);
    if (development && existsSync(sample)) return readFileSync(sample);
  }
  function face(name, family, weight, style) {
    const bytes = read(name);
    if (!bytes) return;
    entries.set(name, bytes);
    styles.push(`@font-face{font-family:"${family}";font-weight:${weight};font-style:${style};font-display:swap;src:url("${prefix}${name}") format("woff2")}`);
  }
  face('DrukWideInvitro-SuperItalicCyr-Web.woff2', 'Druk Wide Invitro Web', 900, 'italic');
  for (const weight of [300,400,500,600,700,800,900]) {
    for (const style of ['normal','italic']) {
      face(`code-next-${weight}-${style}.woff2`, 'Code Next', weight, style);
    }
  }
  // An independently supplied, embeddable pair makes mailed SVG and image exports self-contained.
  for (const weight of [400,700]) {
    const bytes = read(`ticket-${weight}.woff2`);
    if (bytes) ticketStyles.push(`@font-face{font-family:"Code Next";font-weight:${weight};src:url(data:font/woff2;base64,${bytes.toString('base64')}) format("woff2")}`);
  }
  const shape = read('code-next-bold.typeface.json');
  if (shape) entries.set('code-next-bold.typeface.json', shape);
  const geometryUrl = shape ? prefix+'code-next-bold.typeface.json' : '/lottery/counter-font.json';
  entries.set('fonts.css', Buffer.from(styles.join('\n')+'\n'));
  return {
    name:'invitro-typography',
    resolveId(id) { if (id === moduleId) return '\0'+id; },
    load(id) {
      if (id === '\0'+moduleId) return `export const geometryUrl=${JSON.stringify(geometryUrl)};export const ticketFontCSS=${JSON.stringify(ticketStyles.join(''))};`;
    },
    configureServer(server) {
      server.middlewares.use(prefix, (req,res,next) => {
        const name = (req.url || '').split('?')[0].slice(1);
        const bytes = entries.get(name);
        if (!bytes) return next();
        res.setHeader('Content-Type', name.endsWith('.css') ? 'text/css' : name.endsWith('.json') ? 'application/json' : 'font/woff2');
        res.setHeader('Cache-Control','no-cache');
        res.end(bytes);
      });
    },
    generateBundle() {
      if (this.environment.name !== 'client') return;
      for (const [name,source] of entries) this.emitFile({type:'asset',fileName:prefix.slice(1)+name,source});
    },
  };
}
