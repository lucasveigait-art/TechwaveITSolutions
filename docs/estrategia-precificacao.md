# Estratégia de precificação — Techwave IT Solutions

## 1. Modelo de cobrança

**Preço por usuário/mês + servidores à parte + mínimo mensal por plano.**

- O preço por usuário é o padrão do mercado de serviços gerenciados de TI (MSP). É simples de explicar e cresce junto com o cliente.
- Servidores consomem mais esforço e entram como item separado. A referência de mercado vai de R$ 300 a R$ 800/mês por servidor.
- O mínimo mensal protege a margem em clientes muito pequenos. Nos EUA, os MSPs costumam ter um mínimo entre US$ 1.500 e US$ 3.000.
- Licenças com custo de fornecedor ficam fora do plano e são revendidas com margem fixa: backup em nuvem, EDR, Microsoft 365.

## 2. Referências de mercado (2026)

| Fonte / praça | Faixa |
|---|---|
| São Paulo, suporte remoto | R$ 180 a 280 por usuário/mês (1 a 10 usuários) e R$ 90 a 150 (acima de 60 usuários) |
| Brasil, por estação | R$ 80 a 180 por estação/mês. Servidor: R$ 300 a 800 |
| Brasil, por nível de cobertura | Básico R$ 100 a 200 · Intermediário R$ 200 a 350 · Completo R$ 350 a 600 |
| Rio de Janeiro | R$ 90 a 220 por usuário/mês |
| Campinas (interior SP) | Pequenas empresas: R$ 400 a 2.500/mês |
| Visita avulsa (capitais) | R$ 250 a 480 por visita |
| Hora técnica | Remota R$ 100 a 150 · Presencial R$ 150 a 300 |

Os números vêm em sua maioria de blogs de prestadores. São referências de mercado, não tabelas oficiais.

## 3. Tabela sugerida (base: capital)

| Plano | R$/usuário | R$/servidor | Mínimo/mês | Visitas/mês | Posicionamento |
|---|---|---|---|---|---|
| Essencial | 119 | 390 | 1.190 | 0 | Entrada: suporte remoto em horário comercial |
| Pro | 179 | 590 | 2.490 | 1 | Plano âncora: pensado para ser o mais vendido |
| Enterprise | 259 | 790 | 4.900 | 2 | Atendimento 24x7, segurança e consultoria de TI (vCIO) |

- **Descontos por volume:** 21 a 50 usuários −5% · 51 a 100 −10% · acima de 100 −15%. Isso acompanha a queda do preço por usuário que o mercado pratica conforme o porte do cliente.
- **Descontos por prazo:** 24 meses −5% · 36 meses −10%.
- **Implantação:** o maior valor entre o setup mínimo e o setup por usuário. Pode ser isentada como argumento de fechamento em contratos de 24 meses ou mais.

## 4. Capital × interior

O ponto central: **não se deve só aplicar um desconto ao interior.** Há dois efeitos opostos:

1. **Preço de mercado e custo local menores.** A capacidade de pagamento e o salário dos técnicos são menores no interior. Por isso, a mão de obra recebe um **fator de região** (sugestão: 0,85).
2. **Custo de deslocamento maior.** Cada visita presencial custa mais caro por causa da distância. Por isso, as **visitas incluídas no plano somam o deslocamento**: taxa fixa + km rodado (ida e volta).

| Região | Fator | Deslocamento por visita |
|---|---|---|
| Capital / Região Metropolitana | 1,00 | Incluso |
| Interior (até 100 km) | 0,85 | Taxa fixa R$ 90 |
| Interior distante (acima de 100 km) | 0,85 | R$ 150 + R$ 1,60/km (ida e volta) |

O que **não** muda com a região: licenças e serviços em nuvem (backup, EDR, M365), porque o custo do fornecedor é o mesmo.

**Por que funciona:** o Essencial é 100% remoto e fica cerca de 15% mais barato no interior, o que ajuda a competir com prestadores locais. Já o Pro e o Enterprise têm visitas incluídas. O deslocamento compensa o fator, e a margem fica protegida nas contas distantes.

**Alternativa para a carteira no interior:** quando houver vários clientes numa mesma cidade, vale usar um técnico parceiro local ou agrupar as visitas por rota. Nesse caso, dá para reduzir a taxa de deslocamento daquela região na calculadora.

## 5. Próximos passos

1. Validar a tabela contra os custos reais: hora técnica com encargos, ferramentas de monitoramento remoto (RMM) e PSA, licenças. A meta é margem bruta de 40 a 60%.
2. Ajustar os valores em "⚙️ Configurar tabela de preços" e exportar o JSON para o time comercial.
3. Revisar a tabela a cada 6 meses e reajustar os contratos pelo IPCA.
