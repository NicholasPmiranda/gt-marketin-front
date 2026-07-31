# Documentacao de Endpoints - Dados de Reuniao

## Listar dados de reuniao

### GET /api/dados-reuniao

Lista os registros de dados de reuniao com paginacao, ordenados pelos mais recentes. O campo `conteudo` nao e retornado nesta listagem.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Resposta (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "data": "2026-07-31",
      "created_at": "2026-07-31T18:00:00.000000Z",
      "updated_at": "2026-07-31T18:00:00.000000Z"
    }
  ],
  "links": [],
  "meta": {}
}
```

**Erros:**
- `401` - Nao autenticado

---

## Criar dado de reuniao

### POST /api/dados-reuniao

Cria um novo registro de dados de reuniao automaticamente, sem receber dados do usuario. A data e preenchida com a data atual e o conteudo inicia vazio.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Corpo da Requisicao:**
- Nenhum. O endpoint nao recebe input do usuario.

**Resposta (201):**
```json
{
  "id": 1,
  "data": "2026-07-31",
  "conteudo": "",
  "created_at": "2026-07-31T18:00:00.000000Z",
  "updated_at": "2026-07-31T18:00:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado

---

## Listar projetos ativos

### GET /api/dados-reuniao/projetos-ativos

Lista apenas o `id` e o `nome` dos projetos ativos, para uso no contexto de criacao de tarefas do dado de reuniao.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Permissao:**
- `projeto-acessar`

**Resposta (200):**
```json
[
  {
    "id": 8,
    "nome": "Campanha Institucional"
  }
]
```

**Erros:**
- `401` - Nao autenticado
- `403` - Sem permissao para esta operacao

---

## Detalhar dado de reuniao

### GET /api/dados-reuniao/{dadosReuniao}

Retorna o registro completo, incluindo o conteudo em Markdown.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `dadosReuniao` - ID do dado de reuniao

**Resposta (200):**
```json
{
  "id": 1,
  "data": "2026-07-31",
  "conteudo": "# Ata da reuniao\n\nPontos discutidos...",
  "created_at": "2026-07-31T18:00:00.000000Z",
  "updated_at": "2026-07-31T18:30:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Dado de reuniao nao encontrado

---

## Atualizar conteudo (Markdown)

### POST /api/dados-reuniao/update-{dadosReuniao}

Atualiza apenas o conteudo Markdown do dado de reuniao.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `dadosReuniao` - ID do dado de reuniao

**Corpo da Requisicao:**
```json
{
  "conteudo": "# Ata da reuniao\n\nPontos discutidos..."
}
```

**Regras de Validacao:**
- `conteudo` - obrigatorio, string (texto Markdown)

**Resposta (200):**
```json
{
  "id": 1,
  "data": "2026-07-31",
  "conteudo": "# Ata da reuniao\n\nPontos discutidos...",
  "created_at": "2026-07-31T18:00:00.000000Z",
  "updated_at": "2026-07-31T18:30:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Dado de reuniao nao encontrado
- `422` - Erro de validacao dos dados

---

## Listar tarefas do dado de reuniao por projeto

### GET /api/dados-reuniao/{dadosReuniao}/tarefas

Lista as tarefas vinculadas ao mesmo tempo ao dado de reuniao (ata) e ao projeto informados, retornando `id`, `nome` (titulo) e `status`, sem paginacao.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Permissao:**
- `tarefa-acessar`

**Parametros de URL:**
- `dadosReuniao` - ID do dado de reuniao (ata)

**Parametros de Query:**
- `projeto_id` - obrigatorio, ID do projeto

**Regras de Validacao:**
- `projeto_id` - obrigatorio, inteiro, deve existir em `projetos.id`

**Resposta (200):**
```json
[
  {
    "id": 77,
    "nome": "Enviar proposta revisada",
    "status": "pendente"
  },
  {
    "id": 78,
    "nome": "Ajustar apresentacao",
    "status": "finalizado"
  }
]
```

**Observacao:**
- Concluida quando `status` for `finalizado`.

**Erros:**
- `401` - Nao autenticado
- `403` - Sem permissao para esta operacao
- `404` - Dado de reuniao nao encontrado
- `422` - Erro de validacao dos dados

---

## Criar tarefa no dado de reuniao

### POST /api/dados-reuniao/{dadosReuniao}/tarefas

Cria uma tarefa vinculada ao dado de reuniao. A tarefa tambem aparece nas listagens gerais de tarefas.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Permissao:**
- `tarefa-criar`

**Parametros de URL:**
- `dadosReuniao` - ID do dado de reuniao

**Corpo da Requisicao:**
```json
{
  "projeto_id": 8,
  "nome": "Enviar proposta revisada"
}
```

**Regras de Validacao:**
- `projeto_id` - obrigatorio, inteiro, deve existir em `projetos.id`
- `nome` - obrigatorio, string, maximo 255 caracteres

**Regras de negocio:**
- O projeto informado precisa estar ativo
- A tarefa e criada com `status` `pendente`, `prioridade` `baixa` e `dados_reuniao_id` do registro informado

**Resposta (201):**
```json
{
  "id": 77,
  "projeto_id": 8,
  "dados_reuniao_id": 1,
  "nome": "Enviar proposta revisada",
  "descricao": null,
  "status": "pendente",
  "ordem_kanban": 0,
  "prioridade": "baixa",
  "created_at": "2026-07-31T18:40:00.000000Z",
  "updated_at": "2026-07-31T18:40:00.000000Z"
}
```

**Erros:**
- `400` - O projeto informado nao esta ativo
- `401` - Nao autenticado
- `403` - Sem permissao para esta operacao
- `404` - Projeto ou dado de reuniao nao encontrado
- `422` - Erro de validacao dos dados

---

## Atualizar titulo da tarefa

### POST /api/dados-reuniao/{dadosReuniao}/tarefas/update-{tarefa}

Atualiza apenas o titulo (`nome`) da tarefa vinculada ao dado de reuniao.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Permissao:**
- `tarefa-gerenciar`

**Parametros de URL:**
- `dadosReuniao` - ID do dado de reuniao
- `tarefa` - ID da tarefa

**Corpo da Requisicao:**
```json
{
  "nome": "Enviar proposta revisada e alinhar prazos"
}
```

**Regras de Validacao:**
- `nome` - obrigatorio, string, maximo 255 caracteres

**Regras de negocio:**
- A tarefa precisa pertencer ao dado de reuniao informado na URL

**Resposta (200):**
```json
{
  "id": 77,
  "projeto_id": 8,
  "dados_reuniao_id": 1,
  "nome": "Enviar proposta revisada e alinhar prazos",
  "status": "pendente",
  "prioridade": "baixa"
}
```

**Erros:**
- `401` - Nao autenticado
- `403` - Sem permissao para esta operacao
- `404` - Tarefa nao pertence a este dado de reuniao
- `422` - Erro de validacao dos dados

---

## Concluir tarefa

### POST /api/dados-reuniao/{dadosReuniao}/tarefas/completar-{tarefa}

Marca a tarefa como concluida (`status` = `finalizado`) e preenche a data de fim.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Permissao:**
- `tarefa-gerenciar`

**Parametros de URL:**
- `dadosReuniao` - ID do dado de reuniao
- `tarefa` - ID da tarefa

**Corpo da Requisicao:**
- Nenhum.

**Regras de negocio:**
- A tarefa precisa pertencer ao dado de reuniao informado na URL
- Se a tarefa ja estiver concluida, retorna erro

**Resposta (200):**
```json
{
  "id": 77,
  "projeto_id": 8,
  "dados_reuniao_id": 1,
  "nome": "Enviar proposta revisada e alinhar prazos",
  "status": "finalizado",
  "fim": "2026-07-31T19:00:00.000000Z",
  "prioridade": "baixa"
}
```

**Erros:**
- `400` - A tarefa ja esta concluida
- `401` - Nao autenticado
- `403` - Sem permissao para esta operacao
- `404` - Tarefa nao pertence a este dado de reuniao
