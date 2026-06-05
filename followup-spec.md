# Collab Follow-up - especificacao inicial

## Objetivo

Criar um sistema de acompanhamento simples para mensagens que pode evoluir para uma task quando o assunto crescer.

O sistema tem duas fases:

1. **message-followup**: controle leve dentro da mensagem.
2. **task-followup**: acompanhamento estruturado com task-room, responsaveis, prazos futuros e mais contexto.

## Principio principal

Nem todo pedido em mensagem deve virar task.

O follow-up deve comecar leve, no contexto da conversa, e so virar task quando precisar de mais estrutura.

## Fase 1 - message-followup

### Quando usar

Usar para pedidos simples, rapidos ou de baixa complexidade.

Exemplos:

- "@Maria liga para o Joao e diz que vou atrasar."
- "@Lucas valida se o limite de tokens esta correto."
- "@Kai analise este erro e diga se precisa virar task."

### Caracteristicas

- Fica ligado a uma mensagem.
- Nao aparece na aba Tasks.
- Nao cria task-room.
- Nao exige prazo.
- Nao tem checklist.
- Nao tem workflow.
- Pode envolver humanos ou agentes/LLMs.
- Mostra status por responsavel.
- Mantem historico simples.

### Criacao

O follow-up so pode ser criado a partir de uma mensagem com mentions.

As mentions viram candidatos a responsaveis, cada mention pode se envolver no follow-up.
Após a mensagem criada, o sistema tem a opção 'confirmação de leitura', após esta opção incluir a opção 'confirmação de execução'
- se a mensagem tiver 'confirmação de leitura', os mentions devem marcar que leram a mensagem (já está pronta)
- se a mensagem tiver 'confirmação de execução', além de confirmar a leitura, os mentions devem marcar os outros status.

### Estados

Estados por usuário (quem criou , quem foi mensionado ou quem esta na thread):

- pendente
- lido
- vou fazer
- concluido
- bloqueado
- cancelado
- revisado - o autor confirmou que leu a resposta , neste momento é retirado do follow-up button

Regras:

- "concluido" implica leitura.
- "bloqueado" deve permitir observacao curta.
- Um usuario pode ter apenas um status ativo por follow-up.
- Se qualquer responsavel estiver bloqueado, o follow-up geral mostra alerta.

### Interface

Cada mensagem com follow-up deve mostrar uma area pequena de icones de status.

Esses icones nao sao emojis livres. Sao indicadores operacionais. Esta interface já esta pronta com emojis normais.

Exemplos de icones:

- andamento
- duvida/bloqueio
- concluido
- espera
- cancelado

do lado da mensagem bem um botão para incluir ícones emojis, se a mensagem for um follow-up , os ícones serão alterados para este contexto, com uma breve descrição e um ícone.

### Listas principais

O botao Follow-up da sala deve permitir ver (a cada click navega para o próximo item follow-up):

- **Minhas pendencias**: follow-ups em que sou responsavel.
- **Solicitados por mim**: follow-ups que eu criei.


## Fase 2 - task-followup

### Quando usar

Usar quando o acompanhamento simples nao e suficiente.

Sinais de que deve virar task-followup:

- precisa de responsavel principal claro;
- precisa de prazo;
- precisa de conversa separada;
- precisa de steps;
- precisa de aprovacao;
- envolve custo ou uso de LLM;
- tem bloqueio real;
- precisa aparecer em Tasks;
- precisa de task-room.

### Caracteristicas

- Cria ou usa uma task.
- Pode aparecer na aba Tasks.
- Pode ter task-room.
- Pode ter conversa com LLM/agente.
- Pode ter steps.
- Pode ter controle de custo.
- Mantem referencia para a mensagem original.
- Preserva o historico do message-followup.

## Migracao de message-followup para task-followup

Ao clicar em **Converter em task-followup**, o sistema deve abrir um novo cenario pedindo mais informacoes.

Nao deve converter automaticamente sem confirmar os dados, porque task-followup precisa de estrutura adicional.

### Dados pedidos na migracao

Obrigatorios no MVP da migracao:

- titulo da task;
- responsavel principal;
- participantes/responsaveis adicionais;
- descricao/contexto;
- mensagem original;
- status inicial;

Futuros ou opcionais:

- prazo;
- prioridade;
- steps;
- checklist;
- custo estimado;
- agente/LLM responsavel;
- criterio de aceite;
- permissao da task-room;

### Fluxo de migracao

1. Usuario abre o cenario do message-followup.
2. Clica em **Converter em task**.
3. Sistema abre novo cenario de migracao.
4. Sistema preenche dados sugeridos:
   - titulo derivado da mensagem;
   - responsaveis vindos do follow-up;
   - descricao com mensagem original;
   - historico do follow-up.
5. Usuario revisa e completa informacoes.
6. Sistema cria task-followup.
7. Message-followup passa a mostrar que foi convertido.
8. A task-followup vira a fonte principal do acompanhamento.

## Fonte da verdade

Antes da migracao:

- a mensagem e o message-followup sao a fonte da verdade.

Depois da migracao:

- a task-followup e a fonte da verdade;
- a mensagem original mostra um link/status para a task;
- o historico anterior continua visivel.

## Casos de uso

### Comando rapido

Mensagem:

> @Maria liga para o Joao e diz que vou atrasar.

Comportamento:

- cria message-followup;
- Maria marca "vou fazer";
- Maria marca "concluido";
- nao cria task.

### Desenvolvimento com LLM

Mensagem:

> @Kai analise por que o billing esta cobrando errado e proponha correcao.

Comportamento:

- cria message-followup para o agente Kai;
- Kai pode marcar em andamento ou bloqueado;
- se precisar de plano, custo ou steps, converte para task-followup;
- task-followup passa a concentrar conversa com LLM, steps e historico.

### Varias mentions

Mensagem:

> @Maria liga para @Joao e avisa que vou atrasar.

Comportamento:

- Maria e Joao aparecem como candidatos;
- solicitante escolhe quem e responsavel (somente na fase 2, fase 1 todos são responsáveis);
- se Maria for responsavel e Joao apenas contexto, Joao pode ser removido;
- o sistema nao deve assumir automaticamente que toda mention e responsavel.

## Decisoes de escopo

Para o MVP:

- implementar apenas message-followup;
- permitir conversao para task-followup como fluxo definido, mesmo que a task-followup completa venha depois;
- nao incluir prazo em message-followup;
- nao incluir lembrete automatico;
- nao incluir checklist;
- nao incluir steps no message-followup;
- nao criar task-room automaticamente.

Para etapa futura:

- task-followup com task-room;
- steps;
- prazos;
- controle de custo;
- conversa com LLM;
- permissoes avancadas;
- administracao de participantes.

## Criterios de aceite iniciais

- Uma mensagem com mentions pode receber follow-up.
- Mentions sao sugeridas como responsaveis.
- O solicitante pode ajustar responsaveis antes de criar.
- Cada responsavel tem um status proprio.
- A mensagem mostra icones de status de follow-up.
- Existe historico simples.
- Existe visao de minhas pendencias.
- Existe visao de solicitados por mim.
- Existe acao de converter para task-followup.
- A conversao abre um novo cenario pedindo dados adicionais.
