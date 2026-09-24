# Techwave — Central de Precificação

Arquivo único (`index.html`), sem instalação: basta abrir no navegador (duplo clique). Funciona offline.

## Abas
- **Planos MSP** — preço mensal dos planos Essential / Pro / Elite, hora excedente e taxa de implantação.
- **Projetos & Terceiros** — orçamento item a item (terceiros, horas Techwave, material, deslocamento) com lucro sobre o custo ou margem sobre a venda.
- **Proposta** — gera o texto para o cliente (copiar, .txt ou PDF) ou a versão interna com custos e margens.
- **Parâmetros Techwave** — imposto, comissão, taxas, custo da hora, km, rateio de fixos, margem mínima e arredondamento. Valem para todas as abas.

Tudo que é digitado fica salvo no navegador. Use *Exportar/Importar backup* para levar as configurações para outro computador.

## Fórmulas
- Margem alvo: `Preço = Custo ÷ (1 − imposto − comissão − taxas − margem)`
- Lucro sobre o custo: `Preço = Custo × (1 + lucro) ÷ (1 − imposto − comissão − taxas)`
- Custo do plano = licenças + (horas × maturidade × custo da hora × fator SLA) + visitas × (km × custo km + tempo de trajeto × custo da hora) + rateio.
