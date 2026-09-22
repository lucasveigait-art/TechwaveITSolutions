export function escapeHtml(value) {
  if (value === undefined || value === null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderNav(userEmail) {
  return `
  <header class="app-header">
    <div class="app-header-inner">
      <a href="/" class="app-logo">Techwave IT Solutions</a>
      <nav class="app-nav">
        <a href="/">Dashboard</a>
        <a href="/clients">Clientes</a>
        <a href="/reports/new">Novo Relatório</a>
      </nav>
      <form action="/logout" method="POST" class="app-logout">
        <span>${escapeHtml(userEmail || '')}</span>
        <button type="submit">Sair</button>
      </form>
    </div>
  </header>`;
}

export function renderPage({ title, bodyHtml, userEmail }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} · Techwave IT Solutions</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  ${userEmail !== undefined ? renderNav(userEmail) : ''}
  ${bodyHtml}
</body>
</html>`;
}

export function alertHtml(type, message) {
  if (!message) return '';
  return `<p class="alert alert-${type}">${escapeHtml(message)}</p>`;
}
