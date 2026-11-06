# Mudanças

## 0.4.1 — correções da revisão e Go Live (ainda não publicada)

- **Go Live (Live Server do VS Code):** o app abre em `/index.html`, recarregar em `/calendario` funciona (`.vscode/settings.json` devolve o index.html, como o Hosting) e o modo offline não liga em 127.0.0.1.
- **Service worker:** abrir a política de privacidade ou os termos não troca mais o app guardado para uso offline por essas páginas.
- **Importar grade:** ignora pré-requisitos (traço vazio ou códigos no fim), linhas só com códigos e cabeçalhos como "Coordenação do Curso"; entende "IIº Semestre", "Primeiro Semestre" e numeração sem traço.
- **Privacidade e termos:** dados técnicos de acesso do Hosting, dados sensíveis (acessibilidade), finalidade e tempo de guarda, transferência internacional; cláusula de responsabilidade "na medida permitida pela lei" (CDC). CSS das páginas com versão.
- **Tutor:** "dados" deixou de puxar Metodologia sem querer; "planejar a semana" volta a montar o plano.
- **Deploy:** sem a variável FIREBASE_PROJETO, o workflow pula com aviso claro.

**Testado:** testes automáticos (incluindo linhas reais de grade) e checagem de tipos. **Não testado:** o Go Live em si (feito para o Live Server; confira abrindo a pasta no VS Code).

## 0.4.0 — importar grade, landing e preparação para publicar (ainda não publicada)

**O que mudou**
- Importar a grade por **PDF** (pdf.js) ou **foto** (Tesseract), lendo tudo no aparelho: o app separa as matérias por período, tira código, carga horária e créditos, guarda o professor quando aparece, e o estudante confere e remove itens antes de salvar.
- **Landing** (herói, recursos, acessibilidade com demonstração do modo foco, chamada final), sem prometer IA.
- **Política de privacidade** e **Termos de uso** (responsável Gustavo M Barbosa, contato monetra.app26@gmail.com), robots.txt e sitemap.xml.
- **Publicação preparada:** firebase.json (dist/, endereços limpos, cabeçalhos de segurança, cache), workflows do GitHub (gitleaks, CodeQL, testes com build, deploy só com tudo verde) e Dependabot.
- **Tutor e quiz mais precisos** (correções da revisão dos planos 4 e 5): busca de tópicos única e criteriosa, sem confundir conteúdo com ajuda, média, agenda ou plano; nota-alvo lida do texto original; matéria de contexto primeiro, inclusive dentro dos resumos; link do tutor para o quiz abre a matéria da grade; título da prova não filtra o quiz por engano.

**O que foi testado**
- 204 testes automáticos e checagem de tipos limpa; build de publicação (vendor/ copiado sem alterar).
- No navegador: PDF gerado com uma grade de Direito (5 matérias, períodos e professor certos, remover e salvar, selo do banco); foto de uma grade de Administração (5 matérias reconhecidas em cerca de 1 s, todas ligadas ao banco); landing em 390 e 1280 px sem rolagem lateral; perguntas reais ao tutor.

**O que não foi testado**
- Foto tirada com celular de verdade (sombra, ângulo) e PDF escaneado sem texto.
- Publicação no Firebase Hosting e os workflows rodando no GitHub (dependem do projeto e do repositório, que são do dono).

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
