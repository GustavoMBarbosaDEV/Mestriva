# Segurança do Mestriva

## Como relatar uma falha

Achou uma falha de segurança? Escreva para **monetra.app26@gmail.com**, com o assunto "Segurança Mestriva".
Não abra uma issue pública: assim a falha não fica exposta antes de ser corrigida.

Conte o que encontrou, como reproduzir e o que dá para fazer com ela. A resposta vem em até 7 dias.
Testes só na sua própria conta e nos seus próprios dados; nada de tentar acessar dados de outras pessoas,
derrubar o site ou enviar spam.

## Versões atendidas

Só a versão publicada mais recente (a que o app mostra em Ajustes) recebe correções.

## Plano de incidente

1. **Conter.** Travar as regras do banco (`allow read, write: if false`), desabilitar contas suspeitas
   e revogar ou trocar qualquer chave vazada. Apagar o arquivo do git não desfaz um vazamento: a chave é trocada primeiro.
2. **Investigar.** O que foi acessado, quando e por onde (regra frouxa, segredo no git, falha no código).
3. **Corrigir** no branch `testes`, com os testes passando, e só então publicar.
4. **Comunicar** os usuários afetados com clareza. Pela LGPD, um incidente com risco relevante deve ser
   comunicado à ANPD e aos titulares (confira as orientações atuais no site da ANPD).
5. **Registrar** o que aconteceu e o que mudou, no CHANGELOG e nas notas do projeto.
