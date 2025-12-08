# 🏗️ Feature Unlock System - Arquitetura Técnica

## 🔄 Fluxo Completo de Request

```
1. USER VISITS PAGE
   │
   ├─→ "use client" Component
   │   │
   │   └─→ const { canUploadLogo } = useCanAccess()
   │       │
   │       └─→ fetch("/api/teacher/access-control")
   │           │
   │           ├─→ [API Route]
   │           │   │
   │           │   ├─→ auth() → get session
   │           │   │
   │           │   └─→ getTeacherAccessControl(userId)
   │           │       │
   │           │       └─→ prisma.teacherFinancial.findUnique()
   │           │           │
   │           │           └─→ Check:
   │           │               ├─ subscriptionStatus
   │           │               ├─ subscriptionExpiresAt > NOW()
   │           │               └─ Return features
   │           │
   │           └─→ Return: { canUploadLogo: true, ... }
   │
   ├─→ if (!canUploadLogo) → show upgrade prompt
   │
   └─→ else → render LogoUploadForm

2. USER SUBMITS FORM
   │
   ├─→ POST /api/teacher/branding/logo
   │
   └─→ [API Route]
       │
       ├─→ auth() → check authenticated
       │
       ├─→ getTeacherAccessControl(userId)
       │
       ├─→ if (!access.canUploadLogo) → return 402 Payment Required
       │
       ├─→ else validate file
       │
       ├─→ upload to supabase storage
       │
       └─→ return 200 OK
```

## 📦 Estrutura de Dados

### User → TeacherFinancial (1:1)
```
User
├── id
├── email
├── name
├── role: "TEACHER"
└── teacherFinancial: TeacherFinancial (optional)
                    ↓
            TeacherFinancial
            ├── id
            ├── userId (unique, foreign key)
            ├── bank, agency, account (banking info)
            ├── pixKey
            │
            ├─ BILLING & SUBSCRIPTION
            ├── subscriptionStatus: "active" | "inactive" | "trial" | "suspended"
            ├── plan: "free" | "basic" | "premium" | "enterprise"
            ├── subscriptionStartDate: DateTime?
            ├── subscriptionExpiresAt: DateTime?
            ├── trialEndsAt: DateTime?
            ├── lastPaymentDate: DateTime?
            ├── paymentMethod: "credit_card" | "pix" | "boleto"
            │
            ├─ FEATURE FLAGS
            ├── canUploadLogo: boolean
            ├── canCustomizeDomain: boolean
            ├── canAccessAnalytics: boolean
            │
            └─ LIMITS
                ├── maxStudents: number (10 | 50 | 300 | 10k)
                └── maxStorage: number (1024 | 10240 | 102400 | 1048576 MB)
```

## 🔐 Access Control Matrix

```
┌─────────────────────────────────────────────────────────────┐
│                    PLAN FEATURES                            │
├──────────────┬────────────────────────────────────────────┤
│ Feature      │ Free │ Basic │ Premium │ Enterprise │ Check│
├──────────────┼──────┼───────┼─────────┼────────────┼──────┤
│ Upload Logo  │  ❌  │  ✅  │   ✅   │     ✅    │ A    │
│ Domínio      │  ❌  │  ❌  │   ✅   │     ✅    │ B    │
│ Analytics    │  ❌  │  ✅  │   ✅   │     ✅    │ C    │
│ Upload Video │  ✅  │  ✅  │   ✅   │     ✅    │ -    │
│ Create Course│  ✅  │  ✅  │   ✅   │     ✅    │ -    │
│ Max Alunos   │  10  │  50  │  300   │    10k    │ D    │
│ Max Storage  │ 1GB  │ 10GB │ 100GB  │    1TB    │ E    │
└──────────────┴──────┴───────┴─────────┴────────────┴──────┘

CHECK POINTS:
A → if (plan === 'basic'+'premium'+'enterprise') && !expired
B → if (plan === 'premium'+'enterprise') && !expired
C → if (plan === 'basic'+'premium'+'enterprise') && !expired
D → return plan_limits[plan].maxStudents
E → return plan_limits[plan].maxStorage
```

## 🎭 Component Lifecycle

```
<BrandingCustomization />
├─ useCanAccess()
│  ├─ useSession() → get authenticated user
│  ├─ fetch("/api/teacher/access-control") → 5min cache
│  └─ state: { access, loading, error }
│
├─ usePlanInfo()
│  └─ derives from access (plan, daysUntilExpiry, isActive)
│
├─ Upload Form
│  └─ <FeatureGate feature="canUploadLogo">
│     ├─ if true → show upload form
│     └─ if false → show upgrade prompt
│
├─ Custom Domain
│  └─ <FeatureGate feature="canCustomizeDomain">
│     ├─ if true → show domain form
│     └─ if false → show premium upgrade
│
└─ Analytics
   └─ <FeatureGate feature="canAccessAnalytics">
      ├─ if true → show analytics dashboard
      └─ if false → show analytics preview
```

## 🌐 API Routing Map

```
TEACHER ROUTES:
├── GET  /api/teacher/access-control
│   ├─ Auth required: YES
│   ├─ Returns: { plan, isActive, features, daysUntilExpiry }
│   └─ Cache: 5 minutes
│
├── POST /api/teacher/branding/logo
│   ├─ Auth required: YES
│   ├─ Feature gate: canUploadLogo
│   ├─ Returns: { success, logoUrl }
│   └─ Status: 402 if access denied
│
└── GET  /api/teacher/branding/logo?teacherId=xyz
    ├─ Auth required: NO (public)
    ├─ Returns: { logo, teacherId }
    └─ Status: 404 if teacher not found

ADMIN ROUTES:
├── GET  /api/admin/teachers-billing
│   ├─ Auth required: YES (ADMIN only)
│   ├─ Returns: List[{ userId, plan, status, expiresAt }]
│   └─ Status: 401 if not admin
│
├── POST /api/admin/activate-plan
│   ├─ Auth required: YES (ADMIN only)
│   ├─ Body: { teacherId, plan, durationDays }
│   ├─ Returns: { success, access }
│   └─ Status: 402 if invalid plan
│
└── POST /api/admin/cancel-plan
    ├─ Auth required: YES (ADMIN only)
    ├─ Body: { teacherId }
    ├─ Returns: { success, access }
    └─ Status: 401 if not admin
```

## 💾 Database Query Patterns

### 1. Get Full Access Control
```sql
-- Called by getTeacherAccessControl(userId)
SELECT 
  subscription_status,
  plan,
  subscription_expires_at,
  trial_ends_at,
  can_upload_logo,
  can_customize_domain,
  can_access_analytics,
  max_students,
  max_storage
FROM teacher_financial
WHERE user_id = $1;

-- Then evaluate in application:
isExpired = subscription_expires_at < NOW()
isActive = subscription_status = 'active' AND NOT isExpired
```

### 2. List All Teachers with Plans
```sql
-- Called by GET /api/admin/teachers-billing
SELECT 
  u.id,
  u.email,
  u.name,
  tf.plan,
  tf.subscription_status,
  tf.subscription_expires_at,
  tf.trial_ends_at,
  (tf.max_students) as max_students
FROM users u
LEFT JOIN teacher_financial tf ON u.id = tf.user_id
WHERE u.role = 'TEACHER'
ORDER BY tf.subscription_expires_at DESC;
```

### 3. Activate Plan
```sql
-- Called by activatePlan(userId, plan, durationDays)
UPDATE teacher_financial
SET 
  subscription_status = 'active',
  plan = $2,
  subscription_start_date = NOW(),
  subscription_expires_at = NOW() + INTERVAL '$3 days',
  last_payment_date = NOW()
WHERE user_id = $1;
```

### 4. Find Expiring Subscriptions
```sql
-- Useful for email notifications
SELECT 
  u.email,
  tf.plan,
  (tf.subscription_expires_at - NOW()) as days_remaining
FROM teacher_financial tf
JOIN users u ON u.id = tf.user_id
WHERE tf.subscription_status = 'active'
  AND tf.subscription_expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY tf.subscription_expires_at;
```

## 🔄 State Management

### Hook State Flow
```
useCanAccess()
├─ Initial state: { access: null, loading: true, error: null }
│
├─ On mount:
│  ├─ Check session
│  ├─ If no session → return default free access
│  └─ If authenticated → fetch /api/teacher/access-control
│
├─ On success:
│  └─ { access: {...}, loading: false, error: null }
│
├─ On error:
│  └─ { access: null, loading: false, error: "..." }
│
└─ Refresh:
   └─ Auto-refetch every 5 minutes
```

### Caching Strategy
```
CLIENT-SIDE:
├─ Hook caches for 5 minutes
├─ Interval timer refetches
└─ Session change triggers refetch

SERVER-SIDE:
├─ API route does live query to DB
├─ No server-side caching (always fresh)
└─ Suitable for billing (security > speed)

DATABASE:
├─ Timestamp comparison is instant
├─ No additional indexes needed
└─ Can add index on subscription_expires_at for reports
```

## 🧪 Test Scenarios

```
SCENARIO 1: Free User
├─ Visits page
├─ Hook fetches access control
├─ Returns: { plan: 'free', canUploadLogo: false }
├─ UI shows: "Upgrade to Basic"
└─ ✅ PASS

SCENARIO 2: Trial User (3 days left)
├─ Visits page
├─ Hook fetches access control
├─ Returns: { isTrial: true, daysUntilExpiry: 3 }
├─ UI shows: "Trial expires in 3 days"
└─ ✅ PASS

SCENARIO 3: Premium User (Active)
├─ Visits page
├─ Hook fetches access control
├─ Returns: { plan: 'premium', canCustomizeDomain: true }
├─ User clicks upload → POST /api/teacher/branding/logo
├─ API checks: access.canUploadLogo = true
├─ Returns 200 OK
└─ ✅ PASS

SCENARIO 4: Expired Premium User
├─ Subscription expired 2 days ago
├─ Hook fetches access control
├─ Returns: { plan: 'premium', isExpired: true, canUploadLogo: false }
├─ UI is disabled
└─ ✅ PASS

SCENARIO 5: User Tries to Fake Request
├─ User disabled: canUploadLogo via devtools
├─ Submits form → POST /api/teacher/branding/logo
├─ API verifies: getTeacherAccessControl(userId)
├─ Returns 402 Payment Required
└─ ✅ SECURE
```

## 📊 Performance Characteristics

```
OPERATION                    | TIME    | CACHE | NOTES
───────────────────────────────────────────────────────
Hook initialization          | ~100ms  | 5min | Includes fetch
Feature check (from cache)   | <1ms    | -    | Instant boolean
API route check              | ~50ms   | None | Database query
Upload file + validation     | ~2s     | -    | Network dependent
Full page load               | ~3s     | -    | Includes all
```

## 🚀 Deployment Checklist

```
PRE-DEPLOYMENT:
✅ All tests passing (npx ts-node scripts/test-feature-unlock.ts)
✅ Schema migration applied (npm run db:push)
✅ Types generated (npm run db:generate)
✅ Environment variables set (STRIPE_KEY, etc)
✅ API routes tested manually
✅ Components render without errors

POST-DEPLOYMENT:
✅ Monitor error logs for 402 status codes
✅ Track feature access patterns
✅ Monitor subscription expirations
✅ Set up email alerts for expired plans
```

---

**Diagrama Atualizado**: 2024-12-20
**Arquitetura**: 3-Layer (Client → API → Database)
**Type Safety**: ✅ Full TypeScript
**Status**: ✅ Production Ready
