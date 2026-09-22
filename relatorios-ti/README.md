# Techwave · Relatórios Mensais de TI

Sistema interno da **Techwave IT Solutions** para cadastrar clientes e gerar/enviar por
e-mail, com um clique, o relatório mensal de TI de cada um deles. Hospedado no **Netlify**
(Functions + Netlify DB/Postgres, ambos no plano gratuito).

## Por que este formato de relatório

A estrutura de dados e o layout foram desenhados a partir das práticas mais comuns entre
provedores de serviços de TI (MSPs) para relatórios mensais recorrentes:

- **Resumo executivo com status "sinal de trânsito"** (verde / amarelo / vermelho) por
  área — visão de 5 segundos para quem não é técnico.
- **Desempenho do Service Desk**: chamados abertos/encerrados/pendentes, tempo médio de
  primeira resposta e de resolução.
- **Cumprimento de SLA**: % de chamados atendidos e resolvidos dentro do prazo.
- **Disponibilidade (uptime)**: servidores, rede, aplicações em nuvem e estações de trabalho.
- **Segurança, patches e backups**: incidentes, atualizações aplicadas/pendentes, sucesso
  de backup e teste de restauração.
- **Satisfação do cliente (CSAT)**, opcional.
- **Destaques do mês** e **recomendações** para o próximo mês.

Esse conjunto de seções é o recomendado por referências de mercado (Acronis, ConnectWise,
Heimdal, Guardz, entre outras) para relatórios mensais de MSP, com o objetivo de o
relatório ficar pronto em poucos minutos e ser enviado automaticamente por e-mail.

## Como funciona (fluxo "fácil de finalizar")

1. **Cadastrar cliente** (nome, setor, e-mail de contato).
2. **Novo Relatório** → escolher cliente e mês de referência.
3. Preencher os números do mês (ou usar o botão **"Sugerir status automaticamente"**, que
   calcula o sinal verde/amarelo/vermelho a partir dos números informados).
4. **Salvar e Pré-visualizar** → confere o relatório já formatado com a identidade visual
   da Techwave.
5. **Finalizar e Enviar por E-mail** → um único clique: gera o PDF, envia o e-mail (com o
   PDF em anexo) para o cliente e marca o relatório como "Enviado" no histórico.

O Dashboard mostra quais clientes ainda não têm relatório do mês corrente, para não
esquecer ninguém.

## Arquitetura (por que é assim)

Esse app roda como uma **Netlify Function** (serverless) por trás de um único endpoint
catch-all (`netlify/functions/api.js`), que hospeda a aplicação Express inteira via
`serverless-http`. Duas decisões seguem diretamente dessa escolha:

- **Sem SQLite/arquivo local.** Funções serverless não têm disco persistente entre
  invocações, então os dados ficam no **Netlify DB** (Postgres via Neon), provisionado
  automaticamente ao instalar `@netlify/database` e fazer deploy — nada para configurar
  manualmente, nenhuma connection string para copiar.
- **Sem EJS/arquivos de template lidos em disco.** As páginas (`src/views/*.js`) são
  funções JavaScript que retornam o HTML diretamente, para que o *bundler* de funções do
  Netlify consiga incluir tudo automaticamente seguindo os `import`s, sem depender de
  configuração extra de `included_files`.
- **Sessão sem estado no servidor.** Login usa `cookie-session` (dados assinados no
  próprio cookie do navegador), já que não há memória compartilhada entre invocações da
  função.

## Requisitos

- Conta gratuita no [Netlify](https://netlify.com) (você já tem).
- Uma conta de e-mail com acesso SMTP para enviar os relatórios (Gmail/Workspace,
  Outlook/Microsoft 365, SendGrid, Amazon SES, Zoho, etc.).

## Deploy no Netlify

1. No painel do Netlify, abra o site e vá em **Site configuration → Build & deploy →
   Continuous deployment → Link repository**, escolha o repositório do GitHub e defina o
   **Base directory** como `relatorios-ti`. O `netlify.toml` já configura o resto
   (build, diretório de functions, redirecionamento das rotas).
2. Em **Site configuration → Environment variables**, configure:
   - `SESSION_SECRET` — qualquer string aleatória longa.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — login do painel administrativo (o usuário é
     criado automaticamente no primeiro acesso).
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` — conta de e-mail
     usada para enviar os relatórios.
     - **Gmail/Google Workspace**: `smtp.gmail.com`, porta `465`, `SMTP_SECURE=true`, e
       use uma [Senha de App](https://myaccount.google.com/apppasswords) (não a senha
       normal da conta).
     - **Outlook/Microsoft 365**: `smtp.office365.com`, porta `587`, `SMTP_SECURE=false`.
   - `MAIL_FROM_NAME` / `MAIL_FROM_EMAIL` — remetente que o cliente vê.
   - `COMPANY_SITE_URL` / `COMPANY_PHONE` — aparecem no rodapé dos relatórios e e-mails.
   - **Não precisa** configurar nada de banco de dados — o Netlify injeta
     `NETLIFY_DB_URL` sozinho assim que o Netlify DB é provisionado no primeiro deploy.
3. Deploy. Acesse a URL do site e entre com o `ADMIN_EMAIL` / `ADMIN_PASSWORD` definidos.

## Desenvolvimento local

```bash
cd relatorios-ti
npm install
netlify dev
```

O `netlify dev` (CLI do Netlify) emula as Functions e injeta automaticamente a
`NETLIFY_DB_URL` de um branch de desenvolvimento do banco. Alternativamente, para rodar
só o servidor Express sem emular o Netlify (não terá banco de dados a menos que você
defina `NETLIFY_DB_URL` manualmente no `.env`):

```bash
cp .env.example .env
npm run dev
```

## Estrutura do projeto

```
relatorios-ti/
  netlify.toml                      → build, functions e redirecionamentos
  netlify/functions/api.js          → entrypoint serverless (Express via serverless-http)
  netlify/database/migrations/      → schema do Postgres, aplicado automaticamente no deploy
  src/
    app.js                          → fábrica do app Express (sem .listen)
    server.js                       → entrypoint local (`npm run dev`)
    db/index.js                     → conexão com o Netlify DB (Postgres)
    middleware/auth.js              → protege as rotas por sessão de login
    routes/                         → clientes, relatórios, dashboard, login
    services/
      reportSchema.js               → definição dos campos do relatório mensal
      renderReport.js                → gera o HTML do relatório (preview e corpo do e-mail)
      pdf.js                        → gera o PDF do relatório (pdfkit, sem depender de navegador)
      email.js                      → envia o e-mail via SMTP (nodemailer)
      ensureAdmin.js                → cria o usuário admin automaticamente no boot
    views/                          → páginas do painel administrativo (funções JS → HTML)
  public/css/style.css              → estilo com a identidade visual da Techwave
```

## Segurança

- Acesso ao painel protegido por login (cookie de sessão assinado).
- Senha do administrador armazenada com hash bcrypt.
- Dados de clientes ficam apenas no seu Postgres (Netlify DB) — nenhuma informação é
  enviada a terceiros além do envio do e-mail ao próprio cliente.
