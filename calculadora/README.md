# Calculadora de Precificação — Techwave IT Solutions

Calculadora estática (HTML único, sem dependências) para os planos **Essencial**, **Pro** e **Enterprise**.

## Como usar
1. Abra `calculadora/index.html` no navegador.
2. Preencha cliente, ambiente (usuários, servidores, unidades), prazo e plano.
3. Marque serviços adicionais e, se quiser, um desconto comercial extra.
4. Clique em **Gerar proposta (PDF)** e salve como PDF na janela de impressão.

## Tabela de preços
Os valores padrão são uma **sugestão baseada em mercado** (ver `docs/estrategia-precificacao.md`). Valide contra seus custos em "⚙️ Configurar tabela de preços".
Use **Exportar JSON** para compartilhar a tabela com a equipe, ou edite o objeto `DEFAULT` em `index.html` para torná-la o padrão.

## Regra de cálculo
- Preços de mão de obra × fator da região (capital 1,00 · interior 0,85)
- Plano bruto = usuários × R$/usuário + servidores × R$/servidor + (unidades − 1) × R$/unidade extra, respeitando o mínimo mensal do plano
- − desconto por volume (faixa de usuários) − desconto por prazo (12/24/36 meses)
- \+ adicionais − desconto comercial extra = **mensalidade**
- Implantação = máx(setup mínimo, usuários × setup/usuário), podendo ser isentada
- Valor global = mensalidade × prazo + implantação
