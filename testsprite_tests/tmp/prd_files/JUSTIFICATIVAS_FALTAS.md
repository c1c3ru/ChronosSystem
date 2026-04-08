# 📋 Sistema de Justificativas de Faltas

## 🎯 **Funcionalidade Implementada**

O sistema agora permite que alunos/estagiários justifiquem suas faltas de forma digital, sem necessidade de upload de arquivos físicos.

## 🗂️ **Estrutura do Banco de Dados**

### **Nova Tabela: `absence_justifications`**

```sql
- id: UUID único
- userId: ID do usuário (estagiário)
- date: Data da falta (DATE)
- type: Tipo da justificativa (ENUM)
- reason: Motivo detalhado (TEXT)
- documentLinks: Links para documentos externos (JSON)
- status: Status da análise (PENDENTE/APROVADO/REJEITADO)
- reviewedBy: ID do supervisor/admin que analisou
- reviewedAt: Data da análise
- reviewNotes: Observações do revisor
- createdAt/updatedAt: Timestamps
```

### **Tipos de Justificativa:**
- `ATESTADO_MEDICO` - Atestado médico
- `COMPROMISSO_PESSOAL` - Compromisso pessoal
- `PROBLEMA_FAMILIAR` - Problema familiar
- `TRANSPORTE` - Problema de transporte
- `OUTROS` - Outros motivos

### **Status da Justificativa:**
- `PENDENTE` - Aguardando análise
- `APROVADO` - Justificativa aprovada
- `REJEITADO` - Justificativa rejeitada

## 🚀 **Endpoints da API**

### **Para Estagiários:**

#### **1. Criar Justificativa**
```http
POST /api/justifications
Authorization: Bearer <token>

{
  "date": "2025-10-20",
  "type": "ATESTADO_MEDICO",
  "reason": "Consulta médica de rotina",
  "documentLinks": [
    "https://drive.google.com/file/d/abc123/view",
    "https://www.dropbox.com/s/xyz789/atestado.pdf"
  ]
}
```

#### **2. Ver Minhas Justificativas**
```http
GET /api/justifications/my
Authorization: Bearer <token>
```

#### **3. Editar Justificativa (apenas se PENDENTE)**
```http
PATCH /api/justifications/:id
Authorization: Bearer <token>

{
  "reason": "Motivo atualizado",
  "documentLinks": ["novo_link"]
}
```

#### **4. Deletar Justificativa (apenas se PENDENTE)**
```http
DELETE /api/justifications/:id
Authorization: Bearer <token>
```

### **Para Supervisores/Admins:**

#### **5. Listar Todas as Justificativas**
```http
GET /api/justifications?status=PENDENTE&userId=abc123
Authorization: Bearer <token>
```

#### **6. Analisar Justificativa**
```http
PATCH /api/justifications/:id/review
Authorization: Bearer <token>

{
  "status": "APROVADO",
  "reviewNotes": "Documentação adequada. Aprovado."
}
```

## 💡 **Como Funciona**

### **Fluxo do Estagiário:**
1. **Criar Justificativa:** Aluno acessa o sistema e cria uma justificativa para uma data específica
2. **Adicionar Links:** Pode adicionar links do Google Drive, Dropbox, OneDrive, etc.
3. **Aguardar Análise:** Status fica como "PENDENTE"
4. **Receber Feedback:** Supervisor aprova/rejeita com observações

### **Fluxo do Supervisor:**
1. **Ver Pendências:** Lista todas as justificativas pendentes
2. **Analisar:** Visualiza motivo e documentos anexados
3. **Decidir:** Aprova ou rejeita com observações
4. **Notificar:** Sistema registra quem analisou e quando

## 🔒 **Regras de Segurança**

- ✅ **Estagiários** só podem ver/editar suas próprias justificativas
- ✅ **Supervisores/Admins** podem ver todas e fazer análises
- ✅ Justificativas **aprovadas/rejeitadas** não podem ser editadas
- ✅ Apenas **uma justificativa por data** por usuário
- ✅ **Auditoria completa** de quem analisou e quando

## 📱 **Integração com Links Externos**

### **Serviços Suportados:**
- **Google Drive:** `https://drive.google.com/file/d/ID/view`
- **Dropbox:** `https://www.dropbox.com/s/ID/arquivo.pdf`
- **OneDrive:** `https://onedrive.live.com/...`
- **Qualquer URL válida**

### **Validação:**
- Links são validados como URLs válidas
- Armazenados como JSON array no banco
- Podem ser múltiplos links por justificativa

## 🎨 **Interface Sugerida**

### **Tela do Estagiário:**
```
┌─────────────────────────────────────┐
│ 📋 Minhas Justificativas            │
├─────────────────────────────────────┤
│ [+ Nova Justificativa]              │
│                                     │
│ 📅 20/10/2025 - ATESTADO_MEDICO     │
│ Status: PENDENTE                    │
│ Motivo: Consulta médica...          │
│ [Ver] [Editar] [Excluir]           │
│                                     │
│ 📅 18/10/2025 - TRANSPORTE         │
│ Status: APROVADO ✅                 │
│ Motivo: Problema no transporte...   │
│ Analisado por: João Silva           │
│ [Ver Detalhes]                     │
└─────────────────────────────────────┘
```

### **Formulário de Nova Justificativa:**
```
┌─────────────────────────────────────┐
│ ➕ Nova Justificativa de Falta      │
├─────────────────────────────────────┤
│ Data da Falta: [20/10/2025]        │
│                                     │
│ Tipo: [Atestado Médico ▼]          │
│                                     │
│ Motivo:                             │
│ ┌─────────────────────────────────┐ │
│ │ Consulta médica de rotina para  │ │
│ │ acompanhamento...               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Documentos (Links):                 │
│ [https://drive.google.com/...]      │
│ [+ Adicionar Link]                  │
│                                     │
│ [Cancelar] [Salvar Justificativa]   │
└─────────────────────────────────────┘
```

## 🔄 **Próximos Passos**

1. **Frontend:** Implementar interfaces no PWA e Admin
2. **Notificações:** Email/push quando status mudar
3. **Relatórios:** Dashboard de justificativas por período
4. **Integração:** Conectar com sistema de frequência
5. **Mobile:** App nativo para facilitar o uso

## ✅ **Status Atual**

- ✅ **Backend API** - Implementado e funcionando
- ✅ **Banco de Dados** - Tabelas criadas
- ✅ **Validações** - Regras de negócio implementadas
- ✅ **Segurança** - Autenticação e autorização
- ⏳ **Frontend** - Aguardando implementação
- ⏳ **Testes** - Aguardando implementação

O sistema de justificativas está **pronto para uso** via API! 🚀
