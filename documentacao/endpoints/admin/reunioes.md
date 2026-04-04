# Documentacao de Endpoints - Reunioes

## Listar reunioes

### GET /api/reuniao

Lista todas as reunioes com paginacao, ordenadas pelas mais recentes, com filtro de busca opcional.

As colunas de conteudo completo (`transcricao`, `resumo_padrao`, `itens_acao`, `convidados_calendario`, `gravado_por`) nao sao retornadas nesta listagem.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de Query:**
- `search` (opcional) - filtra por `titulo`, `titulo_reuniao`, `url` e `url_compartilhamento`
- `per_page` (opcional) - quantidade de itens por pagina (minimo 1, maximo 100, padrao 15)

**Resposta (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 14,
      "zerogap_id": "zg_123456",
      "titulo": "Revisao semanal",
      "titulo_reuniao": "Sprint Planning",
      "url": "https://app.fathom.video/calls/abc123",
      "url_compartilhamento": "https://fathom.video/share/abc123",
      "criado_em_origem": "2026-04-04T10:00:00.000000Z",
      "inicio_agendado_em": "2026-04-04T10:00:00.000000Z",
      "fim_agendado_em": "2026-04-04T11:00:00.000000Z",
      "inicio_gravacao_em": "2026-04-04T10:05:00.000000Z",
      "fim_gravacao_em": "2026-04-04T10:58:00.000000Z",
      "tipo_dominio_convidados_calendario": "all",
      "created_at": "2026-04-04T11:10:00.000000Z",
      "updated_at": "2026-04-04T11:10:00.000000Z"
    }
  ],
  "links": [],
  "meta": {}
}
```

**Erros:**
- `401` - Nao autenticado
- `422` - Erro de validacao dos dados

---

## Detalhar reuniao

### GET /api/reuniao/{reuniao}

Retorna os dados completos da reuniao, incluindo `transcricao`, `resumo_padrao`, `itens_acao`, `convidados_calendario` e `gravado_por`.

**Autenticacao:**
- Obrigatoria (`auth:sanctum`).

**Parametros de URL:**
- `reuniao` - ID da reuniao

**Resposta (200):**
```json
{
  "id": 14,
  "zerogap_id": "zg_123456",
  "titulo": "Revisao semanal",
  "titulo_reuniao": "Sprint Planning",
  "url": "https://app.fathom.video/calls/abc123",
  "url_compartilhamento": "https://fathom.video/share/abc123",
  "criado_em_origem": "2026-04-04T10:00:00.000000Z",
  "inicio_agendado_em": "2026-04-04T10:00:00.000000Z",
  "fim_agendado_em": "2026-04-04T11:00:00.000000Z",
  "inicio_gravacao_em": "2026-04-04T10:05:00.000000Z",
  "fim_gravacao_em": "2026-04-04T10:58:00.000000Z",
  "tipo_dominio_convidados_calendario": "all",
  "transcricao": [],
  "resumo_padrao": [],
  "itens_acao": [],
  "convidados_calendario": [],
  "gravado_por": [],
  "created_at": "2026-04-04T11:10:00.000000Z",
  "updated_at": "2026-04-04T11:10:00.000000Z"
}
```

**Erros:**
- `401` - Nao autenticado
- `404` - Reuniao nao encontrada

---
