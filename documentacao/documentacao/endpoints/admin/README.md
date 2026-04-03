# Endpoints da API de Admin - Documentacao Completa

## Sumario
- [Autenticacao](./autenticacao.md)
- [Perfil](./perfil.md)
- [Recuperacao de Senha](./recuperacao-senha.md)
- [Config - Etiquetas](./config-etiquetas.md)
- [Config - Setores](./config-setores.md)
- [Config - Usuarios](./config-usuarios.md)
- [Config - Tarefas Modelo](./config-tarefas-modelo.md)
- [Projetos](./projetos.md)
- [Tarefas](./tarefas.md)
- [Comentarios de Tarefa](./tarefa-comentarios.md)

## Estrutura da Documentacao
### Autenticacao (`autenticacao.md`)
- **Login** - Autentica usuario e retorna token Sanctum para chamadas autenticadas.

### Perfil (`perfil.md`)
- **Visualizar perfil autenticado** - Retorna dados do usuario autenticado pelo token.

### Recuperacao de Senha (`recuperacao-senha.md`)
- **Solicitar recuperacao** - Gera token e dispara email de recuperacao.
- **Redefinir senha** - Atualiza senha com token valido de recuperacao.

### Configuracoes de Etiquetas (`config-etiquetas.md`)
- **Etiquetas** - CRUD completo de etiquetas.

### Configuracoes de Setores (`config-setores.md`)
- **Setores** - CRUD completo de setores.

### Configuracoes de Usuarios (`config-usuarios.md`)
- **Usuarios (Config)** - CRUD completo de usuarios com perfil, setor, ativo e envio de senha inicial por email.

### Configuracoes de Tarefas Modelo (`config-tarefas-modelo.md`)
- **Tarefas Modelo (Config)** - CRUD completo de modelos de tarefa com responsaveis e etiquetas.

### Projetos (`projetos.md`)
- **Projetos** - CRUD completo de projetos com equipe (many-to-many com usuarios).

### Tarefas (`tarefas.md`)
- **Tarefas** - CRUD completo de tarefas e subtarefas com responsaveis e etiquetas.

### Comentarios de Tarefa (`tarefa-comentarios.md`)
- **Comentarios de Tarefa** - CRUD de comentarios com controle de autoria pelo usuario autenticado.

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
- Endpoints de configuracoes exigem autenticacao com token Sanctum valido.
- Endpoints de projetos, tarefas e comentarios exigem autenticacao com token Sanctum valido.
