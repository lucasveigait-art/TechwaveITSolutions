import { escapeHtml, alertHtml, renderPage } from './layout.js';
import * as schema from '../services/reportSchema.js';

export function reportNewPage({ clients, selectedClientId, period, userEmail }) {
  const options = clients.map((c) => `<option value="${c.id}" ${Number(selectedClientId) === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');

  const bodyHtml = `
    <main class="container">
      <div class="page-header"><h1>Novo Relatório Mensal</h1></div>
      <form method="POST" action="/reports/new" class="card-form">
        <div class="form-row">
          <div class="form-group">
            <label for="client_id">Cliente *</label>
            <select id="client_id" name="client_id" required>${options}</select>
          </div>
          <div class="form-group">
            <label for="period">Período de Referência (mês) *</label>
            <input type="month" id="period" name="period" value="${escapeHtml(period)}" required>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Continuar</button>
        </div>
      </form>
    </main>`;

  return renderPage({ title: 'Novo Relatório Mensal', bodyHtml, userEmail });
}

export function reportFormPage({ title, clientName, period, data, report, userEmail }) {
  const statusOptions = (selected) => schema.RAG_OPTIONS
    .map((opt) => `<option value="${opt.value}" ${selected === opt.value ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`)
    .join('');

  const statusGrid = schema.STATUS_AREAS.map((area) => `
    <div class="form-group">
      <label for="${area.key}">${escapeHtml(area.label)}</label>
      <select id="${area.key}" name="${area.key}" class="status-select">
        ${statusOptions(data[area.key])}
      </select>
    </div>`).join('');

  const groupsHtml = schema.GROUPS.map((group) => {
    const fields = schema.FIELDS.filter((f) => f.group === group.key).map((field) => {
      if (field.type === 'select') {
        const opts = field.options.map((opt) => `<option value="${escapeHtml(opt)}" ${data[field.key] === opt ? 'selected' : ''}>${escapeHtml(opt)}</option>`).join('');
        return `
          <div class="form-group">
            <label for="${field.key}">${escapeHtml(field.label)}</label>
            <select id="${field.key}" name="${field.key}"><option value="">—</option>${opts}</select>
          </div>`;
      }
      const value = data[field.key] !== undefined && data[field.key] !== null ? data[field.key] : '';
      return `
        <div class="form-group">
          <label for="${field.key}">${escapeHtml(field.label)}</label>
          <input type="number" step="${field.step || '1'}" id="${field.key}" name="${field.key}" value="${escapeHtml(value)}">
        </div>`;
    }).join('');

    return `
      <section class="form-section">
        <h3>${escapeHtml(group.label)}</h3>
        <div class="metrics-grid">${fields}</div>
      </section>`;
  }).join('');

  const textFieldsHtml = schema.TEXT_FIELDS.map((field) => `
    <div class="form-group">
      <label for="${field.key}">${escapeHtml(field.label)}</label>
      <textarea id="${field.key}" name="${field.key}" placeholder="${escapeHtml(field.placeholder)}" rows="4">${escapeHtml(data[field.key])}</textarea>
    </div>`).join('');

  const bodyHtml = `
    <main class="container">
      <div class="page-header">
        <h1>${escapeHtml(title)}</h1>
        <span class="badge ${report.status === 'sent' ? 'badge-green' : 'badge-gray'}">${report.status === 'sent' ? 'Enviado' : 'Rascunho'}</span>
      </div>

      <form method="POST" action="/reports/${report.id}/edit" class="card-form report-form">
        <input type="hidden" name="period" value="${escapeHtml(period)}">

        <section class="form-section">
          <h2>Cliente: ${escapeHtml(clientName)} · Período: ${escapeHtml(period)}</h2>
        </section>

        <section class="form-section">
          <h3>Resumo Executivo e Status Geral</h3>
          <p class="section-hint">Uma visão rápida em "sinal de trânsito" (verde/amarelo/vermelho) por área, seguindo o padrão de mercado para relatórios de MSP.</p>
          <div class="status-grid">${statusGrid}</div>
          <button type="button" id="suggestStatusBtn" class="btn btn-link">Sugerir status automaticamente com base nos números abaixo</button>
        </section>

        ${groupsHtml}

        <section class="form-section">
          <h3>Narrativa do Relatório</h3>
          ${textFieldsHtml}
        </section>

        <div class="form-actions form-actions-sticky">
          <a href="/" class="btn btn-secondary">Voltar ao Dashboard</a>
          <button type="submit" name="_action" value="save" class="btn btn-secondary">Salvar Rascunho</button>
          <button type="submit" name="_action" value="preview" class="btn btn-primary">Salvar e Pré-visualizar</button>
        </div>
      </form>
    </main>

    <script>
      (function () {
        var suggestBtn = document.getElementById('suggestStatusBtn');
        if (!suggestBtn) return;

        var rules = {
          status_sla: function (d) {
            var vals = [parseFloat(d.sla_response_pct), parseFloat(d.sla_resolution_pct)].filter(function (v) { return !isNaN(v); });
            if (!vals.length) return null;
            var min = Math.min.apply(null, vals);
            return min >= 95 ? 'green' : min >= 85 ? 'amber' : 'red';
          },
          status_uptime: function (d) {
            var keys = ['uptime_servers_pct', 'uptime_network_pct', 'uptime_cloud_pct', 'uptime_workstations_pct'];
            var vals = keys.map(function (k) { return parseFloat(d[k]); }).filter(function (v) { return !isNaN(v); });
            if (!vals.length) return null;
            var min = Math.min.apply(null, vals);
            return min >= 99.9 ? 'green' : min >= 99 ? 'amber' : 'red';
          },
          status_service_desk: function (d) {
            var pending = parseFloat(d.tickets_pending);
            if (isNaN(pending)) return null;
            return pending <= 5 ? 'green' : pending <= 15 ? 'amber' : 'red';
          },
          status_security: function (d) {
            var incidents = parseFloat(d.security_incidents) || 0;
            var backup = parseFloat(d.backup_success_pct);
            if (incidents === 0 && (isNaN(backup) || backup >= 99)) return 'green';
            if (incidents <= 2 && (isNaN(backup) || backup >= 95)) return 'amber';
            return 'red';
          },
        };

        suggestBtn.addEventListener('click', function () {
          var form = suggestBtn.closest('form');
          var data = {};
          new FormData(form).forEach(function (value, key) { data[key] = value; });

          Object.keys(rules).forEach(function (key) {
            var suggestion = rules[key](data);
            if (suggestion) {
              var select = form.querySelector('[name="' + key + '"]');
              if (select) select.value = suggestion;
            }
          });
        });
      })();
    </script>`;

  return renderPage({ title, bodyHtml, userEmail });
}

export function reportPreviewPage({ report, customer, reportHtml, sent, sendError, userEmail }) {
  const srcdocEscaped = reportHtml.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  const bodyHtml = `
    <main class="container">
      <div class="page-header">
        <h1>Pré-visualização do Relatório</h1>
        <span class="badge ${report.status === 'sent' ? 'badge-green' : 'badge-gray'}">${report.status === 'sent' ? 'Enviado' : 'Rascunho'}</span>
      </div>

      ${sent ? `<p class="alert alert-success">Relatório enviado com sucesso para ${escapeHtml(customer.contact_email)}!</p>` : ''}

      <div class="preview-toolbar">
        <div>
          <strong>${escapeHtml(customer.name)}</strong> · ${escapeHtml(customer.contact_email)}
          ${customer.contact_email_cc ? ` · CC: ${escapeHtml(customer.contact_email_cc)}` : ''}
        </div>
        <div class="preview-toolbar-actions">
          <a href="/reports/${report.id}/edit" class="btn btn-secondary">Editar</a>
          <a href="/reports/${report.id}/pdf" target="_blank" class="btn btn-secondary">Baixar PDF</a>
          <form method="POST" action="/reports/${report.id}/send" onsubmit="return confirm('Confirma o envio deste relatório por e-mail para ${escapeHtml(customer.contact_email)}?');">
            <button type="submit" class="btn btn-primary btn-finalize">${report.status === 'sent' ? 'Reenviar por E-mail' : 'Finalizar e Enviar por E-mail'}</button>
          </form>
        </div>
      </div>

      ${alertHtml('error', sendError ? `Falha ao enviar: ${sendError}` : null)}

      <div class="report-frame-wrap">
        <iframe class="report-frame" srcdoc="${srcdocEscaped}"></iframe>
      </div>
    </main>`;

  return renderPage({ title: `Preview · ${customer.name} · ${report.period}`, bodyHtml, userEmail });
}
