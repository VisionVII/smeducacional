#!/bin/bash

# 🔍 Script de Diagnóstico Automático - Chat IA Travado
# Use: bash diagnostic.sh <USER_ID>

if [ -z "$1" ]; then
  echo "❌ Use: bash diagnostic.sh <USER_ID>"
  echo "Exemplo: bash diagnostic.sh user_123abc"
  exit 1
fi

USER_ID="$1"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_FILE="diagnostic_${USER_ID}_${TIMESTAMP}.txt"

echo "🔍 Coletando diagnóstico para: $USER_ID"
echo "📁 Salvando em: $OUTPUT_FILE"
echo ""

{
  echo "=========================================="
  echo "DIAGNÓSTICO CHAT IA - USUÁRIO TRAVADO"
  echo "=========================================="
  echo "Data: $(date)"
  echo "Usuário: $USER_ID"
  echo ""

  # 1. FeaturePurchase
  echo "1️⃣ FEATURE PURCHASE"
  echo "---"
  psql -U postgres -d sm_educa -c "
    SELECT 
      id, 
      \"userId\", 
      \"featureId\", 
      status, 
      \"purchaseDate\", 
      \"stripePaymentId\",
      amount,
      currency
    FROM \"FeaturePurchase\" 
    WHERE \"userId\" = '$USER_ID'
    AND \"featureId\" = 'ai-assistant'
    ORDER BY \"createdAt\" DESC
    LIMIT 1;
  "
  echo ""

  # 2. Payment
  echo "2️⃣ PAYMENT"
  echo "---"
  psql -U postgres -d sm_educa -c "
    SELECT 
      id, 
      \"userId\", 
      \"stripePaymentId\", 
      amount,
      currency,
      status,
      type,
      \"paymentMethod\",
      \"createdAt\"
    FROM \"Payment\" 
    WHERE \"userId\" = '$USER_ID'
    AND type = 'feature'
    ORDER BY \"createdAt\" DESC
    LIMIT 1;
  "
  echo ""

  # 3. CheckoutSession
  echo "3️⃣ CHECKOUT SESSION"
  echo "---"
  psql -U postgres -d sm_educa -c "
    SELECT 
      id, 
      \"userId\", 
      \"stripeSessionId\",
      status,
      \"paymentIntentId\",
      \"createdAt\"
    FROM \"CheckoutSession\" 
    WHERE \"userId\" = '$USER_ID'
    ORDER BY \"createdAt\" DESC
    LIMIT 1;
  "
  echo ""

  # 4. AuditLog
  echo "4️⃣ AUDIT LOG (Pagamentos)"
  echo "---"
  psql -U postgres -d sm_educa -c "
    SELECT 
      id, 
      \"userId\", 
      action,
      \"targetId\",
      \"targetType\",
      \"createdAt\"
    FROM \"AuditLog\" 
    WHERE \"userId\" = '$USER_ID'
    AND action IN ('PAYMENT_CREATED', 'PAYMENT_WEBHOOK_PROCESSED')
    ORDER BY \"createdAt\" DESC
    LIMIT 5;
  "
  echo ""

  # 5. StudentSubscription
  echo "5️⃣ STUDENT SUBSCRIPTION"
  echo "---"
  psql -U postgres -d sm_educa -c "
    SELECT 
      id, 
      \"userId\", 
      status,
      plan,
      \"stripeSubscriptionId\",
      \"createdAt\"
    FROM \"StudentSubscription\" 
    WHERE \"userId\" = '$USER_ID'
    ORDER BY \"createdAt\" DESC
    LIMIT 1;
  "
  echo ""

  # 6. User Info
  echo "6️⃣ USER INFO"
  echo "---"
  psql -U postgres -d sm_educa -c "
    SELECT 
      id,
      name,
      email,
      role,
      \"createdAt\",
      \"emailVerified\"
    FROM \"User\" 
    WHERE id = '$USER_ID';
  "
  echo ""

  echo "=========================================="
  echo "✅ Diagnóstico Completo"
  echo "=========================================="

} | tee "$OUTPUT_FILE"

echo ""
echo "📁 Arquivo salvo: $OUTPUT_FILE"
echo "💡 Dica: cole o conteúdo em um arquivo para análise"
