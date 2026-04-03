# Documentacao de Endpoints - Configuracoes de Setores

## Listar setores

### GET /api/config/setor

Lista setores com paginacao, ordenados pelos mais recentes.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Resposta (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "nome": "Financeiro",
      "created_at": "2026-04-03T00:10:00.000000Z",
      "updated_at": "2026-04-03T00:10:00.000000Z"
    }
  ],
  "links": [],
  "meta": {}
}
```

**Erros:**
- `401` - Nao autenticado

---

## Criar setor

### POST /api/config/setor

Cria um novo setor.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Corpo da Requisicao:**
```json
{
  "nome": "Financeiro"
}
```

**Regras de Validacao:**
- `nome` - obrigatorio, string, maximo 255 caracteres

**Resposta (201):**
```json
{
  "id": 1,
  "nome": "Financeiro",
  "created_at": "2026-04-03T00:10:00.000000Z",
  "updated_at": "2026-04-03T00:10:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado
- `422` - Erro de validacao dos dados

---

## Detalhar setor

### GET /api/config/setor/{setor}

Retorna um setor especifico.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `setor` - ID do setor

**Resposta (200):**
```json
{
  "id": 1,
  "nome": "Financeiro",
  "created_at": "2026-04-03T00:10:00.000000Z",
  "updated_at": "2026-04-03T00:10:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado

---

## Atualizar setor

### POST /api/config/setor/update-{setor}

Atualiza um setor existente.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `setor` - ID do setor

**Corpo da Requisicao:**
```json
{
  "nome": "Operacoes"
}
```

**Regras de Validacao:**
- `nome` - obrigatorio, string, maximo 255 caracteres

**Resposta (200):**
```json
{
  "id": 1,
  "nome": "Operacoes",
  "created_at": "2026-04-03T00:10:00.000000Z",
  "updated_at": "2026-04-03T00:20:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado
- `422` - Erro de validacao dos dados

---

## Excluir setor

### DELETE /api/config/setor/{setor}

Remove um setor.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `setor` - ID do setor

**Resposta (200):**
```json
[]
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado

---
