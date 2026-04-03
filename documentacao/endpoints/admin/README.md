# Endpoints da API de Admin - Documentacao Completa

## Sumario
- [Autenticacao](./autenticacao.md)
- [Perfil](./perfil.md)
- [Recuperacao de Senha](./recuperacao-senha.md)

## Estrutura da Documentacao
### Autenticacao (`autenticacao.md`)
- **Login** - Autentica usuario e retorna token Sanctum para chamadas autenticadas.

### Perfil (`perfil.md`)
- **Visualizar perfil autenticado** - Retorna dados do usuario autenticado pelo token.

### Recuperacao de Senha (`recuperacao-senha.md`)
- **Solicitar recuperacao** - Gera token e dispara email de recuperacao.
- **Redefinir senha** - Atualiza senha com token valido de recuperacao.

## Requisitos de Autenticacao
- Tipo: Bearer Token (Sanctum)
- Header: `Authorization: Bearer {token}`
- Endpoints publicos: `POST /api/login`, `POST /api/forgot-password`, `POST /api/reset-password`

## Formato Geral de Resposta
- Sucesso: retorno direto dos dados necessarios do endpoint.
- Erro: apenas o campo `message`.

Exemplo de erro:

```json
{
  "message": "Descricao do erro"
}
```

## Codigos HTTP comuns
- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de regra de negocio/dados invalidos
- `401` - Nao autenticado ou credenciais invalidas
- `404` - Recurso nao encontrado
- `422` - Erro de validacao

## Regras de Acesso
- O endpoint de perfil exige autenticacao com token Sanctum valido.
- Login e recuperacao de senha sao publicos.
