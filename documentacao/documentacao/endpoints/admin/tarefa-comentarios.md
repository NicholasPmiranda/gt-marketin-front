# Documentacao de Endpoints - Comentarios de Tarefa

## Listar comentarios

### GET /api/tarefa-comentario

Lista comentarios com paginacao, podendo filtrar por tarefa.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de Query:**
- `tarefa_id` (opcional) - filtra comentarios pela tarefa

**Resposta (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 50,
      "tarefa_id": 10,
      "user_id": 2,
      "comentario": "Ajustar copy",
      "user": {
        "id": 2,
        "name": "Ana Souza"
      },
      "tarefa": {
        "id": 10,
        "nome": "Criar layout"
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

## Criar comentario

### POST /api/tarefa-comentario

Cria comentario em tarefa usando o usuario autenticado.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Corpo da Requisicao:**
```json
{
  "tarefa_id": 10,
  "comentario": "Ajustar copy"
}
```

**Regras de Validacao:**
- `tarefa_id` - obrigatorio, inteiro, deve existir em `tarefas.id`
- `comentario` - obrigatorio, string

**Resposta (201):**
```json
{
  "id": 50,
  "tarefa_id": 10,
  "user_id": 2,
  "comentario": "Ajustar copy"
}
```

**Erros:**
- `401` - Nao autenticado
- `422` - Erro de validacao dos dados

---

## Detalhar comentario

### GET /api/tarefa-comentario/{tarefaComentario}

Retorna um comentario especifico.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `tarefaComentario` - ID do comentario

**Resposta (200):**
```json
{
  "id": 50,
  "tarefa_id": 10,
  "user_id": 2,
  "comentario": "Ajustar copy"
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Recurso nao encontrado

---

## Atualizar comentario

### POST /api/tarefa-comentario/update-{tarefaComentario}

Atualiza comentario. Somente o autor do comentario pode atualizar.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `tarefaComentario` - ID do comentario

**Corpo da Requisicao:**
```json
{
  "comentario": "Copy ajustada"
}
```

**Regras de Validacao:**
- `comentario` - obrigatorio, string

**Resposta (200):**
```json
{
  "id": 50,
  "tarefa_id": 10,
  "user_id": 2,
  "comentario": "Copy ajustada"
}
```

**Erros:**
- `401` - Nao autenticado
- `403` - Nao autorizado para editar este comentario
- `404` - Recurso nao encontrado
- `422` - Erro de validacao dos dados

---

## Excluir comentario

### DELETE /api/tarefa-comentario/{tarefaComentario}

Remove comentario. Somente o autor do comentario pode excluir.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `tarefaComentario` - ID do comentario

**Resposta (200):**
```json
[]
```

**Erros:**
- `401` - Nao autenticado
- `403` - Nao autorizado para excluir este comentario
- `404` - Recurso nao encontrado

---
