# Documentacao de Endpoints - Recuperacao de Senha

## Solicitar recuperacao de senha

### POST /api/forgot-password

Gera token de recuperacao e dispara email com link para redefinicao de senha.

**Autenticacao:**
- Nao exige autenticacao.

**Corpo da Requisicao:**
```json
{
  "email": "admin@admin.com"
}
```

**Regras de Validacao:**
- `email` - obrigatorio, email valido

**Resposta (200):**
```json
{
  "message": "Email de recuperacao enviado com sucesso"
}
```

**Erros:**
- `404` - Usuario nao encontrado
- `422` - Erro de validacao dos dados

---

## Redefinir senha com token

### POST /api/reset-password

Redefine a senha do usuario usando token de recuperacao valido.

**Autenticacao:**
- Nao exige autenticacao.

**Corpo da Requisicao:**
```json
{
  "token": "token_recebido_por_email",
  "email": "admin@admin.com",
  "password": "novaSenha123",
  "password_confirmation": "novaSenha123"
}
```

**Regras de Validacao:**
- `token` - obrigatorio, string
- `email` - obrigatorio, email valido
- `password` - obrigatorio, string, minimo 8 caracteres, confirmacao obrigatoria

**Resposta (200):**
```json
{
  "message": "Senha redefinida com sucesso"
}
```

**Erros:**
- `400` - Token invalido ou expirado
- `422` - Erro de validacao dos dados

---
