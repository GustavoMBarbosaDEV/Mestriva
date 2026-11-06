# Identidade visual do Mestriva

## Símbolo

Um **"M" que sobe para a direita** — a perna da direita é mais alta, como uma curva de progresso — com um **ponto no topo**: a meta alcançada (e o "i" de mestr**i**va). Desenhado num quadrado de cantos arredondados.

- Arquivo: `icons/favicon.svg` (vetor), `icons/icon-192.png`, `icons/icon-512.png`, `icons/maskable-512.png`, `icons/apple-touch-icon.png`. Gerados por `ferramentas/icones-png.mjs`.
- No app: `simbolo(classe)` em `js/ui/marca.js` (no tema escuro ganha contorno sutil e o ponto mais claro).
- Área de respiro: pelo menos 1/4 da largura do símbolo em volta. Tamanho mínimo: 16 px.
- Não distorcer, não trocar as cores do traço e do ponto, não colocar sombra no traço.

## Cores

| Nome | Hex | Uso |
|---|---|---|
| Tinta | `#0b1220` | fundo do símbolo, botões principais, texto principal |
| Lima | `#c6ff4f` | traço do símbolo, destaques sobre fundo escuro |
| Elétrico | `#3b5bff` | ponto do símbolo, links, foco, gráficos (no escuro: `#6f88ff`) |
| Tela | `hsl(210 22% 98%)` | fundo do tema claro |
| Noite | `hsl(222 40% 6%)` | fundo do tema escuro |

Tokens completos (claro e escuro) em `css/entrada.css`.

## Tipografia

- **Space Grotesk** (600–700): títulos e o nome "Mestriva".
- **Inter** (300–600): texto.
- **JetBrains Mono** (400–500): rótulos pequenos em caixa alta ("estudo com método", "próxima prova").
- **Atkinson Hyperlegible**: fonte para dislexia (ajuste de acessibilidade).

Todas servidas pelo próprio site (`fonts/`).

## Nome e assinatura

- Nome: **Mestriva** (sempre com M maiúsculo, o resto minúsculo).
- Assinatura: **estudo com método**.
- Tom: português do Brasil, direto e acolhedor, frases curtas, sem jargão.
