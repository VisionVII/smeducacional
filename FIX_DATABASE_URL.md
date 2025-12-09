# 🔧 CORREÇÃO URGENTE - DATABASE_URL com Caracteres Especiais

## ❌ Problema Identificado nos Logs

```
Error parsing connection string: invalid port number in database URL
```

A senha do banco tem caracteres especiais que precisam ser **URL-encoded** no Vercel.

---

## ✅ SOLUÇÃO - Substitua as URLs no Vercel

Acesse: **https://vercel.com/visionvii/smeducacional/settings/environment-variables**

### 1. DATABASE_URL (CORRIJA AGORA!)

**❌ REMOVA a URL antiga**

**✅ ADICIONE a URL correta** (senha codificada):

```
postgresql://postgres.okxgsvalfwxxoxcfxmhc:S9f%21A7%23pQ2%40dL8%25rX4%24zN1%26@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&pool_timeout=0&connect_timeout=10
```

**Ambientes**: Production, Preview, Development

---

### 2. DIRECT_URL (CORRIJA TAMBÉM!)

**❌ REMOVA a URL antiga**

**✅ ADICIONE a URL correta** (senha codificada):

```
postgresql://postgres.okxgsvalfwxxoxcfxmhc:S9f%21A7%23pQ2%40dL8%25rX4%24zN1%26@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?connect_timeout=10
```

**Ambientes**: Production, Preview, Development

---

## 📋 Tabela de Conversão (para entender)

| Caractere | URL-Encoded |
| --------- | ----------- |
| `!`       | `%21`       |
| `#`       | `%23`       |
| `$`       | `%24`       |
| `%`       | `%25`       |
| `&`       | `%26`       |
| `@`       | `%40`       |

Senha original: `S9f!A7#pQ2@dL8%rX4$zN1&`
Senha codificada: `S9f%21A7%23pQ2%40dL8%25rX4%24zN1%26`

---

## ⚡ Próximos Passos

1. **Edite as duas variáveis no Vercel**

   - Clique em "Edit" em DATABASE_URL
   - Cole a nova URL com `%21`, `%23`, etc.
   - Faça o mesmo para DIRECT_URL

2. **Force redeploy**

   ```powershell
   git commit --allow-empty -m "Trigger redeploy with fixed DB URLs"
   git push
   ```

3. **Aguarde 2-3 minutos**

4. **Teste login novamente!**

---

## 🎯 Após Corrigir

O erro "invalid port number" vai sumir e o login deve funcionar! 🚀
