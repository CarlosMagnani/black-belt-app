# Efí Bank — Integração de Pagamentos

> Documentação técnica para integração do BlackBelt com Efí Bank (ex-Gerencianet)

## Visão Geral

O BlackBelt usa Efí Bank para:
1. **Cobrar academias** (assinatura B2B)
2. **Processar pagamentos de alunos** (PIX recorrente direto pra conta da academia)

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Academia se cadastra no BlackBelt                           │
│     ↓                                                           │
│  2. API Abertura de Contas cria conta Efí para a academia       │
│     (automático, CPF/CNPJ + dados bancários)                    │
│     ↓                                                           │
│  3. Academia cria planos para alunos no app                     │
│     ↓                                                           │
│  4. Aluno assina plano → PIX Automático (recorrente)            │
│     ↓                                                           │
│  5. Split de Pagamento:                                         │
│     - 100% vai pra conta Efí da academia                        │
│     - (opcionalmente BlackBelt cobra % como taxa de plataforma) │
└─────────────────────────────────────────────────────────────────┘
```

## APIs Utilizadas

### 1. API Abertura de Contas

**Propósito:** Criar conta Efí automaticamente para cada academia

**Documentação:** https://dev.efipay.com.br/docs/api-abertura-de-contas/credenciais

**Endpoints:**
- `POST /v1/oauth/token` — Autorização
- Endpoints de criação de conta (ver documentação)

**Escopos necessários:**
- `gn.registration.write` — criar conta
- `gn.registration.read` — consultar credenciais
- `gn.registration.webhook.write` — configurar webhook
- `gn.registration.webhook.read` — consultar webhook

**⚠️ IMPORTANTE:** API restrita! Precisa de aprovação do comercial Efí.

**Rotas base:**
- Produção: `https://abrircontas.api.efipay.com.br`
- Homologação: `https://abrircontas-h.api.efipay.com.br`

---

### 2. API PIX — Split de Pagamento

**Propósito:** Dividir pagamentos entre contas Efí

**Documentação:** https://dev.efipay.com.br/en/docs/api-pix/split-de-pagamento-pix/

**Restrições:**
- Só funciona entre contas Efí
- Máximo 20 contas por split
- Não é possível estornar cobranças com split

**Endpoints:**
- `POST /v2/gn/split/config` — Criar configuração de split
- `PUT /v2/gn/split/config/:id` — Criar/atualizar config com id
- `GET /v2/gn/split/config/:id` — Consultar config
- `PUT /v2/gn/split/cob/:txid/vinculo/:splitConfigId` — Vincular cobrança ao split
- `DELETE /v2/gn/split/cob/:txid/vinculo` — Remover vínculo

**Exemplo de configuração:**
```json
{
  "descricao": "Mensalidade Academia XYZ",
  "lancamento": {
    "imediato": true
  },
  "split": {
    "divisaoTarifa": "assumir_total",
    "minhaParte": {
      "tipo": "porcentagem",
      "valor": "5.00"
    },
    "repasses": [
      {
        "tipo": "porcentagem",
        "valor": "95.00",
        "favorecido": {
          "cpf": "12345678909",
          "conta": "1234567"
        }
      }
    ]
  }
}
```

**Opções de `divisaoTarifa`:**
- `assumir_total` — quem cria a cobrança assume a tarifa
- (ver documentação para outras opções)

---

### 3. API PIX Automático (Recorrente)

**Propósito:** Cobranças recorrentes de alunos

**Documentação:** https://dev.efipay.com.br/en/docs/api-pix/pix-automatico/

**Requisito:** Conta Efí Empresas (PJ)

**Endpoints principais:**
- `POST /v2/rec` — Criar recorrência
- `GET /v2/rec/:idRec` — Consultar recorrência
- `PATCH /v2/rec/:idRec` — Alterar recorrência
- `GET /v2/rec` — Listar recorrências
- `PUT /v2/cobr/:txid` — Criar cobrança de recorrência
- `PATCH /v2/cobr/:txid` — Alterar/cancelar cobrança

**Escopos:**
- `rec.write` — criar/alterar recorrências
- `rec.read` — consultar recorrências
- `cobr.write` — criar cobranças de recorrência
- `cobr.read` — consultar cobranças

**Exemplo de criação:**
```json
{
  "vinculo": {
    "contrato": "63100862",
    "devedor": {
      "cpf": "45164632481",
      "nome": "João Silva"
    },
    "objeto": "Mensalidade Academia BJJ"
  },
  "calendario": {
    "dataFinal": "2027-04-01",
    "dataInicial": "2026-04-01",
    "periodicidade": "MENSAL"
  },
  "valor": {
    "valorRec": "150.00"
  },
  "politicaRetentativa": "NAO_PERMITE"
}
```

**Periodicidades disponíveis:**
- `MENSAL`
- `SEMANAL`
- (ver documentação para outras)

**Status da recorrência:**
- `CRIADA` — aguardando aprovação do pagador
- `APROVADA` — pagador autorizou
- `REJEITADA` — pagador recusou
- `CANCELADA` — cancelada

---

## SDK e Integração

### SDK Go (Oficial)

**Repositório:** https://github.com/efipay/sdk-go-apis-efi

**Instalação:**
```bash
go get github.com/efipay/sdk-go-apis-efi
```

### SDKs disponíveis
- PHP
- Node.js
- Python
- .NET Core
- Ruby
- Java
- **Go** ✓
- TypeScript
- Dart/Flutter
- Android

### Certificado

Todas as requisições exigem certificado mTLS (.p12 ou .pem).

**Geração:** Painel Efí → API → Certificados

---

## Configuração no Backend

### Variáveis de ambiente

```env
# Efí Bank
EFI_CLIENT_ID=your-client-id
EFI_CLIENT_SECRET=your-client-secret
EFI_CERTIFICATE_PATH=/path/to/certificate.pem
EFI_SANDBOX=true  # false em produção

# Rotas base
EFI_PIX_URL=https://pix.api.efipay.com.br  # ou -h para sandbox
EFI_ACCOUNTS_URL=https://abrircontas.api.efipay.com.br
```

### Estrutura sugerida

```
backend/
├── internal/
│   ├── adapters/
│   │   └── efi/
│   │       ├── client.go        # HTTP client com mTLS
│   │       ├── auth.go          # OAuth2 token
│   │       ├── accounts.go      # API Abertura de Contas
│   │       ├── pix.go           # API PIX
│   │       ├── split.go         # Split de pagamento
│   │       └── recurring.go     # PIX Automático
│   ├── ports/
│   │   └── payments.go          # Interface
│   └── domain/
│       └── subscription.go      # Entidades
```

---

## Fluxos de Negócio

### Onboarding de Academia

1. Dono cadastra academia no BlackBelt
2. Backend chama API Abertura de Contas
3. Conta Efí criada automaticamente
4. Credenciais salvas no banco (encriptadas)
5. Academia pode receber pagamentos

### Aluno assina plano

1. Aluno escolhe plano no app
2. Backend cria recorrência PIX Automático
3. Aluno autoriza no app do banco
4. Cobrança automática todo mês
5. Split envia 95-100% pra academia

### Webhook de pagamento

1. Efí envia webhook quando pagamento confirmado
2. Backend atualiza status da assinatura
3. Notifica aluno e academia

---

## Taxas (Referência)

| Operação | Taxa aproximada |
|----------|-----------------|
| PIX recebido | 0.75% - 1.19% |
| PIX Automático | ~1% |
| Split | Sem taxa adicional |
| Abertura de conta | Grátis |

*Taxas sujeitas a negociação comercial*

---

## Contatos

- **Documentação:** https://dev.efipay.com.br
- **Discord (suporte):** Comunidade Efí Developers
- **Comercial:** Contatar para liberação da API de Abertura de Contas

---

## Checklist de Implementação

- [ ] Criar conta Efí Empresas para BlackBelt
- [ ] Contatar comercial para liberar API Abertura de Contas
- [ ] Gerar certificado .p12/.pem
- [ ] Implementar client Go com mTLS
- [ ] Implementar OAuth2 token refresh
- [ ] Implementar abertura de contas
- [ ] Implementar PIX Automático
- [ ] Implementar Split de pagamento
- [ ] Configurar webhooks
- [ ] Testes em sandbox
- [ ] Migrar para produção

---

*Última atualização: 2026-02-08*
