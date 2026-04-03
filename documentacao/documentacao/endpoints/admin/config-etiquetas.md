# Documentacao de Endpoints - Configuracoes de Etiquetas

## Listar etiquetas

### GET /api/config/etiqueta

Lista etiquetas com paginacao, ordenadas pelas mais recentes.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).
- Header: `Authorization: Bearer {token}`

**Resposta (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "nome": "Urgente",
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

## Criar etiqueta

### POST /api/config/etiqueta

Cria uma nova etiqueta.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Corpo da Requisicao:**
```json
{
  "nome": "Urgente"
}
```

**Regras de Validacao:**
- `nome` - obrigatorio, string, maximo 255 caracteres

**Resposta (201):**
```json
{
  "id": 1,
  "nome": "Urgente",
  "created_at": "2026-04-03T00:10:00.000000Z",
  "updated_at": "2026-04-03T00:10:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado
- `422` - Erro de validacao dos dados

---

## Detalhar etiqueta

### GET /api/config/etiqueta/{etiqueta}

Retorna uma etiqueta especifica.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `etiqueta` - ID da etiqueta

**Resposta (200):**
```json
{
  "id": 1,
  "nome": "Urgente",
  "created_at": "2026-04-03T00:10:00.000000Z",
  "updated_at": "2026-04-03T00:10:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado

---

## Atualizar etiqueta

### POST /api/config/etiqueta/update-{etiqueta}

Atualiza uma etiqueta existente.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `etiqueta` - ID da etiqueta

**Corpo da Requisicao:**
```json
{
  "nome": "Backlog"
}
```

**Regras de Validacao:**
- `nome` - obrigatorio, string, maximo 255 caracteres

**Resposta (200):**
```json
{
  "id": 1,
  "nome": "Backlog",
  "created_at": "2026-04-03T00:10:00.000000Z",
  "updated_at": "2026-04-03T00:20:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado
- `422` - Erro de validacao dos dados

---

## Excluir etiqueta

### DELETE /api/config/etiqueta/{etiqueta}

Remove uma etiqueta.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `etiqueta` - ID da etiqueta

**Resposta (200):**
```json
[]
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado

---
