# 📜 Certificados PDF - Documentação

**Status**: ✅ Implementado  
**Data**: 10 de dezembro de 2025  
**Sprint**: Fase 7 - Sprint 1.1

---

## 🎯 Objetivo

Gerar certificados profissionais em PDF para alunos que completarem cursos, com:

- Design elegante e profissional
- QR Code para verificação de autenticidade
- Página pública de verificação
- Download direto pelo aluno

---

## 📁 Arquivos Criados/Modificados

### **Novos Arquivos**

1. **`src/lib/certificates.ts`**

   - Função principal: `generateCertificatePDF()`
   - Geração de PDF com jsPDF
   - QR Code com biblioteca `qrcode`
   - Funções auxiliares:
     - `generateCertificateNumber()` - Número único
     - `canIssueCertificate()` - Validação
     - `issueCertificate()` - Emissão

2. **`src/app/api/student/certificates/[id]/download/route.ts`**

   - GET endpoint para download de PDF
   - Autenticação obrigatória
   - Retorna PDF como stream

3. **`src/app/api/student/certificates/issue/route.ts`**

   - POST endpoint para emitir certificado
   - Validação Zod
   - Verifica conclusão do curso

4. **`src/app/verify-certificate/[certificateNumber]/page.tsx`**
   - Página pública de verificação
   - Design verde (válido) / vermelho (inválido)
   - Informações do certificado

### **Arquivos Modificados**

1. **`src/app/student/certificates/page.tsx`**
   - Adicionado botão "Baixar PDF"
   - Função `handleDownload()` com toast feedback
   - Removido botão "Visualizar" (substituído por download)

---

## 🎨 Design do Certificado

### **Layout**

- **Orientação**: Landscape (A4)
- **Bordas**: Duplas decorativas (azul primary)
- **Seções**:
  1. Cabeçalho: "CERTIFICADO DE CONCLUSÃO"
  2. Corpo: Nome do aluno + Curso + Carga horária
  3. Rodapé: Assinaturas (Instrutor + VisionVII)
  4. QR Code: Canto inferior direito
  5. Número: Canto inferior esquerdo

### **Tipografia**

- **Título**: Helvetica Bold 32pt (azul primary)
- **Nome do aluno**: Helvetica Bold 24pt (azul primary)
- **Curso**: Helvetica Bold 20pt (cinza escuro)
- **Corpo**: Helvetica Regular 14pt (cinza médio)
- **Rodapé**: Helvetica Regular 10pt

### **Cores**

- **Primary**: RGB(59, 130, 246) - blue-500
- **Texto**: RGB(60, 60, 60) - cinza escuro
- **Muted**: RGB(100, 100, 100) - cinza médio

---

## 🔐 Segurança & Validação

### **Número do Certificado**

```typescript
Formato: CERT - { timestamp } - { random };
Exemplo: CERT - LKJ3H5 - A8F9K2;
```

- **Timestamp**: Base36 do Date.now()
- **Random**: 6 caracteres aleatórios Base36
- **Único**: Garantido no banco (unique constraint)

### **QR Code**

- **URL**: `{NEXTAUTH_URL}/verify-certificate/{certificateNumber}`
- **Tamanho**: 25mm x 25mm
- **Margin**: 1 (mínimo)
- **Cor**: Preto sobre branco

### **Verificação**

1. Escanear QR Code
2. Abrir página pública
3. Validar no banco de dados
4. Exibir informações ou erro

---

## 🚀 Fluxo de Uso

### **Emissão Automática** (futuro)

```
Aluno completa curso (progress = 100%)
    ↓
Sistema verifica: enrollment.status = COMPLETED
    ↓
Gera certificado automaticamente
    ↓
Notifica aluno via email
```

### **Emissão Manual** (atual)

```
Aluno vai em /student/certificates
    ↓
Clica em "Emitir Certificado" (se disponível)
    ↓
API valida conclusão do curso
    ↓
Cria registro no banco
    ↓
Certificado aparece na lista
```

### **Download**

```
Aluno clica em "Baixar PDF"
    ↓
Frontend chama /api/student/certificates/{id}/download
    ↓
Backend gera PDF em tempo real
    ↓
Retorna stream de bytes
    ↓
Browser faz download do arquivo
```

---

## 📊 Modelo de Dados

### **Certificate (Prisma)**

```prisma
model Certificate {
  id                String   @id @default(cuid())
  certificateNumber String   @unique
  studentId         String
  courseId          String
  issuedAt          DateTime @default(now())
  validUntil        DateTime?

  student User   @relation(fields: [studentId], references: [id])
  course  Course @relation(fields: [courseId], references: [id])
}
```

### **Relações**

- `User` (Student) → `Certificate` (1:N)
- `Course` → `Certificate` (1:N)

---

## 🧪 Testes

### **Manual**

1. ✅ Completar um curso
2. ✅ Acessar `/student/certificates`
3. ✅ Clicar em "Baixar PDF"
4. ✅ Verificar PDF baixado
5. ✅ Escanear QR Code
6. ✅ Validar na página pública

### **Cenários de Erro**

- ❌ Tentar baixar certificado de outro aluno
- ❌ Tentar emitir certificado sem completar curso
- ❌ Tentar emitir certificado duplicado
- ❌ QR Code com número inválido

---

## 🔧 Configuração

### **Variáveis de Ambiente**

```env
NEXTAUTH_URL=https://smeducacional.vercel.app
```

> **Importante**: Usada para gerar URL de verificação no QR Code

### **Dependências**

```json
{
  "jspdf": "^3.0.4", // Já instalado
  "qrcode": "^1.5.4" // Já instalado
}
```

---

## 📈 Melhorias Futuras

### **Fase 8 - Possíveis Melhorias**

1. **Envio por Email**

   - Anexar PDF no email de conclusão
   - Template específico para certificado

2. **Compartilhamento Social**

   - LinkedIn integration
   - Botão "Compartilhar no LinkedIn"

3. **Templates Customizáveis**

   - Admin pode customizar design
   - Logo da instituição
   - Cores personalizadas

4. **Assinatura Digital**

   - Certificado assinado digitalmente
   - Padrão ICP-Brasil (avançado)

5. **Histórico de Versões**

   - Regenerar certificado com novo design
   - Manter histórico de emissões

6. **Analytics**

   - Quantos certificados gerados
   - Taxa de verificação via QR Code
   - Certificados mais compartilhados

7. **Batch Generation**
   - Admin gera certificados em lote
   - Para todos alunos de um curso

---

## 🐛 Troubleshooting

### **PDF não gera**

- Verificar logs do servidor
- Confirmar que certificado existe no banco
- Validar session do usuário

### **QR Code não funciona**

- Verificar `NEXTAUTH_URL` está correto
- Testar URL manualmente
- Confirmar formato do certificateNumber

### **Download não inicia**

- Verificar Content-Type headers
- Testar em browser diferente
- Confirmar que PDF foi gerado (console.log buffer size)

---

## 📞 Suporte

**Issues**: GitHub repository  
**Documentação**: `/docs/features/certificates/`  
**API Docs**: `/docs/api/student.md#certificates`

---

**Desenvolvido com excelência pela VisionVII** — Software, inovação e transformação digital.
