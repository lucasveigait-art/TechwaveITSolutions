import 'dotenv/config';
import { createApp } from './app.js';

const PORT = process.env.PORT || 3000;

createApp()
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`Techwave · Relatórios de TI rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('\n=========================================================');
    console.error(' Não foi possível iniciar o sistema.');
    console.error(' Verifique se o arquivo .env existe e se o DATABASE_URL');
    console.error(' está correto e se o computador está conectado à internet.');
    console.error('=========================================================\n');
    console.error('Detalhe técnico do erro:', err.message);
    process.exitCode = 1;
  });
