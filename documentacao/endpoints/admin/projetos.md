# Documentacao de Endpoints - Projetos

## Listar projetos

### GET /api/projeto

Lista projetos com paginacao, incluindo equipe.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de Query:**
- `search` (opcional) - filtra por nome ou descricao
- `ativo` (opcional) - filtra por status ativo (`true` ou `false`)

**Resposta (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "nome": "Novo Site",
      "descricao": "Projeto institucional",
      "ativo": true,
      "created_at": "2026-04-03T01:00:00.000000Z",
      "updated_at": "2026-04-03T01:00:00.000000Z",
      "equipe": [
        {
          "id": 1,
          "name": "Joao Silva"
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

## Criar projeto

### POST /api/projeto

Cria um projeto e associa equipe (quando enviada).

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Corpo da Requisicao:**
```json
{
  "nome": "Novo Site",
  "descricao": "Projeto institucional",
  "ativo": true,
  "equipe_ids": [1, 2]
}
```

**Regras de Validacao:**
- `nome` - obrigatorio, string, maximo 255 caracteres
- `descricao` - opcional, string
- `ativo` - obrigatorio, booleano
- `equipe_ids` - opcional, array, minimo 1 item
- `equipe_ids.*` - inteiro, deve existir em `users.id`

**Resposta (201):**
```json
{
  "id": 1,
  "nome": "Novo Site",
  "descricao": "Projeto institucional",
  "ativo": true,
  "equipe": [
    {
      "id": 1,
      "name": "Joao Silva"
    }
  ],
  "created_at": "2026-04-03T01:00:00.000000Z",
  "updated_at": "2026-04-03T01:00:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado
- `422` - Erro de validacao dos dados

---

## Detalhar projeto

### GET /api/projeto/{projeto}

Retorna um projeto com equipe.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `projeto` - ID do projeto

**Resposta (200):**
```json
{
  "id": 1,
  "nome": "Novo Site",
  "descricao": "Projeto institucional",
  "ativo": true,
  "equipe": [
    {
      "id": 1,
      "name": "Joao Silva"
    }
  ],
  "created_at": "2026-04-03T01:00:00.000000Z",
  "updated_at": "2026-04-03T01:00:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado

---

## Atualizar projeto

### POST /api/projeto/update-{projeto}

Atualiza dados do projeto e sincroniza equipe quando `equipe_ids` for enviado.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `projeto` - ID do projeto

**Corpo da Requisicao:**
```json
{
  "nome": "Novo Site v2",
  "descricao": "Projeto institucional atualizado",
  "ativo": false,
  "equipe_ids": [2, 3]
}
```

**Regras de Validacao:**
- `nome` - obrigatorio, string, maximo 255 caracteres
- `descricao` - opcional, string
- `ativo` - obrigatorio, booleano
- `equipe_ids` - opcional, array, minimo 1 item
- `equipe_ids.*` - inteiro, deve existir em `users.id`

**Resposta (200):**
```json
{
  "id": 1,
  "nome": "Novo Site v2",
  "descricao": "Projeto institucional atualizado",
  "ativo": false,
  "equipe": [
    {
      "id": 2,
      "name": "Ana Souza"
    }
  ],
  "created_at": "2026-04-03T01:00:00.000000Z",
  "updated_at": "2026-04-03T01:20:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado
- `422` - Erro de validacao dos dados

---

## Excluir projeto

### DELETE /api/projeto/{projeto}

Remove um projeto.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `projeto` - ID do projeto

**Resposta (200):**
```json
[]
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado

---
