# Techwave · Relatórios Mensais de TI

Sistema interno da **Techwave IT Solutions** para cadastrar clientes e gerar/enviar por
e-mail, com um clique, o relatório mensal de TI de cada um deles.

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
Heimdal, Guardz, entre outras) para relatórios mensais de MSP em 2026, com o objetivo de o
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

## Requisitos

- Node.js 18 ou superior.
- Uma conta de e-mail com acesso SMTP (Gmail/Workspace, Outlook/Microsoft 365, SendGrid,
  Amazon SES, Zoho, etc.).

## Instalação

```bash
cd relatorios-ti
npm install
cp .env.example .env
```

Edite o arquivo `.env`:

- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: login do painel administrativo.
- `SESSION_SECRET`: qualquer string aleatória longa.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`: dados da conta de
  e-mail usada para enviar os relatórios.
  - **Gmail/Google Workspace**: `smtp.gmail.com`, porta `465`, `SMTP_SECURE=true`, e use
    uma [Senha de App](https://myaccount.google.com/apppasswords) (não a senha normal).
  - **Outlook/Microsoft 365**: `smtp.office365.com`, porta `587`, `SMTP_SECURE=false`.
- `MAIL_FROM_NAME` / `MAIL_FROM_EMAIL`: remetente que o cliente vê.
- `COMPANY_SITE_URL` / `COMPANY_PHONE`: aparecem no rodapé dos relatórios e e-mails
  (já configurado para `https://www.techwave.tec.br`).

Crie o usuário administrador:

```bash
npm run setup:admin
```

Inicie o sistema:

```bash
npm start
```

Acesse `http://localhost:3000` e entre com o e-mail/senha definidos em `ADMIN_EMAIL` /
`ADMIN_PASSWORD`.

## Estrutura do projeto

```
relatorios-ti/
  src/
    server.js              → bootstrap do Express
    db/                     → schema e conexão SQLite (arquivo único, sem servidor externo)
    middleware/auth.js      → protege as rotas por sessão de login
    routes/                 → clientes, relatórios, dashboard, login
    services/
      reportSchema.js       → definição dos campos do relatório mensal
      renderReport.js       → gera o HTML do relatório (preview e corpo do e-mail)
      pdf.js                → gera o PDF do relatório (pdfkit, sem depender de navegador)
      email.js              → envia o e-mail via SMTP (nodemailer)
    views/                  → páginas EJS do painel administrativo
  public/css/style.css      → estilo com a identidade visual da Techwave
  data/techwave.db          → banco de dados SQLite (criado automaticamente)
```

Banco de dados em arquivo único (SQLite) — sem necessidade de instalar ou configurar um
servidor de banco de dados separado, o que mantém a hospedagem simples (qualquer VPS,
Render, Railway etc. com Node.js funciona).

## Segurança

- Acesso ao painel protegido por login (sessão de servidor).
- Senha do administrador armazenada com hash bcrypt.
- Dados de clientes ficam apenas no seu próprio banco/servidor — nenhuma informação é
  enviada a terceiros além do envio do e-mail ao próprio cliente.
