# Documentacao de Endpoints - Configuracoes de Tarefas Modelo

## Listar todos os modelos de tarefa (id e nome)

### GET /api/config/tarefa-modelo/todos

Lista todos os modelos de tarefa sem paginacao, retornando apenas `id` e `nome`.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Resposta (200):**
```json
[
  {
    "id": 4,
    "nome": "Modelo de onboarding"
  },
  {
    "id": 3,
    "nome": "Modelo de campanha"
  }
]
```

**Erros:**
- `401` - Nao autenticado

---

## Listar modelos de tarefa

### GET /api/config/tarefa-modelo

Lista modelos de tarefa com paginacao, ordenados pelos mais recentes, incluindo responsaveis e etiquetas.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Resposta (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 4,
      "nome": "Modelo de onboarding",
      "descricao": "Fluxo padrao para entrada de cliente",
      "status": "pendente",
      "responsaveis": [
        {
          "id": 2,
          "name": "Ana Souza"
        }
      ],
      "etiquetas": [
        {
          "id": 1,
          "nome": "Backlog"
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

## Criar modelo de tarefa

### POST /api/config/tarefa-modelo

Cria um novo modelo de tarefa com responsaveis e etiquetas.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Corpo da Requisicao:**
```json
{
  "nome": "Modelo de onboarding",
  "descricao": "Fluxo padrao para entrada de cliente",
  "status": "pendente",
  "responsavel_ids": [2, 3],
  "etiqueta_ids": [1]
}
```

**Regras de Validacao:**
- `nome` - obrigatorio, string, maximo 255 caracteres
- `descricao` - opcional, string
- `status` - obrigatorio, string, valores permitidos: `pendente`, `revisao`, `em andamento`, `finalizado`
- `responsavel_ids` - obrigatorio, array, minimo 1 item
- `responsavel_ids.*` - inteiro, deve existir em `users.id`
- `etiqueta_ids` - opcional, array
- `etiqueta_ids.*` - inteiro, deve existir em `etiquetas.id`

**Resposta (201):**
```json
{
  "id": 4,
  "nome": "Modelo de onboarding",
  "descricao": "Fluxo padrao para entrada de cliente",
  "status": "pendente",
  "responsaveis": [
    {
      "id": 2,
      "name": "Ana Souza"
    }
  ],
  "etiquetas": [
    {
      "id": 1,
      "nome": "Backlog"
    }
  ]
}
```

**Erros:**
- `401` - Nao autenticado
- `422` - Erro de validacao dos dados

---

## Detalhar modelo de tarefa

### GET /api/config/tarefa-modelo/{tarefaModelo}

Retorna um modelo de tarefa especifico com responsaveis e etiquetas.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `tarefaModelo` - ID do modelo de tarefa

**Resposta (200):**
```json
{
  "id": 4,
  "nome": "Modelo de onboarding",
  "descricao": "Fluxo padrao para entrada de cliente",
  "status": "pendente",
  "responsaveis": [
    {
      "id": 2,
      "name": "Ana Souza"
    }
  ],
  "etiquetas": [
    {
      "id": 1,
      "nome": "Backlog"
    }
  ]
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado

---

## Atualizar modelo de tarefa

### POST /api/config/tarefa-modelo/update-{tarefaModelo}

Atualiza um modelo de tarefa existente e sincroniza responsaveis/etiquetas.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `tarefaModelo` - ID do modelo de tarefa

**Corpo da Requisicao:**
```json
{
  "nome": "Modelo de onboarding v2",
  "descricao": "Fluxo atualizado",
  "status": "revisao",
  "responsavel_ids": [2],
  "etiqueta_ids": [1, 2]
}
```

**Regras de Validacao:**
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
  "id": 4,
  "nome": "Modelo de onboarding v2",
  "descricao": "Fluxo atualizado",
  "status": "revisao",
  "responsaveis": [
    {
      "id": 2,
      "name": "Ana Souza"
    }
  ],
  "etiquetas": [
    {
      "id": 2,
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

## Excluir modelo de tarefa

### DELETE /api/config/tarefa-modelo/{tarefaModelo}

Remove um modelo de tarefa.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `tarefaModelo` - ID do modelo de tarefa

**Resposta (200):**
```json
[]
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado

---
