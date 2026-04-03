# Documentacao de Endpoints - Tarefas

## Listar tarefas

### GET /api/tarefa

Lista tarefas com paginacao (50 por pagina), com filtro opcional por projeto, incluindo projeto, responsaveis e etiquetas.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de Query:**
- `projeto_id` (opcional) - ID do projeto para filtrar tarefas
- `search` (opcional) - filtra por nome ou descricao
- `status` (opcional) - filtra por status (`pendente`, `revisao`, `em andamento`, `finalizado`)
- `prioridade` (opcional) - filtra por prioridade (`baixa`, `media`, `alta`)
- `responsavel_id` (opcional) - ID do responsavel vinculado a tarefa
- `agendamento` (opcional) - filtra pela data de agendamento (`YYYY-MM-DD`)
- `inicio` (opcional) - filtra pela data de inicio (`YYYY-MM-DD`)
- `fim` (opcional) - filtra pela data de fim (`YYYY-MM-DD`)

**Resposta (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 10,
      "projeto_id": 1,
      "tarefa_pai_id": null,
      "nome": "Criar layout",
      "descricao": "Tela inicial",
      "status": "em andamento",
      "agendamento_inicio": "2026-04-03T14:00:00.000000Z",
      "agendamento_fim": null,
      "projeto": {
        "id": 1,
        "nome": "Novo Site"
      },
      "responsaveis": [
        {
          "id": 2,
          "name": "Ana Souza"
        }
      ],
      "etiquetas": [
        {
          "id": 1,
          "nome": "Urgente"
        }
      ]
    }
  ],
  "links": [],
  "meta": {}
}
```

**Erros:**
- `401` - Nao autenticado

---

## Listar tarefas para kanban

### GET /api/tarefa/kanban

Lista tarefas sem paginacao, com filtro opcional por projeto e agrupadas por `status` para uso em quadro kanban.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de Query:**
- `projeto_id` (opcional) - ID do projeto para filtrar tarefas
- `search` (opcional) - filtra por nome ou descricao

**Resposta (200):**
```json
{
  "pendente": [
    {
      "id": 10,
      "projeto_id": 1,
      "nome": "Criar layout",
      "descricao": "Tela inicial",
      "status": "pendente",
      "agendamento_inicio": null,
      "agendamento_fim": null,
      "projeto": {
        "id": 1,
        "nome": "Novo Site"
      },
      "responsaveis": [
        {
          "id": 2,
          "name": "Ana Souza"
        }
      ],
      "etiquetas": [
        {
          "id": 1,
          "nome": "Urgente"
        }
      ]
    }
  ],
  "em andamento": [
    {
      "id": 11,
      "projeto_id": 1,
      "nome": "Ajustar SEO",
      "descricao": "Meta tags",
      "status": "em andamento",
      "agendamento_inicio": "2026-04-03T15:00:00.000000Z",
      "agendamento_fim": null,
      "projeto": {
        "id": 1,
        "nome": "Novo Site"
      },
      "responsaveis": [
        {
          "id": 3,
          "name": "Carlos Lima"
        }
      ],
      "etiquetas": [
        {
          "id": 2,
          "nome": "Backlog"
        }
      ]
    }
  ]
}
```

**Erros:**
- `401` - Nao autenticado

---

## Criar tarefa/subtarefa

### POST /api/tarefa

Cria tarefa ou subtarefa (quando `tarefa_pai_id` for enviado), com responsaveis e etiquetas.
Tambem permite criacao por modelo com `tarefa_modelo_id`.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Corpo da Requisicao:**
```json
{
  "projeto_id": 1,
  "tarefa_pai_id": null,
  "tarefa_modelo_id": null,
  "nome": "Criar layout",
  "descricao": "Tela inicial",
  "status": "pendente",
  "responsavel_ids": [2, 3],
  "etiqueta_ids": [1]
}
```

**Corpo da Requisicao (criacao por modelo):**
```json
{
  "projeto_id": 1,
  "tarefa_pai_id": null,
  "tarefa_modelo_id": 4
}
```

**Regras de Validacao:**
- `projeto_id` - obrigatorio, inteiro, deve existir em `projetos.id`
- `tarefa_pai_id` - opcional, inteiro, deve existir em `tarefas.id`
- `tarefa_modelo_id` - opcional, inteiro, deve existir em `tarefa_modelos.id`
- `nome` - obrigatorio quando `tarefa_modelo_id` nao for enviado, string, maximo 255 caracteres
- `descricao` - opcional, string
- `status` - obrigatorio quando `tarefa_modelo_id` nao for enviado, string, valores permitidos: `pendente`, `revisao`, `em andamento`, `finalizado`
- `responsavel_ids` - obrigatorio quando `tarefa_modelo_id` nao for enviado, array, minimo 1 item
- `responsavel_ids.*` - inteiro, deve existir em `users.id`
- `etiqueta_ids` - opcional, array
- `etiqueta_ids.*` - inteiro, deve existir em `etiquetas.id`

**Regra de negocio (criacao por modelo):**
- Quando `tarefa_modelo_id` for enviado, os dados da tarefa sao copiados do modelo base.
- Nesse fluxo, o sistema usa do modelo: `nome`, `descricao`, `status`, `responsaveis` e `etiquetas`.
- Os campos manuais de conteudo da tarefa deixam de ser obrigatorios nesse caso.

**Resposta (201):**
```json
{
  "id": 10,
  "projeto_id": 1,
  "tarefa_pai_id": null,
  "nome": "Criar layout",
  "descricao": "Tela inicial",
  "status": "pendente",
  "agendamento_inicio": null,
  "agendamento_fim": null,
  "responsaveis": [
    {
      "id": 2,
      "name": "Ana Souza"
    }
  ],
  "etiquetas": [
    {
      "id": 1,
      "nome": "Urgente"
    }
  ]
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Modelo de tarefa nao encontrado
- `422` - Erro de validacao dos dados

---

## Detalhar tarefa

### GET /api/tarefa/{tarefa}

Retorna tarefa com projeto, subtarefas, responsaveis, etiquetas e comentarios com usuario.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `tarefa` - ID da tarefa

**Resposta (200):**
```json
{
  "id": 10,
  "projeto_id": 1,
  "tarefa_pai_id": null,
  "nome": "Criar layout",
  "descricao": "Tela inicial",
  "status": "em andamento",
  "agendamento_inicio": "2026-04-03T14:00:00.000000Z",
  "agendamento_fim": null,
  "subtarefas": [
    {
      "id": 12,
      "projeto_id": 1,
      "tarefa_pai_id": 10,
      "nome": "Criar versao mobile",
      "descricao": "Adaptar para celular",
      "status": "pendente"
    }
  ],
  "responsaveis": [
    {
      "id": 2,
      "name": "Ana Souza"
    }
  ],
  "etiquetas": [
    {
      "id": 1,
      "nome": "Urgente"
    }
  ],
  "comentarios": [
    {
      "id": 50,
      "comentario": "Ajustar copy",
      "user": {
        "id": 2,
        "name": "Ana Souza"
      }
    }
  ]
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado

---

## Atualizar tarefa

### POST /api/tarefa/update-{tarefa}

Atualiza dados da tarefa e sincroniza responsaveis/etiquetas.

**Regra de negocio (agendamento):**
- Ao mover para `em andamento`, o sistema grava `agendamento_inicio` com data/hora atual.
- Ao mover para `finalizado`, o sistema grava `agendamento_fim` com data/hora atual.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `tarefa` - ID da tarefa

**Corpo da Requisicao:**
```json
{
  "projeto_id": 1,
  "tarefa_pai_id": null,
  "nome": "Criar layout home",
  "descricao": "Tela inicial atualizada",
  "status": "revisao",
  "responsavel_ids": [2],
  "etiqueta_ids": [1, 2]
}
```

**Regras de Validacao:**
- `projeto_id` - obrigatorio, inteiro, deve existir em `projetos.id`
- `tarefa_pai_id` - opcional, inteiro, deve existir em `tarefas.id`
- `nome` - obrigatorio, string, maximo 255 caracteres
- `descricao` - opcional, string
- `status` - obrigatorio, string, valores permitidos: `pendente`, `revisao`, `em andamento`, `finalizado`
- `responsavel_ids` - obrigatorio, array, minimo 1 item
- `responsavel_ids.*` - inteiro, deve existir em `users.id`
- `etiqueta_ids` - opcional, array
- `etiqueta_ids.*` - inteiro, deve existir em `etiquetas.id`

**Resposta (200):**
```json
{
  "id": 10,
  "nome": "Criar layout home",
  "status": "revisao",
  "agendamento_inicio": "2026-04-03T14:00:00.000000Z",
  "agendamento_fim": null
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado
- `422` - Erro de validacao dos dados

---

## Atualizar somente status da tarefa

### POST /api/tarefa/update-status-{tarefa}

Atualiza somente o campo `status` da tarefa. Endpoint indicado para fluxo de kanban (arrastar e soltar entre colunas).

**Regra de negocio (agendamento):**
- Ao mover para `em andamento`, o sistema grava `agendamento_inicio` com data/hora atual.
- Ao mover para `finalizado`, o sistema grava `agendamento_fim` com data/hora atual.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `tarefa` - ID da tarefa

**Corpo da Requisicao:**
```json
{
  "status": "em andamento"
}
```

**Regras de Validacao:**
- `status` - obrigatorio, string, valores permitidos: `pendente`, `revisao`, `em andamento`, `finalizado`

**Resposta (200):**
```json
{
  "id": 10,
  "projeto_id": 1,
  "tarefa_pai_id": null,
  "nome": "Criar layout home",
  "descricao": "Tela inicial atualizada",
  "status": "em andamento",
  "agendamento_inicio": "2026-04-03T15:20:00.000000Z",
  "agendamento_fim": null,
  "responsaveis": [
    {
      "id": 2,
      "name": "Ana Souza"
    }
  ],
  "etiquetas": [
    {
      "id": 1,
      "nome": "Urgente"
    }
  ]
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado
- `422` - Erro de validacao dos dados

---

## Excluir tarefa

### DELETE /api/tarefa/{tarefa}

Remove uma tarefa.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `tarefa` - ID da tarefa

**Resposta (200):**
```json
[]
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado

---
