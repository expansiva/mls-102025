# Novas Implementacoes - mls-102025

## Resumo

Este plano cobre cinco ajustes de UX no `mls-102025`, focados em navegacao do toolbar, chamadas de atencao para confirmacao de leitura, compactacao de blocos longos de codigo/texto tecnico, limpeza de notificacoes enquanto o usuario esta dentro da sala e onboarding contextual das funcionalidades do toolbar.

Escala de esforco:
- P: ate 0,5 dia
- M: 1 a 2 dias
- G: 3 a 5 dias

## 1. Highlight ao navegar pelo toolbar

### Status

Implementado em 2026-05-26.

### Analise

Hoje o toolbar controla a posicao navegada em `toolbarView`, e a navegacao passa por `navigateToolbarItem()` e `scrollToMessageId()`. O destaque visual da mensagem existe de forma limitada pela classe `pinned` no card da mensagem, entao o pin fica mais claro que favoritos, confirmacoes e anexos.

### Proposta

Criar um destaque generico de navegacao, independente do tipo de item:
- adicionar estado `highlightedMessageId` no chat;
- ao navegar por `pins`, `saved`, `readReceipts` ou `attachments`, setar o `highlightedMessageId`;
- passar para cada `collab-messages-chat-message-102025` uma propriedade booleana, por exemplo `toolbarHighlighted`;
- aplicar classe no card da mensagem com borda de 2px e cor de destaque;
- limpar o destaque quando o usuario fizer scroll manual, trocar de sala ou limpar selecao do toolbar.

### Esforco

P. A estrutura de navegacao ja existe; falta generalizar o destaque visual.

### Criterios de aceite

- Navegar em favoritos realca a mensagem.
- Navegar em confirmacoes de leitura realca a mensagem.
- Navegar em anexos realca a mensagem.
- Navegar em agente resumo realca a mensagem.
- O destaque desaparece ao usuario rolar manualmente.
- O pin continua funcionando, mas usando o mesmo padrao visual.

## 2. Chamar atencao para confirmacao de leitura pendente

### Status

Implementado em 2026-05-26.

### Analise

O toolbar ja sabe quando ha confirmacoes pendentes pelo metodo `hasPendingReadConfirmationsForThread()`, e o item de confirmacoes ja pode ficar como `important`. O problema e que o usuario pode nao perceber que precisa agir.

### Proposta

Adicionar uma animacao leve apenas quando houver confirmacao de leitura pendente para o usuario atual:
- aplicar classe `attention` no botao de confirmacoes do toolbar quando `hasPendingReadConfirmationsForThread()` for verdadeiro;
- usar animacao de pulso sutil em borda/sombra, sem mexer no layout;
- limitar a animacao ao icone/borda do botao, evitando piscar texto ou mudar tamanho;
- parar a animacao quando nao houver mais pendencias.

Opcional em segunda etapa:
- adicionar um pequeno tooltip mais direto: `Voce tem confirmacoes de leitura pendentes`.

### Esforco

P. A deteccao da pendencia ja existe; o ajuste principal e CSS e classe condicional.

### Criterios de aceite

- Usuario com confirmacao pendente ve o botao de confirmacao pulsar de forma discreta.
- Usuario sem pendencia nao ve animacao.
- A animacao nao desloca outros botoes do toolbar.
- A animacao para imediatamente apos confirmar leitura ou cancelar a pendencia.

## 3. Compactar blocos grandes com triple backticks

### Status

Implementado em 2026-05-26.

### Analise

Mensagens com triple backticks sao renderizadas por `collabMessagesRichPreviewText.ts`, que cria `collab-md-codeblock-card` e renderiza o conteudo em `collab-messages-text-code-102025`. Quando o bloco e muito grande, a mensagem ocupa muito espaco e dificulta leitura da conversa.

### Proposta

Adicionar modo colapsavel para blocos de codigo longos:
- se o bloco tiver mais de 3 linhas, renderizar inicialmente apenas as 3 primeiras linhas;
- mostrar acao `ver mais` para expandir o bloco;
- apos expandir, mostrar `ver menos`;
- manter botao `Copiar` sempre disponivel para copiar o bloco completo;
- preservar o conteudo completo no DOM apenas quando expandido, para nao poluir visualmente a thread;
- aplicar limite visual tambem por altura maxima, para proteger casos de linhas muito longas.

### Esforco

M. O parser e o renderer ja existem, mas sera necessario controlar estado por bloco renderizado e garantir que a copia use sempre o texto integral.

### Criterios de aceite

- Bloco com ate 3 linhas aparece completo.
- Bloco com mais de 3 linhas aparece compacto com `ver mais`.
- `ver mais` expande sem perder formatacao.
- `ver menos` recolhe novamente.
- `Copiar` copia o bloco completo mesmo quando recolhido.

## 4. Limpar notificacao da sala aberta ao ler ate o final

### Status

Implementado em 2026-05-26.

### Analise

As notificacoes pendentes sao controladas em `collabMessagesSyncNotifications.ts`. No chat, o scroll ja detecta quando o usuario chegou ao final e o estado local de nao lidas pode ser limpo por `markThreadReadLocally()`. O problema relatado indica que, quando uma notificacao chega com a sala aberta, a notificacao visual pode continuar ate sair e entrar de novo.

### Proposta

Quando o usuario estiver na sala da notificacao e fizer scroll ate o final:
- chamar `markThreadReadLocally(threadId, lastMessageCreateAt)` para a thread atual;
- limpar tambem qualquer alvo pendente de notificacao desta thread;
- atualizar indicador global de notificacao;
- notificar a lista de threads para remover ponto/contador pendente sem exigir sair e entrar.

Importante:
- nao limpar notificacao apenas por receber a mensagem;
- limpar somente quando o usuario chegar ao final da thread ou enviar mensagem na propria sala.

### Esforco

M. Parte da base ja existe, mas precisa integrar o caso de notificacao recebida enquanto a sala esta aberta e garantir que o indicador global seja atualizado.

### Criterios de aceite

- Receber notificacao dentro da sala mostra pendencia.
- Rolar ate o final remove a pendencia da sala.
- A lista de threads atualiza sem sair/entrar.
- O favicon/indicador global tambem atualiza se nao houver outras pendencias.
- Notificacoes de task-room continuam respeitando o fluxo atual.

## 5. Onboarding contextual no toolbar

### Status

Implementado em 2026-05-26.

### Analise

Os botoes do toolbar tem tooltip simples por `title`, mas funcionalidades como favoritos, pins, confirmacoes e anexos podem nao ser descobertas pelos usuarios. O padrao recente de `forwardMessage` usa um cenario proprio dentro da mesma tela, o que pode ser reaproveitado para telas de ajuda.

### Opcoes

Opcao recomendada: menu contextual simples por botao
- clique normal no botao continua navegando entre itens;
- clique em seta pequena ou menu secundario abre opcoes;
- opcoes iniciais: `Sobre este recurso` e, quando fizer sentido, `Ver todos`;
- `Sobre este recurso` abre um cenario interno de ajuda;
- o cenario usa header com voltar, igual ao encaminhamento.

Opcao alternativa: long press / clique direito
- evita adicionar elemento visual novo;
- menos descobrivel em desktop e ruim em mobile.

Opcao alternativa: primeiro uso guiado
- mostrar dica automatica na primeira vez que o usuario entra em uma sala com itens no toolbar;
- bom para onboarding, mas pode incomodar e exige controle de preferencia local.

### Proposta

Implementar a opcao recomendada ajustada:
- criar novo cenario `toolbarHelp`;
- guardar `toolbarHelpKind` com o tipo: `pins`, `saved`, `readReceipts`, `attachments`, `agent`;
- renderizar titulo, descricao curta e acoes principais do recurso;
- iniciar com conteudo estatico em i18n;
- manter os tooltips simples para uso rapido;
- sem adicionar icone/dropdown extra no toolbar;
- quando o botao nao tiver itens para navegar, o clique abre o cenario de ajuda do recurso;
- quando o botao tiver itens, o clique principal continua navegando normalmente.

### Análise 

A proposta de menu contextual simples é boa, mas sem alterar o botão com um ícone de dropdown, ou seja, se clicar e não tiver itens para navegar , neste caso abrir o popup. Uma solução interessante também é abrir o popup menu no passar o mouse em cima, mas só se o sistema usa o dropdown nativo (select ou outro) do browser, porque em algumas páginas acontece do menu ficar 'presso'. Analisar novamente. 

### Esforco

M. A estrutura de cenario ja existe e pode seguir o padrao do encaminhamento, mas exige desenho cuidadoso para nao poluir o toolbar.

### Criterios de aceite

- Usuario consegue abrir ajuda de cada item do toolbar quando nao ha itens para navegar.
- A ajuda abre na mesma area da tela e volta para a sala.
- O clique principal do toolbar continua navegando normalmente.
- Textos estao em portugues e ingles.
- O layout continua compacto em largura de 375px.

## Priorizacao sugerida

1. Highlight generico do toolbar - P - implementado
2. Pulso em confirmacao de leitura pendente - P - implementado
3. Limpeza de notificacao ao chegar ao fim da sala - M - implementado
4. Compactacao de blocos com triple backticks - M - implementado
5. Onboarding contextual do toolbar - M - implementado

## Riscos e observacoes

- O destaque do toolbar deve usar estado temporario e nao gravar nada no backend.
- A animacao de confirmacao deve ser discreta para nao parecer alerta critico permanente.
- Compactar blocos de codigo deve preservar copia integral e acessibilidade.
- Limpeza de notificacao deve diferenciar mensagem realmente lida de mensagem apenas recebida.
- Onboarding no toolbar precisa ser util sem transformar a interface em um menu pesado.

## Futuros ajustes para análise

- se um usuário dá um joinha (emoji) , é recebido uma notificação com som, no caso poderia ser modo silencioso
- o menu popup da mensagem, geralmente abre bem para baixo, mas algumas vezes abre para cima e fica cortado, verificar como pode ser resolvido

Status: nao implementado nesta rodada; manter para analise futura.
