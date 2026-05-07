const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const rootDir = __dirname;
const inputPath = path.join(rootDir, 'wishaw-ui-backend-api-reference.html');
const outputPath = path.join(rootDir, 'wishaw-ui-backend-api-reference.pdf');

function decodeHtml(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function toStructuredText(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : html;

  body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<style[\s\S]*?<\/style>/gi, '');
  body = body.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
  body = body.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  body = body.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  body = body.replace(/<li[^>]*>/gi, '\n- ');
  body = body.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (_, inner) => `\n\`\`\`\n${inner}\n\`\`\`\n`);
  body = body.replace(/<tr[^>]*>/gi, '\n');
  body = body.replace(/<\/tr>/gi, '\n');
  body = body.replace(/<t[dh][^>]*>/gi, ' | ');
  body = body.replace(/<\/t[dh]>/gi, ' ');
  body = body.replace(/<br\s*\/?>/gi, '\n');
  body = body.replace(/<\/p>|<\/div>|<\/section>|<\/header>|<\/table>|<\/thead>|<\/tbody>|<\/ul>|<\/ol>/gi, '\n');
  body = body.replace(/<[^>]+>/g, '');
  body = decodeHtml(body);
  body = body.replace(/[ \t]+\n/g, '\n');
  body = body.replace(/\n{3,}/g, '\n\n');
  return body
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

function writeParagraph(doc, text, options = {}) {
  doc.text(text, {
    width: 515,
    lineGap: options.lineGap ?? 1,
    paragraphGap: options.paragraphGap ?? 4,
    indent: options.indent ?? 0,
  });
}

function buildPdf(text) {
  const doc = new PDFDocument({ size: 'A4', margin: 40, info: { Title: 'Wishaw UI Backend API Reference' } });
  doc.pipe(fs.createWriteStream(outputPath));
  doc.font('Helvetica');

  let inCodeBlock = false;

  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/^\s+/, '');

    if (line === '```') {
      inCodeBlock = !inCodeBlock;
      if (!inCodeBlock) {
        doc.moveDown(0.5);
      }
      continue;
    }

    if (!line) {
      doc.moveDown(0.35);
      continue;
    }

    if (inCodeBlock) {
      doc.font('Courier').fontSize(8.2).fillColor('#111827');
      writeParagraph(doc, line, { paragraphGap: 1, lineGap: 0.5 });
      continue;
    }

    if (line.startsWith('# ')) {
      doc.moveDown(0.4);
      doc.font('Helvetica-Bold').fontSize(20).fillColor('#123b3a');
      writeParagraph(doc, line.slice(2), { paragraphGap: 6 });
      continue;
    }

    if (line.startsWith('## ')) {
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').fontSize(15).fillColor('#0f766e');
      writeParagraph(doc, line.slice(3), { paragraphGap: 5 });
      continue;
    }

    if (line.startsWith('### ')) {
      doc.moveDown(0.2);
      doc.font('Helvetica-Bold').fontSize(11.5).fillColor('#c96b2c');
      writeParagraph(doc, line.slice(4), { paragraphGap: 4 });
      continue;
    }

    if (line.startsWith('- ')) {
      doc.font('Helvetica').fontSize(9.2).fillColor('#1f2933');
      writeParagraph(doc, line, { indent: 10, paragraphGap: 2 });
      continue;
    }

    if (line.includes(' | ')) {
      doc.font('Courier').fontSize(7.1).fillColor('#374151');
      writeParagraph(doc, line.replace(/^\|\s*/, ''), { paragraphGap: 1.5, lineGap: 0.2 });
      continue;
    }

    doc.font('Helvetica').fontSize(9.2).fillColor('#1f2933');
    writeParagraph(doc, line, { paragraphGap: 2.5 });
  }

  doc.end();
}

if (!fs.existsSync(inputPath)) {
  throw new Error(`Input file not found: ${inputPath}`);
}

const html = fs.readFileSync(inputPath, 'utf8');
const text = toStructuredText(html);
buildPdf(text);
