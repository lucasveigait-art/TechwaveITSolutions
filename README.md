# Techwave — Central de Precificação

Arquivo único (`index.html`), sem instalação: basta abrir no navegador (duplo clique). Funciona offline.

## Abas
- **Planos MSP** — preço mensal dos planos Essential / Pro / Enterprise, hora excedente e taxa de implantação.
- **Projetos & Terceiros** — orçamento item a item (terceiros, horas Techwave, material, deslocamento) com lucro sobre o custo ou margem sobre a venda.
- **Proposta** — gera o texto para o cliente (copiar, .txt ou PDF) ou a versão interna com custos e margens.
- **Parâmetros Techwave** — imposto, comissão, taxas, custo da hora, km, rateio de fixos, margem mínima e arredondamento. Valem para todas as abas.

Tudo que é digitado fica salvo no navegador. Use *Exportar/Importar backup* para levar as configurações para outro computador.

## Fórmulas
- Margem alvo: `Preço = Custo ÷ (1 − imposto − comissão − taxas − margem)`
- Lucro sobre o custo: `Preço = Custo × (1 + lucro) ÷ (1 − imposto − comissão − taxas)`

### Planos MSP
1. **Franquia prometida** = maior entre (usuários × h/usuário) e a franquia mínima do plano.
2. **Horas de trabalho previstas** = franquia × maturidade (reativo) + (endpoints × h/endpoint + servidores × h/servidor) × maturidade (proativo) + horas de gestão/vCIO.
3. **Custo** = ferramentas inclusas no plano + reativo × hora × fator SLA + (proativo + gestão) × hora + visitas × (km × custo km + trajeto × hora) + rateio.
4. **Preço** = custo ÷ (1 − deduções − margem alvo), respeitando a mensalidade mínima; na cobrança por usuário, o valor por usuário é arredondado.
5. Indicadores: desconto máximo até a margem mínima, margem se o cliente usar +50% de horas reativas, lucro anual e alerta se a diferença entre planos for pequena.

### Visitas e hora avulsa
- Visitas preventivas por plano (0,5 = bimestral). O custo de cada visita vem da região do cliente: km × custo do km + pedágio + tempo de trajeto × hora.
- Visita fora do plano: o cliente paga a **taxa de deslocamento** (custo + impostos + 20%, com valor mínimo). As horas no local saem da franquia.
- Hora excedente = hora avulsa × (1 − desconto do plano). Nunca fica abaixo do valor que mantém a margem do plano.

### Parâmetros Techwave
- **Margem de contribuição** = o que sobra do preço depois de custos diretos, impostos e taxas. Ela paga os custos fixos e vira lucro. Cada plano mostra também o **lucro após custos fixos**.
- Calculadoras de apoio (só mudam os preços ao clicar em "Usar"): simulador do Simples (Fator R, Anexo III × V), custos fixos (% do faturamento e ponto de equilíbrio), custo real da hora da equipe e custo do km.
- Tarifa de boleto somada ao custo de cada cobrança. Hora avulsa básica e especializada.

### Preço de mercado, risco do SLA e ancoragem
- Cada plano tem um **preço mínimo por usuário** (valor de mercado). O preço final é o maior entre custo + margem e esse piso.
- **Adicional de risco do SLA**: reserva sobre mão de obra e visitas para planos com resposta rápida (Enterprise, 30 min).
- Na proposta, a opção de **ancoragem** apresenta Enterprise → Pro → Essential, para o Pro parecer o melhor custo-benefício.

### Tabela de preços (modo padrão)
Modelo híbrido usado por MSPs: **taxa base + usuários (com 1 computador) + computadores extras + servidores + ativos de rede**, por plano. Depois entram a complexidade do ambiente (−10% / 0 / +20%) e o **ajuste comercial do cliente** (%). O custo calculado vira o piso: cada plano mostra o **preço mínimo seguro** (margem mínima), o preço pela margem alvo e o desconto máximo. O modo "custo + margem" continua disponível.

### Proposta em PowerPoint
Na aba **Proposta**, carregue o modelo oficial com marcadores (`Modelo_Proposta_Techwave.pptx`) uma vez; ele fica salvo no navegador. O botão **Gerar PowerPoint** substitui `{{CLIENTE}}`, `{{DATA}}`, `{{USUARIOS}}`, `{{COMPUTADORES}}`, `{{LINKS}}`, `{{SERVIDORES}}`, `{{ROTEADORES}}`, `{{P1}}`/`{{P2}}`/`{{P3}}` (preços), `{{VIS3}}` (visitas do Enterprise) e `{{ECO_MES}}`/`{{ECO_ANO}}` (economia vs. analista interno). Os marcadores podem ser movidos no PowerPoint, desde que cada um fique inteiro, sem formatação diferente no meio.
