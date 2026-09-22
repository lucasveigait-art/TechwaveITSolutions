import { escapeHtml, alertHtml, renderPage } from './layout.js';

export function clientsListPage({ clients, userEmail }) {
  const rows = clients.length === 0
    ? `<p class="empty-state">Nenhum cliente cadastrado ainda. Clique em "Novo Cliente" para começar.</p>`
    : `<table class="table">
        <thead>
          <tr><th>Nome</th><th>Setor</th><th>Contato</th><th>E-mail</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          ${clients.map((c) => `
            <tr>
              <td>${escapeHtml(c.name)}</td>
              <td>${escapeHtml(c.sector) || '—'}</td>
              <td>${escapeHtml(c.contact_name) || '—'}</td>
              <td>${escapeHtml(c.contact_email)}</td>
              <td><span class="badge ${c.active ? 'badge-green' : 'badge-gray'}">${c.active ? 'Ativo' : 'Inativo'}</span></td>
              <td class="table-actions">
                <a href="/clients/${c.id}/edit">Editar</a>
                <a href="/reports/new?client_id=${c.id}">Novo Relatório</a>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;

  const bodyHtml = `
    <main class="container">
      <div class="page-header">
        <h1>Clientes</h1>
        <a href="/clients/new" class="btn btn-primary">+ Novo Cliente</a>
      </div>
      ${rows}
    </main>`;

  return renderPage({ title: 'Clientes', bodyHtml, userEmail });
}

export function clientFormPage({ title, customer, error, userEmail }) {
  const isEdit = customer && customer.id !== undefined;
  const bodyHtml = `
    <main class="container container-narrow">
      <h1>${escapeHtml(title)}</h1>
      ${alertHtml('error', error)}
      <form method="POST" class="card-form">
        <div class="form-group">
          <label for="name">Nome do Cliente *</label>
          <input type="text" id="name" name="name" value="${escapeHtml(customer.name)}" required>
        </div>
        <div class="form-group">
          <label for="sector">Setor</label>
          <input type="text" id="sector" name="sector" value="${escapeHtml(customer.sector)}" placeholder="Ex: Indústria, Varejo, Saúde...">
        </div>
        <div class="form-group">
          <label for="contact_name">Nome do Contato Responsável</label>
          <input type="text" id="contact_name" name="contact_name" value="${escapeHtml(customer.contact_name)}">
        </div>
        <div class="form-group">
          <label for="contact_email">E-mail para Envio do Relatório *</label>
          <input type="email" id="contact_email" name="contact_email" value="${escapeHtml(customer.contact_email)}" required>
        </div>
        <div class="form-group">
          <label for="contact_email_cc">E-mails em Cópia (CC, opcional, separados por vírgula)</label>
          <input type="text" id="contact_email_cc" name="contact_email_cc" value="${escapeHtml(customer.contact_email_cc)}">
        </div>
        <div class="form-group">
          <label for="notes">Observações Internas</label>
          <textarea id="notes" name="notes">${escapeHtml(customer.notes)}</textarea>
        </div>
        ${isEdit ? `
        <div class="form-group form-group-checkbox">
          <label>
            <input type="checkbox" name="active" value="1" ${customer.active ? 'checked' : ''}>
            Cliente ativo
          </label>
        </div>` : ''}
        <div class="form-actions">
          <a href="/clients" class="btn btn-secondary">Cancelar</a>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>
    </main>`;

  return renderPage({ title, bodyHtml, userEmail });
}
