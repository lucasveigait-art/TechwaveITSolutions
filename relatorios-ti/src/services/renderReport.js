import * as schema from './reportSchema.js';

const RAG_COLORS = { green: '#16a34a', amber: '#d97706', red: '#dc2626' };
const RAG_LABELS = { green: 'No prazo', amber: 'Atenção', red: 'Crítico' };

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatPeriod(period) {
  if (!period) return '';
  const [year, month] = period.split('-');
  const idx = parseInt(month, 10) - 1;
  return `${MONTHS_PT[idx] || month} de ${year}`;
}

function esc(value) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function nl2br(text) {
  return esc(text).replace(/\n/g, '<br>');
}

function ragChip(status) {
  const color = RAG_COLORS[status] || '#94a3b8';
  const label = status ? RAG_LABELS[status] : 'N/D';
  return `<span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${color};color:#ffffff;font-size:12px;font-weight:700;letter-spacing:.02em;">${label}</span>`;
}

function metricRow(label, value) {
  return `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#475569;font-size:14px;">${esc(label)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;">${esc(value)}</td>
    </tr>`;
}

function renderReportHtml({ client, report, companySiteUrl, companyPhone }) {
  const data = report.data || {};
  const periodLabel = formatPeriod(report.period);
  const siteUrl = companySiteUrl || process.env.COMPANY_SITE_URL || 'https://www.techwave.tec.br';
  const phone = companyPhone || process.env.COMPANY_PHONE || '';

  const statusChips = schema.STATUS_AREAS.map((area) => `
    <td style="padding:16px;text-align:center;">
      <div style="font-size:12px;color:#64748b;margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em;">${esc(area.label)}</div>
      ${ragChip(data[area.key])}
    </td>`).join('');

  const groupTables = schema.GROUPS.map((group) => {
    const fields = schema.FIELDS.filter((f) => f.group === group.key);
    const rows = fields.map((f) => metricRow(f.label, schema.formatFieldValue(f.key, data[f.key]))).join('');
    return `
      <div style="margin-bottom:28px;">
        <h3 style="font-size:16px;color:#0f172a;margin:0 0 10px;font-weight:700;">${esc(group.label)}</h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
          ${rows}
        </table>
      </div>`;
  }).join('');

  const textBlocks = schema.TEXT_FIELDS.map((f) => {
    const value = data[f.key];
    if (!value) return '';
    return `
      <div style="margin-bottom:24px;">
        <h3 style="font-size:16px;color:#0f172a;margin:0 0 10px;font-weight:700;">${esc(f.label)}</h3>
        <p style="font-size:14px;line-height:1.7;color:#334155;margin:0;">${nl2br(value)}</p>
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Relatório Mensal de TI · ${esc(client.name)} · ${esc(periodLabel)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:24px;">

    <div style="background:linear-gradient(135deg,#0066cc 0%,#004499 100%);border-radius:16px 16px 0 0;padding:32px;color:#ffffff;">
      <div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.85;margin-bottom:8px;">Techwave IT Solutions</div>
      <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;">Relatório Mensal de TI</h1>
      <div style="font-size:16px;opacity:.95;">${esc(client.name)} · ${esc(periodLabel)}</div>
    </div>

    <div style="background:#ffffff;padding:24px 32px 8px;border:1px solid #e2e8f0;border-top:none;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>${statusChips}</tr>
      </table>
    </div>

    <div style="background:#ffffff;padding:8px 32px 32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;">
      ${textBlocks}
      ${groupTables}

      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e2e8f0;font-size:13px;color:#64748b;">
        <p style="margin:0 0 6px;"><strong>Techwave IT Solutions</strong> — Transformando Tecnologia em Vantagem Competitiva</p>
        <p style="margin:0 0 6px;">${phone ? `Telefone/WhatsApp: ${esc(phone)} · ` : ''}<a href="${esc(siteUrl)}" style="color:#0066cc;text-decoration:none;">${esc(siteUrl.replace(/^https?:\/\//, ''))}</a></p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export { renderReportHtml, formatPeriod, RAG_LABELS };
