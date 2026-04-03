# Documentacao de Endpoints - Perfil

## Visualizar perfil autenticado

### GET /api/profile

Retorna os dados do usuario autenticado pelo token Sanctum.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).
- Header: `Authorization: Bearer {token}`

**Resposta (200):**
```json
{
  "id": 1,
  "name": "admin",
  "email": "admin@admin.com",
  "email_verified_at": null,
  "created_at": "2026-04-02T23:00:00.000000Z",
  "updated_at": "2026-04-02T23:00:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado

---
