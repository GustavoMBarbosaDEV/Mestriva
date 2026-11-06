# Mudanças

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
