# Comparação de Provedores — Split + PIX Recorrente

> Pesquisa realizada em 2026-02-08

## Tabela Resumo

| Provedor | Split Automático | PIX Recorrente* | Taxa PIX | Onboarding Subconta |
|----------|------------------|-----------------|----------|---------------------|
| **Efí Bank** ✓ | ✅ Excelente | ✅ PIX Automático | ~0.75-1.19% | ✅ API (requer aprovação) |
| **Asaas** | ✅ Excelente | ⚠️ Geração de cobrança | Grátis | ⭐ Muito fácil |
| **Zoop** | ✅ Excelente | ✅ Via API | Sob consulta | ✅ Bom (KYC incluso) |
| **Pagar.me** | ✅ Bom | ⚠️ Cartão sim, PIX limitado | 1,19% | 🟡 Médio |
| **Iugu** | ✅ Bom | ⚠️ QR code recorrente | R$1,50 fixo | 🟡 Médio |
| **PagBank** | ✅ Bom | ⚠️ Limitado | Grátis | 🟡 Médio |

**✓ Escolhido:** Efí Bank

---

## Detalhes por Provedor

### Efí Bank (ex-Gerencianet) — ESCOLHIDO

**Por que escolhemos:**
- API de Abertura de Contas automatiza onboarding de academias
- PIX Automático real (débito recorrente sem ação do usuário)
- Split de Pagamento nativo entre contas Efí
- SDK Go oficial
- Boa documentação

**Considerações:**
- API de Abertura de Contas é restrita (precisa aprovação comercial)
- Split só funciona entre contas Efí
- Taxa ~0.75-1.19% por PIX

---

### Asaas — Alternativa Principal

**Pontos fortes:**
- PIX gratuito para receber
- Subcontas muito fáceis via API (`POST /v3/accounts`)
- Recebe `apiKey` + `walletId` automaticamente
- Muito usado por SaaS brasileiros
- Split por valor fixo ou percentual

**Limitações:**
- PIX Automático (débito) ainda em implementação
- "Recorrência" = gera cobrança, cliente paga manualmente

**API:**
```bash
# Criar subconta
POST /v3/accounts
{
  "name": "Academia XYZ",
  "cpfCnpj": "12345678000199"
}
# Resposta inclui apiKey da subconta
```

---

### Zoop — White-label

**Pontos fortes:**
- White-label completo (você vira o "banco")
- Split por percentual ou valor absoluto
- KYC automático integrado (SLA 48h)
- PIX recorrente via API
- Máxima flexibilidade

**Limitações:**
- Taxas sob consulta (B2B)
- Mais complexo de implementar
- Geralmente mais caro

---

### Pagar.me (Stone)

**Pontos fortes:**
- API moderna e bem documentada
- Recipients com split automático
- Marketplace ready
- Recorrência com cartão funciona bem

**Limitações:**
- PIX Automático "ainda não disponível para criar ofertas"
- Taxa 1,19% por PIX
- Onboarding de recipients não instantâneo

---

### Iugu

**Pontos fortes:**
- Foco em recorrência (planos/assinaturas)
- Split configurável por fatura
- API bem estruturada

**Limitações:**
- Requer CNPJ
- PIX R$1,50 por transação (fixo)
- Planos com mensalidade
- Contrato obrigatório

---

### PagBank/PagSeguro

**Pontos fortes:**
- PIX grátis
- Até 25 recebedores por split
- API completa (Orders API)

**Limitações:**
- PIX Automático ainda limitado
- Seller precisa ter conta PagSeguro
- Onboarding via OAuth (mais complexo)

---

## Nota sobre PIX Automático

O **PIX Automático** (débito recorrente sem interação do usuário) foi lançado pelo BC em **junho/2025** e tornou-se obrigatório em **outubro/2025**.

**Status atual:**
- Maioria dos provedores oferece "recorrência" = geração automática de QR Code (cliente paga manualmente)
- PIX Automático real (débito direto) = ainda limitado na maioria das plataformas
- **Efí Bank** é um dos que já tem PIX Automático implementado

---

## Decisão

**Escolha:** Efí Bank

**Motivo:** Único provedor (entre os pesquisados) com:
1. API de Abertura de Contas para criar subcontas automaticamente
2. PIX Automático real implementado
3. Split nativo entre contas
4. SDK Go oficial

**Fallback:** Se a aprovação da API de Abertura de Contas demorar, considerar Asaas como alternativa (PIX grátis, subcontas fáceis, mas sem débito automático ainda).

---

*Última atualização: 2026-02-08*
