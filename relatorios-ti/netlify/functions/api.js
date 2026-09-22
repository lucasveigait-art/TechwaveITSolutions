import serverless from 'serverless-http';
import { createApp } from '../../src/app.js';

// Formato de função compatível com AWS Lambda (exports.handler), usado aqui
// de propósito para hospedar a aplicação Express completa como está, sem
// reescrever todas as rotas como funções individuais no formato mais novo.
let handlerPromise;

function getHandler() {
  if (!handlerPromise) {
    handlerPromise = createApp().then((app) => serverless(app));
  }
  return handlerPromise;
}

export const handler = async (event, context) => {
  const serverlessHandler = await getHandler();
  return serverlessHandler(event, context);
};
