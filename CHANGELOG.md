# Mudanças

## 0.3.0 — conteúdo e tutor sem IA (ainda não publicada)

**O que mudou**
- Banco do Mestriva: 15 matérias comuns a muitos cursos, cada uma com 6 tópicos (resumo e revisão) e 30 questões explicadas, 450 no total. Ele fica no próprio site e funciona sem internet depois da primeira abertura.
- Quiz: junta questões do banco e cartões do estudante, prioriza as vencidas e as erradas (repetição espaçada de 1, 3, 7 e 15 dias), mostra explicação e tem "Reportar erro nesta questão" (e-mail para o contato).
- Revisão do que errei (Notas e resultado do quiz) montada no aparelho, com as seções: O que aconteceu, Reconstruindo a base, Passo a passo, Treino rápido e Plano de 3 dias.
- Cartões, lacunas e questões gerados das anotações do estudante.
- Estudar mostra o material pronto do banco das matérias da grade; a Grade mostra o selo "Conteúdo pronto".
- Tutor por regras: métodos de estudo (com adaptação para TDAH), plano da semana, agenda, médias, quanto falta tirar e resumo dos conteúdos do banco.
- Quiz e material mostram blocos de código (perguntas de programação).

**Correções da revisão do plano 2**
- Sem rolagem lateral no celular com títulos longos (Calendário, Notas, Estudar, Hoje).
- O painel do sino fecha ao tocar fora ou no próprio sino.
- Material de estudo pode ser salvo sem matérias na grade.

**O que foi testado**
- 192 testes automáticos, incluindo a validação das 450 questões (4 alternativas, 1 correta, explicação, sem repetição, todo tópico com 4+ questões, 20%+ de aplicação/análise, gabarito distribuído). Checagem de tipos limpa.
- No navegador: quiz completo (grade ligada ao banco, explicação, reportar, resultado e revisão), quiz só com cartões do estudante, revisão a partir de Notas, material do banco em Estudar, selo na Grade e tutor com perguntas reais; sem rolagem lateral em 390 px.

**O que não foi testado**
- Revisão humana das questões (lançamento com checagens automáticas, como decidido).
- A IA embutida do Chrome: ainda não aceita português, por isso o tutor usa só regras.

## 0.2.0 — telas reais no modo local (ainda não publicada)

**O que mudou**
- Onboarding, Hoje, Calendário, Grade curricular, Estudar (com Pomodoro e modo foco), Notas e Ajustes, com o visual do Mestriva.
- Sino de lembretes dos próximos 7 dias, com notificação do navegador (uma vez por dia por compromisso).
- Material de estudo do próprio estudante (markdown seguro), leitura em voz alta e ditado por voz.
- Ajustes: backup (baixar e restaurar, com validação) e apagar os dados do aparelho.
- Novidades da versão mostradas uma vez para quem já usava.
- Gerar quiz, gerar revisão, importar grade por arquivo e o tutor aparecem, mas avisam que chegam na próxima etapa.

**Correções**
- Data só com o dia (notas) não volta mais um dia no fuso do Brasil.
- Painel do sino não sai da tela no celular; a faixa de avisos (toast) não bloqueia mais os toques no cabeçalho.
- Painel Hoje sem rolagem horizontal no celular com títulos longos.
- "Rever o questionário inicial" volta a funcionar com o perfil completo.

**O que foi testado**
- 143 testes automáticos (`node --test "testes/*.test.mjs"`) e checagem de tipos limpa.
- No navegador: fluxo completo de cada tela em 390×844 e 1280×800, claro e escuro; com 60 matérias, 200 eventos e 40 notas, sem rolagem horizontal (390, 768, 1280) e sem erros no console; texto com HTML aparece como texto em todas as telas.

**O que não foi testado**
- Notificações do navegador de verdade (precisa de permissão manual) e ditado por voz (precisa de microfone).
- Firebase, quiz, tutor e importação por arquivo (próximos planos).

## 0.1.0 — base do app (ainda não publicada)

**O que mudou**
- Mestriva em HTML, CSS e JavaScript puro (módulos do navegador), sem React e sem build no dia a dia.
- Casca visual: menu lateral no computador, cabeçalho e barra inferior no celular, tema claro e escuro.
- Menu de acessibilidade (tamanho do texto, alto contraste, fonte para dislexia, espaçamento, menos animação, filtros de daltonismo), salvas no aparelho.
- Rotas com as mesmas regras de acesso: perfil incompleto vai para o onboarding; endereço desconhecido mostra "Página não encontrada".
- Dados guardados no aparelho, com leitura tolerante de dado antigo ou corrompido e aviso quando não dá para salvar.
- Instala como app (PWA), funciona sem internet e avisa quando há versão nova ("Atualizar" / "Depois").
- Fontes e ícones no próprio site (sem Google Fonts).

**Por quê**
Deixar o app grátis de manter, rápido, privado e funcionando sem internet, seguindo o padrão do Monetra.

**O que foi testado**
- 87 testes automáticos (`node --test "testes/*.test.mjs"`): escape de HTML, normalizadores, loja, preferências, rotas, controles, casca, PWA, ferramentas.
- No navegador, em 1280×800 e 390×844, claro e escuro: navegação sem recarregar, voltar do navegador, recarregar em `/calendario`, menu de acessibilidade (foco preso, Esc, clique fora, preferências mantidas), texto em 145% sem rolagem horizontal, página 404, uso sem internet e aviso de nova versão com troca de cache.

**O que não foi testado**
- Firebase (login e dados na conta): chega no plano 3.
- As telas reais (Hoje, Calendário, Grade, Estudar, Quiz, Notas, Tutor, Ajustes, onboarding, landing e login): por enquanto são provisórias.
- Instalação no celular de verdade e APK.
