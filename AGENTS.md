leia sempre o arquivo de regras nextjs como referentecia para o projeto

padrao obrigatorio de componentizacao para paginas com tabs:

- nunca criar uma pagina unica com toda a logica de todas as tabs.
- cada tab deve ser um componente proprio com responsabilidade unica.
- cada componente de tab deve conter internamente:
  - estado local
  - chamadas de request
  - formularios (react hook form)
  - loading/skeleton
  - modais/dialogs
  - acoes de criar, editar e excluir quando existirem
- evitar prop drilling de handlers, estados e listas entre page e tabs.
- a page deve apenas orquestrar a estrutura de layout/navegacao (tabs) e renderizar os componentes das tabs.
- para fluxos distintos, manter componentes distintos (nao unificar com mode/create/edit em um mesmo componente principal).

padrao obrigatorio para arquivos page.tsx (next app router):

- nao criar page.tsx apenas como wrapper retornando um unico componente filho (ex.: return <AlgumPageContent />).
- manter no page.tsx a orquestracao principal da tela (estado da pagina, carregamento principal e composicao de blocos).
- extrair para componentes apenas blocos com responsabilidade clara (cards, tabelas, modais, formularios e skeletons).
