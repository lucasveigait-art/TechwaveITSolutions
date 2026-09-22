import { escapeHtml, renderPage } from './layout.js';

export function dashboardPage({ clients, reports, pendingClients, refPeriodLabel, stats, formatPeriod, userEmail }) {
  const pendingHtml = pendingClients.length === 0 ? '' : `
    <section class="dashboard-section">
      <h2>Pendentes de ${escapeHtml(refPeriodLabel)}</h2>
      <ul class="pending-list">
        ${pendingClients.map((c) => `
          <li>
            <span>${escapeHtml(c.name)}</span>
            <a href="/reports/new?client_id=${c.id}" class="btn btn-secondary btn-sm">Criar Relatório</a>
          </li>`).join('')}
      </ul>
    </section>`;

  const reportsRows = reports.length === 0
    ? `<p class="empty-state">Nenhum relatório criado ainda.</p>`
    : `<table class="table">
        <thead>
          <tr><th>Cliente</th><th>Período</th><th>Status</th><th>Atualizado em</th><th></th></tr>
        </thead>
        <tbody>
          ${reports.map((r) => `
            <tr>
              <td>${escapeHtml(r.client_name)}</td>
              <td>${escapeHtml(formatPeriod(r.period))}</td>
              <td><span class="badge ${r.status === 'sent' ? 'badge-green' : 'badge-gray'}">${r.status === 'sent' ? 'Enviado' : 'Rascunho'}</span></td>
              <td>${escapeHtml(r.updated_at)}</td>
              <td class="table-actions">
                <a href="/reports/${r.id}/edit">Editar</a>
                <a href="/reports/${r.id}/preview">Visualizar</a>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;

  const bodyHtml = `
    <main class="container">
      <div class="page-header">
        <h1>Dashboard</h1>
        <a href="/reports/new" class="btn btn-primary">+ Novo Relatório</a>
      </div>

      <div class="stats-grid">
        <div class="stat-card"><div class="stat-number">${stats.totalClients}</div><div class="stat-label">Clientes Ativos</div></div>
        <div class="stat-card"><div class="stat-number">${stats.sentReports}</div><div class="stat-label">Relatórios Enviados</div></div>
        <div class="stat-card"><div class="stat-number">${stats.draftReports}</div><div class="stat-label">Rascunhos Pendentes</div></div>
        <div class="stat-card"><div class="stat-number">${pendingClients.length}</div><div class="stat-label">Clientes Sem Relatório de ${escapeHtml(refPeriodLabel)}</div></div>
      </div>

      ${pendingHtml}

      <section class="dashboard-section">
        <h2>Relatórios Recentes</h2>
        ${reportsRows}
      </section>
    </main>`;

  return renderPage({ title: 'Dashboard', bodyHtml, userEmail });
}
