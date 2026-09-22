import PDFDocument from 'pdfkit';
import * as schema from './reportSchema.js';
import { formatPeriod, RAG_LABELS } from './renderReport.js';

const RAG_COLORS = { green: '#16a34a', amber: '#d97706', red: '#dc2626' };
const PRIMARY = '#0066cc';
const TEXT = '#1a1a1a';
const MUTED = '#666666';

function generateReportPdf({ client, report }) {
  return new Promise((resolve, reject) => {
    const data = report.data || {};
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Cabeçalho
    doc.rect(0, 0, doc.page.width, 110).fill(PRIMARY);
    doc.fillColor('#ffffff').fontSize(10).text('TECHWAVE IT SOLUTIONS', 50, 28, { characterSpacing: 1 });
    doc.fontSize(20).font('Helvetica-Bold').text('Relatório Mensal de TI', 50, 46);
    doc.fontSize(13).font('Helvetica').text(`${client.name} · ${formatPeriod(report.period)}`, 50, 76);

    doc.fillColor(TEXT).font('Helvetica');
    let y = 135;

    // Status RAG
    doc.fontSize(12).font('Helvetica-Bold').fillColor(TEXT).text('Status Geral', 50, y);
    y += 20;
    const areaWidth = (doc.page.width - 100) / schema.STATUS_AREAS.length;
    schema.STATUS_AREAS.forEach((area, i) => {
      const x = 50 + i * areaWidth;
      const status = data[area.key];
      doc.fontSize(8).fillColor(MUTED).text(area.label.toUpperCase(), x, y, { width: areaWidth - 10 });
      doc.roundedRect(x, y + 14, 80, 18, 9).fill(RAG_COLORS[status] || '#94a3b8');
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
        .text(status ? RAG_LABELS[status] : 'N/D', x, y + 19, { width: 80, align: 'center' });
      doc.font('Helvetica');
    });
    y += 50;

    // Blocos de texto
    schema.TEXT_FIELDS.forEach((field) => {
      const value = data[field.key];
      if (!value) return;
      y = ensureSpace(doc, y, 60);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(TEXT).text(field.label, 50, y);
      y = doc.y + 4;
      doc.fontSize(10).font('Helvetica').fillColor(MUTED).text(value, 50, y, { width: doc.page.width - 100, lineGap: 3 });
      y = doc.y + 16;
    });

    // Grupos de métricas
    schema.GROUPS.forEach((group) => {
      const fields = schema.FIELDS.filter((f) => f.group === group.key);
      y = ensureSpace(doc, y, 40 + fields.length * 18);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(TEXT).text(group.label, 50, y);
      y = doc.y + 8;

      fields.forEach((f) => {
        const value = schema.formatFieldValue(f.key, data[f.key]);

        doc.fontSize(10).font('Helvetica').fillColor(MUTED).text(f.label, 50, y, { width: 320 });
        doc.font('Helvetica-Bold').fillColor(TEXT).text(value, 380, y, { width: doc.page.width - 100 - 330, align: 'right' });
        doc.moveTo(50, y + 15).lineTo(doc.page.width - 50, y + 15).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
        y += 20;
      });
      y += 14;
    });

    // Rodapé
    y = ensureSpace(doc, y, 60);
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor('#e2e8f0').stroke();
    y += 12;
    doc.fontSize(9).fillColor(MUTED)
      .text('Techwave IT Solutions — Transformando Tecnologia em Vantagem Competitiva', 50, y);
    doc.text(`${process.env.COMPANY_SITE_URL || 'https://www.techwave.tec.br'}${process.env.COMPANY_PHONE ? '  ·  ' + process.env.COMPANY_PHONE : ''}`, 50, y + 14);

    doc.end();
  });
}

function ensureSpace(doc, y, needed) {
  if (y + needed > doc.page.height - 70) {
    doc.addPage();
    return 50;
  }
  return y;
}

export { generateReportPdf };
