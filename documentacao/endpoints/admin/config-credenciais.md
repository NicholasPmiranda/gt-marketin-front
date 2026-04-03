# Documentacao de Endpoints - Configuracoes de Credenciais

## Listar credenciais

### GET /api/config/credencial

Lista credenciais com paginacao.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Regras de acesso:**
- Usuario com perfil `administrativo` ou `admin`: visualiza todas as credenciais.
- Demais perfis: visualizam apenas credenciais liberadas para o usuario na relacao many-to-many (`credencial_user`).

**Resposta (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 1,
      "nome": "Meta Ads",
      "url": "https://business.facebook.com",
      "acesso": "usuario@empresa.com",
      "senha": "senha-super-secreta",
      "criador_id": 2,
      "criador": {
        "id": 2,
        "name": "Maria Lima"
      },
      "liberados": [
        {
          "id": 2,
          "name": "Maria Lima"
        },
        {
          "id": 5,
          "name": "Joao Alves"
        }
      ],
      "created_at": "2026-04-03T05:00:00.000000Z",
      "updated_at": "2026-04-03T05:00:00.000000Z"
    }
  ],
  "links": [],
  "meta": {}
}
```

**Erros:**
- `401` - Nao autenticado

---

## Criar credencial

### POST /api/config/credencial

Cadastra uma nova credencial. Qualquer usuario autenticado pode criar.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Corpo da Requisicao:**
```json
{
  "nome": "Google Analytics",
  "url": "https://analytics.google.com",
  "acesso": "analytics@empresa.com",
  "senha": "senha-forte",
  "liberado_ids": [3, 4]
}
```

**Regras de Validacao:**
- `nome` - obrigatorio, string, maximo 255 caracteres
- `url` - obrigatorio, string, maximo 255 caracteres
- `acesso` - obrigatorio, string, maximo 255 caracteres
- `senha` - obrigatorio, string, maximo 255 caracteres
- `liberado_ids` - opcional, array
- `liberado_ids.*` - inteiro, deve existir em `users.id`

**Regra de negocio:**
- O criador da credencial e sempre incluido automaticamente na lista de liberados.
- A senha e salva criptografada no banco via cast `encrypted` do Laravel.

**Resposta (201):**
```json
{
  "id": 2,
  "nome": "Google Analytics",
  "url": "https://analytics.google.com",
  "acesso": "analytics@empresa.com",
  "senha": "senha-forte",
  "criador_id": 1,
  "criador": {
    "id": 1,
    "name": "Admin"
  },
  "liberados": [
    {
      "id": 1,
      "name": "Admin"
    },
    {
      "id": 3,
      "name": "Carla"
    }
  ],
  "created_at": "2026-04-03T05:10:00.000000Z",
  "updated_at": "2026-04-03T05:10:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado
- `422` - Erro de validacao dos dados

---

## Visualizar credencial

### GET /api/config/credencial/{credencial}

Retorna os dados de uma credencial especifica.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `credencial` - ID da credencial

**Regras de acesso:**
- Usuario com perfil `administrativo` ou `admin`: pode visualizar qualquer credencial.
- Demais perfis: so podem visualizar credenciais liberadas para o proprio usuario.

**Resposta (200):**
```json
{
  "id": 1,
  "nome": "Meta Ads",
  "url": "https://business.facebook.com",
  "acesso": "usuario@empresa.com",
  "senha": "senha-super-secreta",
  "criador_id": 2,
  "criador": {
    "id": 2,
    "name": "Maria Lima"
  },
  "liberados": [
    {
      "id": 2,
      "name": "Maria Lima"
    },
    {
      "id": 5,
      "name": "Joao Alves"
    }
  ],
  "created_at": "2026-04-03T05:00:00.000000Z",
  "updated_at": "2026-04-03T05:00:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado
- `403` - Voce nao tem acesso a esta credencial

---

## Atualizar credencial ou solicitar edicao

### POST /api/config/credencial/update-{credencial}

Atualiza uma credencial existente.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `credencial` - ID da credencial

**Corpo da Requisicao:**
```json
{
  "nome": "Meta Ads",
  "url": "https://business.facebook.com",
  "acesso": "novo-acesso@empresa.com",
  "senha": "nova-senha",
  "liberado_ids": [2, 5, 8]
}
```

**Regras de Validacao:**
- `nome` - obrigatorio, string, maximo 255 caracteres
- `url` - obrigatorio, string, maximo 255 caracteres
- `acesso` - obrigatorio, string, maximo 255 caracteres
- `senha` - obrigatorio, string, maximo 255 caracteres
- `liberado_ids` - opcional, array
- `liberado_ids.*` - inteiro, deve existir em `users.id`

**Regras de negocio:**
- Se usuario for admin (`administrativo`/`admin`), a atualizacao ocorre imediatamente.
- Se usuario nao for admin, o endpoint cria solicitacao com status `pendente` para analise do admin.
- Usuario nao admin precisa ter acesso a credencial para solicitar edicao.
- Nao pode existir mais de uma solicitacao pendente do mesmo usuario para a mesma credencial.

**Resposta (200) - quando admin atualiza diretamente:**
```json
{
  "id": 1,
  "nome": "Meta Ads",
  "url": "https://business.facebook.com",
  "acesso": "novo-acesso@empresa.com",
  "senha": "nova-senha",
  "criador_id": 2,
  "criador": {
    "id": 2,
    "name": "Maria Lima"
  },
  "liberados": [
    {
      "id": 2,
      "name": "Maria Lima"
    },
    {
      "id": 8,
      "name": "Tiago"
    }
  ],
  "created_at": "2026-04-03T05:00:00.000000Z",
  "updated_at": "2026-04-03T05:20:00.000000Z"
}
```

**Resposta (201) - quando nao admin cria solicitacao:**
```json
{
  "id": 9,
  "credencial_id": 1,
  "solicitante_id": 5,
  "nome": "Meta Ads",
  "url": "https://business.facebook.com",
  "acesso": "novo-acesso@empresa.com",
  "senha": "nova-senha",
  "liberado_ids": [2, 5, 8],
  "status": "pendente",
  "analisado_por": null,
  "analisado_em": null,
  "created_at": "2026-04-03T05:25:00.000000Z",
  "updated_at": "2026-04-03T05:25:00.000000Z"
}
```

**Erros:**
- `400` - Ja existe uma solicitacao pendente para esta credencial
- `401` - Nao autenticado
- `403` - Voce nao tem permissao para solicitar edicao desta credencial
- `422` - Erro de validacao dos dados

---

## Excluir credencial

### DELETE /api/config/credencial/{credencial}

Exclui uma credencial.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `credencial` - ID da credencial

**Regras de acesso:**
- Admin (`administrativo`/`admin`) pode excluir qualquer credencial.
- Usuario nao admin so pode excluir credencial criada por ele.

**Resposta (200):**
```json
[]
```

**Erros:**
- `401` - Nao autenticado
- `403` - Voce nao tem permissao para excluir esta credencial

---

## Listar solicitacoes de edicao de credencial

### GET /api/config/credencial-solicitacao

Lista solicitacoes de edicao de credenciais com paginacao.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Permissao necessaria:**
- Apenas admin (`administrativo`/`admin`).

**Resposta (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 9,
      "credencial_id": 1,
      "solicitante_id": 5,
      "nome": "Meta Ads",
      "url": "https://business.facebook.com",
      "acesso": "novo-acesso@empresa.com",
      "senha": "nova-senha",
      "liberado_ids": [2, 5, 8],
      "status": "pendente",
      "analisado_por": null,
      "analisado_em": null,
      "credencial": {
        "id": 1,
        "nome": "Meta Ads"
      },
      "solicitante": {
        "id": 5,
        "name": "Joao Alves"
      },
      "created_at": "2026-04-03T05:25:00.000000Z",
      "updated_at": "2026-04-03T05:25:00.000000Z"
    }
  ],
  "links": [],
  "meta": {}
}
```

**Erros:**
- `401` - Nao autenticado
- `403` - Apenas administrador pode visualizar solicitacoes

---

## Analisar solicitacao de edicao de credencial

### POST /api/config/credencial-solicitacao/update-{credencialSolicitacao}

Aprova ou rejeita uma solicitacao pendente de edicao.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Permissao necessaria:**
- Apenas admin (`administrativo`/`admin`).

**Parametros de URL:**
- `credencialSolicitacao` - ID da solicitacao

**Corpo da Requisicao:**
```json
{
  "aceitar": true
}
```

**Regras de Validacao:**
- `aceitar` - obrigatorio, boolean

**Regras de negocio:**
- So solicitacoes com status `pendente` podem ser analisadas.
- Se `aceitar = true`, os dados solicitados sao aplicados na credencial.
- Se `aceitar = false`, os dados da credencial nao sao alterados e a solicitacao fica `rejeitado`.

**Resposta (200):**
```json
{
  "id": 9,
  "credencial_id": 1,
  "solicitante_id": 5,
  "nome": "Meta Ads",
  "url": "https://business.facebook.com",
  "acesso": "novo-acesso@empresa.com",
  "senha": "nova-senha",
  "liberado_ids": [2, 5, 8],
  "status": "aprovado",
  "analisado_por": 1,
  "analisado_em": "2026-04-03T05:30:00.000000Z",
  "credencial": {
    "id": 1,
    "nome": "Meta Ads"
  },
  "solicitante": {
    "id": 5,
    "name": "Joao Alves"
  },
  "created_at": "2026-04-03T05:25:00.000000Z",
  "updated_at": "2026-04-03T05:30:00.000000Z"
}
```

**Erros:**
- `400` - Esta solicitacao ja foi analisada
- `401` - Nao autenticado
- `403` - Apenas administrador pode analisar solicitacoes
- `422` - Erro de validacao dos dados

---
