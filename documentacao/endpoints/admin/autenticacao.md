# Documentacao de Endpoints - Autenticacao

## Login

### POST /api/login

Autentica o usuario com email e senha e retorna token de acesso Sanctum.

**Autenticacao:**
- Nao exige autenticacao.

**Corpo da Requisicao:**
```json
{
  "email": "admin@admin.com",
  "password": "admin123"
}
```

**Regras de Validacao:**
- `email` - obrigatorio, email valido
- `password` - obrigatorio, string

**Resposta (200):**
```json
{
  "user": {
    "id": 1,
    "name": "admin",
    "email": "admin@admin.com",
    "email_verified_at": null,
    "created_at": "2026-04-02T23:00:00.000000Z",
    "updated_at": "2026-04-02T23:00:00.000000Z"
  },
  "token": "1|token_gerado_pelo_sanctum"
}
```

**Erros:**
- `401` - Credenciais invalidas
- `422` - Erro de validacao dos dados

---
