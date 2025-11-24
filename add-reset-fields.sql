-- Adicionar campos para recuperação de senha na tabela users
ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "resetCode" TEXT,
ADD COLUMN IF NOT EXISTS "resetCodeExpires" TIMESTAMP(3);

-- Criar índice para melhorar performance nas buscas por resetCode
CREATE INDEX IF NOT EXISTS "users_resetCode_idx" ON "public"."users"("resetCode");
