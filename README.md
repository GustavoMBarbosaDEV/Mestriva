# Mestriva

App de estudos para o ensino superior: grade curricular, provas e trabalhos, notas, quiz, material e tutor. Grátis, funciona sem internet e os dados ficam só com o estudante.

Feito em HTML, CSS e JavaScript puro (módulos do navegador), sem framework. O Node só é usado nas ferramentas de desenvolvimento e publicação.

## Rodar no computador

```bash
cd ferramentas
npm install
npm run serve
```

Abra http://localhost:5173.

## Testes

```bash
node --test testes/
```

## Ferramentas (`ferramentas/`)

| Comando | O que faz |
|---|---|
| `npm run css` | gera o `style.css` (rode depois de usar classes novas) |
| `npm run fontes` | copia as fontes para `fonts/` |
| `npm run icones` | gera `js/icones.js` |
| `npm run icones-png` | gera os ícones do app em `icons/` |
| `npm run bump -- X.Y.Z` | troca a versão em todos os lugares |
| `npm run build` | monta `dist/` para publicar |
