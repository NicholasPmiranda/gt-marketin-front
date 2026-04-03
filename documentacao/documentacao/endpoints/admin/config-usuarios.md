# Documentacao de Endpoints - Configuracoes de Usuarios

## Listar todos os usuarios (id e nome)

### GET /api/config/user/todos

Lista todos os usuarios sem paginacao, retornando apenas `id` e `name`.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Resposta (200):**
```json
[
  {
    "id": 3,
    "name": "Ana Souza"
  },
  {
    "id": 2,
    "name": "Carlos Lima"
  },
  {
    "id": 1,
    "name": "Joao Silva"
  }
]
```

**Erros:**
- `401` - Nao autenticado

---

## Listar usuarios

### GET /api/config/user

Lista usuarios com paginacao e relacionamento de setor.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Resposta (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "name": "Joao Silva",
      "email": "joao@empresa.com",
      "telefone": "11999999999",
      "perfil": "gerente",
      "setor_id": 1,
      "ativo": true,
      "created_at": "2026-04-03T00:30:00.000000Z",
      "updated_at": "2026-04-03T00:30:00.000000Z",
      "setor": {
        "id": 1,
        "nome": "Financeiro",
        "created_at": "2026-04-03T00:10:00.000000Z",
        "updated_at": "2026-04-03T00:10:00.000000Z"
      }
    }
  ],
  "links": [],
  "meta": {}
}
```

**Erros:**
- `401` - Nao autenticado

---

## Criar usuario

### POST /api/config/user

Cria um usuario, gera senha aleatoria de 8 caracteres e envia email com dados de acesso.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Corpo da Requisicao:**
```json
{
  "name": "Joao Silva",
  "email": "joao@empresa.com",
  "telefone": "11999999999",
  "perfil": "gerente",
  "setor_id": 1,
  "ativo": true
}
```

**Regras de Validacao:**
- `name` - obrigatorio, string, maximo 255 caracteres
- `email` - obrigatorio, email valido, unico em users
- `telefone` - obrigatorio, string, maximo 30 caracteres
- `perfil` - obrigatorio, string, valores permitidos: `gerente`, `funcionario`, `administrativo`
- `setor_id` - obrigatorio, inteiro, deve existir em `setores.id`
- `ativo` - obrigatorio, booleano

**Resposta (201):**
```json
{
  "id": 1,
  "name": "Joao Silva",
  "email": "joao@empresa.com",
  "telefone": "11999999999",
  "perfil": "gerente",
  "setor_id": 1,
  "ativo": true,
  "created_at": "2026-04-03T00:30:00.000000Z",
  "updated_at": "2026-04-03T00:30:00.000000Z",
  "setor": {
    "id": 1,
    "nome": "Financeiro",
    "created_at": "2026-04-03T00:10:00.000000Z",
    "updated_at": "2026-04-03T00:10:00.000000Z"
  }
}
```

**Regras de negocio:**
- A senha inicial e gerada automaticamente com 8 caracteres.
- O sistema envia email para o usuario com link do frontend (`FRONT_URL`) e dados de acesso.

**Erros:**
- `401` - Nao autenticado
- `422` - Erro de validacao dos dados

---

## Detalhar usuario

### GET /api/config/user/{user}

Retorna um usuario especifico com setor.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `user` - ID do usuario

**Resposta (200):**
```json
{
  "id": 1,
  "name": "Joao Silva",
  "email": "joao@empresa.com",
  "telefone": "11999999999",
  "perfil": "gerente",
  "setor_id": 1,
  "ativo": true,
  "created_at": "2026-04-03T00:30:00.000000Z",
  "updated_at": "2026-04-03T00:30:00.000000Z",
  "setor": {
    "id": 1,
    "nome": "Financeiro",
    "created_at": "2026-04-03T00:10:00.000000Z",
    "updated_at": "2026-04-03T00:10:00.000000Z"
  }
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado

---

## Atualizar usuario

### POST /api/config/user/update-{user}

Atualiza dados do usuario.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `user` - ID do usuario

**Corpo da Requisicao:**
```json
{
  "name": "Joao da Silva",
  "email": "joao@empresa.com",
  "telefone": "11988888888",
  "perfil": "administrativo",
  "setor_id": 2,
  "ativo": false
}
```

**Regras de Validacao:**
- `name` - obrigatorio, string, maximo 255 caracteres
- `email` - obrigatorio, email valido, unico em users (ignora o proprio usuario)
- `telefone` - obrigatorio, string, maximo 30 caracteres
- `perfil` - obrigatorio, string, valores permitidos: `gerente`, `funcionario`, `administrativo`
- `setor_id` - obrigatorio, inteiro, deve existir em `setores.id`
- `ativo` - obrigatorio, booleano

**Resposta (200):**
```json
{
  "id": 1,
  "name": "Joao da Silva",
  "email": "joao@empresa.com",
  "telefone": "11988888888",
  "perfil": "administrativo",
  "setor_id": 2,
  "ativo": false,
  "created_at": "2026-04-03T00:30:00.000000Z",
  "updated_at": "2026-04-03T00:40:00.000000Z",
  "setor": {
    "id": 2,
    "nome": "Operacoes",
    "created_at": "2026-04-03T00:35:00.000000Z",
    "updated_at": "2026-04-03T00:35:00.000000Z"
  }
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado
- `422` - Erro de validacao dos dados

---

## Excluir usuario

### DELETE /api/config/user/{user}

Remove um usuario.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `user` - ID do usuario

**Resposta (200):**
```json
[]
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado

---
