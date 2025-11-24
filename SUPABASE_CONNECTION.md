# Como Obter a Connection String do Supabase

## Método 1: Via Supabase Dashboard

1. No menu lateral **esquerdo**, clique no ícone de **Settings** (⚙️) no canto inferior
2. Clique em **"Database"**
3. Role para CIMA na página
4. Procure pela seção **"Connection string"**
5. Você verá abas: **URI**, **JDBC**, **Session**, **Transaction**
6. Copie o valor da aba **"URI"** (formato Transaction pooling)

## Método 2: Montar Manualmente

Use este formato (substitua os valores):

```
postgresql://postgres.rcblsqgwyvoospfsfyyf:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**IMPORTANTE**: Substitua `[SUA-SENHA]` pela senha que você definiu ao criar o projeto Supabase!

## Onde está a senha?

- É a senha que você criou quando configurou o projeto Supabase pela primeira vez
- Se não lembra, você pode resetar em: **Settings → Database → Reset database password**

## Sua Connection String (incompleta):

Baseado no seu Project ID: `rcblsqgwyvoospfsfyyf`

**Transaction Mode (Recomendado para Prisma):**
```
postgresql://postgres.rcblsqgwyvoospfsfyyf:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Session Mode (Alternativa):**
```
postgresql://postgres.rcblsqgwyvoospfsfyyf:[SUA-SENHA]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Direct Connection:**
```
postgresql://postgres:[SUA-SENHA]@db.rcblsqgwyvoospfsfyyf.supabase.co:5432/postgres
```

---

## Próximos Passos

1. Copie UMA das strings acima
2. Substitua `[SUA-SENHA]` pela sua senha real
3. Cole no arquivo `.env` na variável `DATABASE_URL`
4. Execute: `npx prisma db push`
5. Execute: `npx prisma db seed`
6. Teste: `npm run dev`
