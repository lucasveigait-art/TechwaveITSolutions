# Campanhas de e-mail — Techwave IT Solutions

Sequência de 3 e-mails por semana (segunda / quarta / sexta), reescrita com um único objetivo:
**gerar resposta**, não só abertura ou clique. Mantém a identidade visual da Techwave (dourado
`#C9A84C` sobre fundo escuro), mas muda a lógica de copy e de call-to-action.

## O que mudou em relação aos e-mails anteriores

1. **Um CTA principal por e-mail, e ele é "responda este e-mail".** Os modelos antigos
   competiam entre botão grande + link + resposta. Peça uma coisa só. Responder é o menor
   atrito possível — menor que clicar num link e preencher formulário.
2. **Saudação pessoal e remetente humano.** Trocamos "Equipe Techwave" por `{{SEU_NOME}}`
   (nome de uma pessoa real). E-mail frio assinado por pessoa converte mais em resposta do que
   assinado por empresa — parece conversa, não disparo em massa.
3. **Sequência com continuidade.** Os 3 e-mails da semana se referenciam ("te escrevi na
   segunda sobre...", "essa é a última mensagem da semana"). Isso é o que faz o contato sentir
   que está numa conversa e não recebendo 3 disparos aleatórios.
4. **Peça duas saídas, não uma.** No e-mail de sexta, pedimos "responda com QUERO ou com NÃO,
   OBRIGADO". Dar uma saída fácil para quem não tem interesse aumenta (contraintuitivamente) a
   taxa de resposta de quem tem.
5. **Preview text oculto.** Cada HTML tem um bloco `display:none` no topo com o texto que
   aparece ao lado do assunto na caixa de entrada — hoje esse espaço não era usado e ficava
   preenchido com lixo do HTML (ex: "Você recebe este e-mail por interesse...").
6. **Cancelar inscrição funcional.** Nos modelos antigos o link de descadastro era `href="#"`
   (não fazia nada — problema de conformidade). Agora abre um e-mail pronto com assunto
   `REMOVER` para vocês processarem manualmente.
7. **WhatsApp como alternativa.** Em prospecção B2B no Brasil, oferecer WhatsApp ao lado do
   e-mail reduz a fricção de resposta para quem não tem hábito de responder e-mail frio.

## Campos para personalizar antes de enviar

| Campo | O que é | Exemplo |
|---|---|---|
| `{{PRIMEIRO_NOME}}` | Primeiro nome do contato | João |
| `{{EMPRESA}}` | Nome da empresa do contato | Sediver Isoladores |
| `{{SEU_NOME}}` | Nome de quem está assinando o e-mail | Lucas Veiga |
| `{{SEU_WHATSAPP}}` | Número com DDD, só dígitos (para o link `wa.me`) | 22999999999 |
| `{{SEU_WHATSAPP_FORMATADO}}` | Número formatado para exibição | (22) 99999-9999 |
| `{{SEU_EMAIL}}` | E-mail de quem está enviando (usado no link de descadastro) | lucas@techwave.tec.br |

**`{{PRIMEIRO_NOME}}` e `{{EMPRESA}}` são os dois campos que mais aumentam resposta.** Se só der
para personalizar um por limitação de tempo, personalize o nome — é o de maior impacto.

### Como personalizar em volume sem programar nada

Como o envio hoje é manual pelo Gmail/Outlook, uma mala direta (mail merge) resolve a
personalização das 172 linhas da planilha sem precisar de automação:

- **Gmail:** extensões gratuitas como *Mailmeteor* ou *GMass* leem a planilha e substituem
  `{{Campo}}` pelo valor de cada linha, mantendo o HTML.
- **Outlook:** o recurso nativo de **Mala Direta do Word + Outlook** faz o mesmo, usando
  campos `«Campo»` em vez de `{{Campo}}` — só ajustar a sintaxe dos placeholders no HTML antes
  de importar.

Isso continua sendo 100% manual (vocês disparam quando quiserem, sem nenhuma automação por trás),
só elimina o trabalho de editar 172 e-mails um por um.

## Linhas de assunto e preview (teste A/B)

O assunto não faz parte do HTML — é definido na hora do envio. Sugestões por dia, para revezar
ou testar qual converte mais:

**Segunda — Diagnóstico (`01-segunda-diagnostico.html`)**
- `{{PRIMEIRO_NOME}}, consegue responder isso sobre a TI da {{EMPRESA}}?`
- `3 perguntas de 60 segundos pra {{EMPRESA}}`
- `Pergunta rápida sobre a TI da {{EMPRESA}}`

**Quarta — Provas reais (`02-quarta-provas-reais.html`)**
- `{{EMPRESA}}: o antes/depois de quem já passou por isso`
- `85% menos retrabalho — sem exagero`
- `Um resultado real que pode servir pra {{EMPRESA}}`

**Sexta — Fechamento (`03-sexta-fechamento.html`)**
- `{{PRIMEIRO_NOME}}, fechando a semana com uma pergunta direta`
- `Última mensagem da semana sobre isso`
- `Agenda da próxima semana pro diagnóstico gratuito`

Evite reaproveitar o mesmo assunto todo mês — contatos que já receberam antes (ou provedores que
aprendem o padrão) tendem a ignorar assuntos repetidos.

## Boas práticas para o envio manual (evitar caixa de Promoções / spam)

Mesmo sem automação, alguns hábitos simples aumentam MUITO a taxa de entrega na caixa principal:

1. **Envie em lotes pequenos**, não os 172 contatos de uma vez no mesmo minuto. 20–30 por vez,
   espaçados ao longo do dia, se parece muito mais com envio humano do que com disparo em massa.
2. **Use a caixa de e-mail real da empresa** (não uma conta genérica tipo `contato@`), de
   preferência a mesma pessoa que depois vai responder o contato — reforça a sensação de
   conversa 1:1.
3. **Confirme SPF/DKIM/DMARC do domínio `techwave.tec.br`** junto de quem administra o DNS.
   Sem isso, e-mails em volume tendem a cair em spam/promoções independente do conteúdo — é a
   causa mais comum (e mais ignorada) de baixa taxa de resposta em prospecção fria.
4. **Evite repetir "grátis" / "gratuito" várias vezes e ALL CAPS no assunto.** O corpo já usa
   isso com moderação; no assunto, evite completamente — são gatilhos clássicos de filtro de
   spam.
5. **Nunca envie a mesma lista duas vezes na mesma semana.** Cada uma das 3 listas do Excel
   corresponde a um dia (segunda/quarta/sexta) — mantenha esse rodízio para não repetir contato
   antes de uma resposta ou um "não, obrigado".
6. **Quando alguém responder "não, obrigado" ou pedir remoção, retire da lista imediatamente.**
   Além de ser exigido pela LGPD, manter contatos que já recusaram prejudica a reputação do
   domínio para os próximos envios.

## Próximo passo natural

Quando fizer sentido tirar o processo da mão de vocês dois, dá para automatizar o rodízio de
listas, o horário de disparo e o rastreio de quem já respondeu — usando o HubSpot (já conectado
neste ambiente) ou um script agendado. Isso ficou fora deste primeiro passo a pedido de vocês;
quando quiserem seguir para automação, é só pedir.
