# 🔐 PHASE 3: Feature Access Logic & Admin Override System

**Status:** READY TO PLAN  
**Lead:** SecureOpsAI  
**Timeline:** 15-25 January 2025  
**Blocking Issues:** None  
**Dependencies:** Phase 1.3 Complete ✅, Phase 2.6 Complete ✅

---

## 📋 Objective

Implement granular feature access control system with:

1. **FeaturePolicy Model** - Define which users get which features
2. **FeatureException Model** - Admin overrides for individual users
3. **Feature Control Service** - Business logic for access checks
4. **Admin Management UI** - Feature manager dashboard
5. **Three Dashboard Perspectives** - Developer, Finance, Entrepreneur views
6. **Admin 100% Access Guarantee** - No feature locked for admins

---

## 🎯 User Request Requirement

> "o admin tem acesso garantido 100% - Crie uma logica de negocio para isso"

**Translation:** "The admin has guaranteed 100% access - Create business logic for this"

**Implementation:**

- Admins (role='ADMIN') automatically bypass ALL feature checks
- No feature locks visible in admin menus
- No upsell/paywall for admin features
- Admin can grant/revoke features to other users
- Audit trail of admin feature changes

---

## 📊 Current State Analysis

### Existing Feature System

```prisma
model FeaturePurchase {
  id          String   @id @default(cuid())
  userId      String
  featureId   String   // "ai-assistant" | "mentorships" | "pro-tools"
  purchasedAt DateTime
  expiresAt   DateTime?
  user        User     @relation(fields: [userId], references: [id])
}
```

**Limitations:**

- ✗ Binary (purchased or not)
- ✗ No admin override capability
- ✗ No feature level configuration
- ✗ No access groups/plans
- ✗ No time-limited trials
- ✗ No audit trail

### Current Feature Menu Items

```typescript
ADMIN_SLOT_NAV: [
  {
    id: 'ai-chat',
    href: '/admin/ai-assistant',
    label: 'Chat IA',
    locked: true, // hardcoded
    featureId: 'ai-assistant',
    badge: 'Pro',
  },
  {
    id: 'mentorias',
    href: '/admin/plans/stripe',
    label: 'Mentorias',
    locked: false, // hardcoded
    featureId: 'mentorships',
  },
];
```

---

## 🏗️ Phase 3 Architecture

### 3.1 Database Models (Enhanced)

#### Feature Model (Configuration)

```prisma
model Feature {
  id          String       @id @default(cuid())

  // Identity
  slug        String       @unique  // "ai-assistant"
  name        String               // "Chat IA"
  description String?
  icon        String?              // lucide icon name

  // Pricing & Access
  baseAccess  FeatureLevel @default(FREE)  // FREE | PAID | ADMIN
  requiredPlan String?              // "PRO" | "ENTERPRISE" | null
  trialDays   Int?                  // 30 days free trial?

  // Configuration
  usageLimit  Int?                  // requests/month, null = unlimited
  dataLimit   Int?                  // GB/month, null = unlimited
  priority    Int          @default(0)  // sort order in UI
  isActive    Boolean      @default(true)

  // Lifecycle
  launchedAt  DateTime?
  deprecatedAt DateTime?

  // Relations
  policies    FeaturePolicy[]
  exceptions  FeatureException[]
  usageLogs   FeatureUsageLog[]

  @@index([slug])
  @@index([baseAccess])
  @@map("features")
}

enum FeatureLevel {
  FREE        // Available to all (no payment)
  PAID        // Requires subscription/purchase
  ADMIN       // Admin-only feature
  BETA        // Beta/preview feature
}
```

#### FeaturePolicy Model (Access Rules)

```prisma
model FeaturePolicy {
  id          String       @id @default(cuid())

  // Which feature
  featureId   String
  feature     Feature      @relation(fields: [featureId], references: [id], onDelete: Cascade)

  // Who has access
  userRole    UserRole?    // STUDENT | TEACHER | ADMIN | null (all)
  planType    String?      // "STARTER" | "PRO" | "ENTERPRISE" | null

  // Time-based access
  validFrom   DateTime     @default(now())
  validUntil  DateTime?    // null = forever

  // Usage limits override
  usageLimitOverride Int?
  dataLimitOverride  Int?

  // Conditions (JSON for flexibility)
  conditions  Json?        // { minEnrollments: 5, minCertificates: 2 }

  // Metadata
  createdBy   String       // admin ID
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  deletedAt   DateTime?    // soft delete

  user        User         @relation("PolicyCreatedBy", fields: [createdBy], references: [id], onDelete: Cascade)

  @@unique([featureId, userRole, planType])
  @@index([featureId])
  @@index([validFrom, validUntil])
  @@map("feature_policies")
}
```

#### FeatureException Model (Admin Overrides)

```prisma
model FeatureException {
  id          String       @id @default(cuid())

  // Which feature for which user
  featureId   String
  userId      String
  feature     Feature      @relation(fields: [featureId], references: [id], onDelete: Cascade)
  user        User         @relation("FeatureExceptions", fields: [userId], references: [id], onDelete: Cascade)

  // Exception type
  type        ExceptionType    // GRANT | REVOKE | OVERRIDE
  reason      String?          // "Lifetime premium" | "Trial extension"

  // Validity
  validFrom   DateTime     @default(now())
  validUntil  DateTime?    // null = permanent

  // Usage limits (can override policy)
  usageLimit  Int?
  dataLimit   Int?

  // Audit trail
  grantedBy   String       // admin ID
  grantedAt   DateTime     @default(now())
  revokedBy   String?      // admin ID
  revokedAt   DateTime?

  // Metadata
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  deletedAt   DateTime?    // soft delete

  admin       User         @relation("ExceptionGrantedBy", fields: [grantedBy], references: [id], onDelete: Cascade)
  revoker     User?        @relation("ExceptionRevokedBy", fields: [revokedBy], references: [id], onDelete: SetNull)

  @@unique([featureId, userId, validFrom])
  @@index([featureId, userId])
  @@index([validFrom, validUntil])
  @@map("feature_exceptions")
}

enum ExceptionType {
  GRANT    // Admin gives access
  REVOKE   // Admin removes access
  OVERRIDE // Temporarily override policy
}
```

#### FeatureUsageLog Model (Analytics)

```prisma
model FeatureUsageLog {
  id          String   @id @default(cuid())

  // Which feature
  featureId   String
  feature     Feature  @relation(fields: [featureId], references: [id], onDelete: Cascade)

  // Who used it
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Usage metrics
  action      String   // "upload" | "generate" | "access" | etc
  tokens      Int?     // for AI features
  dataUsed    Int?     // MB or GB used

  // Metadata
  metadata    Json?    // custom data per feature
  createdAt   DateTime @default(now())

  @@index([featureId, userId])
  @@index([userId])
  @@index([createdAt])
  @@map("feature_usage_logs")
}
```

**Migration SQL:**

```sql
-- Phase 3.1 Migration
-- Create Feature, FeaturePolicy, FeatureException, FeatureUsageLog models

CREATE TYPE feature_level AS ENUM ('FREE', 'PAID', 'ADMIN', 'BETA');
CREATE TYPE exception_type AS ENUM ('GRANT', 'REVOKE', 'OVERRIDE');

CREATE TABLE features (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  baseAccess feature_level NOT NULL DEFAULT 'FREE',
  requiredPlan VARCHAR(50),
  trialDays INT,
  usageLimit INT,
  dataLimit INT,
  priority INT NOT NULL DEFAULT 0,
  isActive BOOLEAN NOT NULL DEFAULT TRUE,
  launchedAt TIMESTAMP,
  deprecatedAt TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_features_slug ON features(slug);
CREATE INDEX idx_features_baseAccess ON features(baseAccess);
CREATE INDEX idx_features_isActive ON features(isActive);

-- Insert default features
INSERT INTO features (slug, name, baseAccess, priority) VALUES
  ('ai-assistant', 'Chat IA', 'PAID', 1),
  ('mentorships', 'Mentorias', 'PAID', 2),
  ('pro-tools', 'Ferramentas Pro', 'PAID', 3),
  ('analytics', 'Analytics Avançado', 'PAID', 4),
  ('team-collaboration', 'Colaboração em Equipe', 'FREE', 5);

CREATE TABLE feature_policies (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  featureId VARCHAR(255) NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  userRole VARCHAR(50),
  planType VARCHAR(50),
  validFrom TIMESTAMP NOT NULL DEFAULT NOW(),
  validUntil TIMESTAMP,
  usageLimitOverride INT,
  dataLimitOverride INT,
  conditions JSONB,
  createdBy VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  deletedAt TIMESTAMP,
  UNIQUE(featureId, userRole, planType)
);

CREATE INDEX idx_feature_policies_featureId ON feature_policies(featureId);
CREATE INDEX idx_feature_policies_userRole ON feature_policies(userRole);
CREATE INDEX idx_feature_policies_dates ON feature_policies(validFrom, validUntil);

CREATE TABLE feature_exceptions (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  featureId VARCHAR(255) NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  userId VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type exception_type NOT NULL,
  reason TEXT,
  validFrom TIMESTAMP NOT NULL DEFAULT NOW(),
  validUntil TIMESTAMP,
  usageLimit INT,
  dataLimit INT,
  grantedBy VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grantedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  revokedBy VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  revokedAt TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  deletedAt TIMESTAMP,
  UNIQUE(featureId, userId, validFrom)
);

CREATE INDEX idx_feature_exceptions_lookup ON feature_exceptions(featureId, userId);
CREATE INDEX idx_feature_exceptions_dates ON feature_exceptions(validFrom, validUntil);

CREATE TABLE feature_usage_logs (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  featureId VARCHAR(255) NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  userId VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  tokens INT,
  dataUsed INT,
  metadata JSONB,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feature_usage_logs_lookup ON feature_usage_logs(featureId, userId);
CREATE INDEX idx_feature_usage_logs_userId ON feature_usage_logs(userId);
CREATE INDEX idx_feature_usage_logs_createdAt ON feature_usage_logs(createdAt);
```

---

### 3.2 FeatureControlService (Business Logic)

**File:** `src/lib/services/FeatureControlService.ts` (600+ lines)

```typescript
// Core Methods
async checkFeatureAccess(
  userId: string,
  featureId: string,
  options?: { bypassAdmin?: boolean }
): Promise<FeatureAccessResult>

async grantFeatureToUser(
  userId: string,
  featureId: string,
  grantedBy: string,
  options?: { validUntil?: Date, reason?: string }
): Promise<FeatureException>

async revokeFeatureFromUser(
  userId: string,
  featureId: string,
  revokedBy: string,
  reason?: string
): Promise<void>

async logFeatureUsage(
  userId: string,
  featureId: string,
  action: string,
  metadata?: Record<string, any>
): Promise<void>

async getFeatureStatus(
  userId: string,
  featureId: string
): Promise<FeatureStatus>

async getAvailableFeatures(userId: string): Promise<Feature[]>

async checkUsageLimit(
  userId: string,
  featureId: string,
  tokensUsed: number
): Promise<boolean>

async createFeaturePolicy(
  featureId: string,
  policy: CreatePolicyInput,
  createdBy: string
): Promise<FeaturePolicy>

// Helper Methods
private isAdminUser(userId: string): boolean
private hasValidException(exception: FeatureException): boolean
private matchesPolicyConditions(user: User, conditions: Json): boolean
private calculateUsagePercentage(userId: string, featureId: string): Promise<number>
```

**Key Features:**

- ✅ Admin bypass (automatic for role='ADMIN')
- ✅ Time-based access (validFrom/validUntil)
- ✅ Usage limit enforcement
- ✅ Exception override system
- ✅ Audit trail (grantedBy, revokedBy, timestamps)
- ✅ Usage analytics
- ✅ Soft delete support
- ✅ Type-safe with Zod

**Implementation Details:**

```typescript
async checkFeatureAccess(userId: string, featureId: string): Promise<FeatureAccessResult> {
  // Step 1: Check if admin (automatic grant)
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role === 'ADMIN') {
    return {
      allowed: true,
      reason: 'ADMIN_BYPASS',
      isAdmin: true
    };
  }

  // Step 2: Check for active exceptions (overrides)
  const exception = await prisma.featureException.findFirst({
    where: {
      featureId,
      userId,
      type: { in: ['GRANT', 'OVERRIDE'] },
      validFrom: { lte: new Date() },
      validUntil: { gt: new Date() },
      deletedAt: null
    }
  });

  if (exception) {
    return {
      allowed: true,
      reason: 'EXCEPTION_GRANTED',
      grantedBy: exception.grantedBy,
      expiresAt: exception.validUntil
    };
  }

  // Step 3: Check feature policy
  const feature = await prisma.feature.findUnique({
    where: { id: featureId },
    include: { policies: true }
  });

  if (!feature) {
    return { allowed: false, reason: 'FEATURE_NOT_FOUND' };
  }

  // Step 4: Check if feature is active and not deprecated
  if (!feature.isActive || feature.deprecatedAt) {
    return { allowed: false, reason: 'FEATURE_INACTIVE' };
  }

  // Step 5: Apply policies
  for (const policy of feature.policies) {
    if (this.matchesPolicy(user, feature, policy)) {
      return {
        allowed: true,
        reason: 'POLICY_MATCH',
        usageLimit: policy.usageLimitOverride || feature.usageLimit
      };
    }
  }

  return {
    allowed: false,
    reason: 'NO_ACCESS',
    purchaseUrl: `/checkout/${feature.slug}`
  };
}
```

---

### 3.3 API Routes for Feature Management

#### GET /api/admin/features

```typescript
// List all features with current user access
// Response includes usage % and expiry dates
{
  features: {
    id: string
    slug: string
    name: string
    allowed: boolean
    expiresAt?: DateTime
    usagePercent?: number
    grantedBy?: string
  }[]
}
```

#### POST /api/admin/users/{userId}/features/{featureId}

```typescript
// Grant feature to user (admin only)
{
  validUntil?: DateTime
  reason?: string
  usageLimit?: number
}

Response: FeatureException
```

#### DELETE /api/admin/users/{userId}/features/{featureId}

```typescript
// Revoke feature from user (admin only)
{
  reason?: string
}
```

#### GET /api/admin/features/usage

```typescript
// Analytics dashboard
{
  features: {
    id: string;
    name: string;
    activeUsers: number;
    totalUsagePercent: number;
    trends: {
      date: string;
      users: number;
      usage: number;
    }
    [];
  }
  [];
}
```

#### POST /api/features/{featureId}/usage

```typescript
// Log feature usage (called by feature components)
{
  action: string
  tokens?: number
  dataUsed?: number
}
```

---

### 3.4 Frontend Implementation

#### Feature Manager Page

**File:** `src/app/admin/features/page.tsx`

```typescript
Features Grid:
├── Feature Cards (active/inactive toggle)
│   ├── Feature name + description
│   ├── Access level badge (FREE/PAID/ADMIN)
│   ├── User count using feature
│   ├── Edit button (policies)
│   └── Grant/Revoke buttons (override)
├── Search + Filter sidebar
│   ├── Filter by access level
│   ├── Filter by user role
│   └── Filter by status
└── User Access Management
    ├── Search for user
    ├── Show their features
    ├── Grant temporary access
    └── Revoke access with reason
```

#### Three Dashboard Perspectives

##### 1. Developer Dashboard (`/admin/dev-dashboard`)

```typescript
Purpose: System health, technical metrics, performance

Components:
├── API Usage Metrics
│   ├── Feature access checks/sec
│   ├── Policy evaluation time (avg)
│   ├── Database query performance
│   └── Cache hit ratio
├── Feature Flags & Status
│   ├── Active/Inactive features
│   ├── Feature rollout progress
│   ├── A/B test splits
│   └── Feature deprecation timeline
├── Integration Health
│   ├── Stripe API status
│   ├── Supabase connection health
│   ├── Email service status
│   └── Storage quota usage
└── Technical Logs
    ├── Feature access logs (sortable)
    ├── Error logs (categorized)
    ├── Audit trail (admin actions)
    └── Performance bottlenecks
```

##### 2. Finance Dashboard (`/admin/finance-dashboard`)

```typescript
Purpose: Revenue, user growth, payment analytics

Components:
├── Revenue Metrics
│   ├── Monthly Recurring Revenue (MRR)
│   ├── Annual Recurring Revenue (ARR)
│   ├── Churn rate by feature
│   ├── Average Revenue Per User (ARPU)
│   └── Customer Lifetime Value (LTV)
├── Feature Profitability
│   ├── Revenue by feature
│   ├── Feature adoption rate
│   ├── Feature retention metrics
│   └── Upsell conversion rate
├── User Growth
│   ├── New users (daily/weekly/monthly)
│   ├── Active users by feature
│   ├── Trial to paid conversion
│   └── Churn by user segment
└── Payment Analytics
    ├── Successful transactions
    ├── Failed transactions (reasons)
    ├── Refund rate
    └── Payment method distribution
```

##### 3. Entrepreneur Dashboard (`/admin/business-dashboard`)

```typescript
Purpose: User engagement, course performance, student outcomes

Components:
├── User Engagement
│   ├── Daily/Weekly active users
│   ├── Course completion rate
│   ├── Average course duration (actual vs expected)
│   ├── Student satisfaction (ratings)
│   └── Mentor response time
├── Course Performance
│   ├── Top 10 courses (by enrollment)
│   ├── Course ratings & reviews
│   ├── Student feedback themes
│   ├── Dropout analysis
│   └── Course ROI calculation
├── Learning Outcomes
│   ├── Certificates issued
│   ├── Job placement rate
│   ├── Skill improvement metrics
│   ├── Student testimonials
│   └── Alumni success stories
└── Growth Opportunities
    ├── Under-performing courses (recommendations)
    ├── High-demand topics (from searches)
    ├── Market gaps (competitor analysis)
    ├── Partnership opportunities
    └── Expansion recommendations
```

---

## 🔄 Phase 3 Timeline

### Phase 3.1: Database Setup (1 day)

**Lead:** DBMasterAI

- [ ] Create Feature, FeaturePolicy, FeatureException models
- [ ] Create FeatureUsageLog model
- [ ] Create migration and apply to database
- [ ] Create RLS policies for features table
- [ ] Insert default features (5)

### Phase 3.2: FeatureControlService (2 days)

**Lead:** SecureOpsAI

- [ ] Implement checkFeatureAccess() with admin bypass
- [ ] Implement grant/revoke methods
- [ ] Implement usage logging
- [ ] Implement policy matching logic
- [ ] Add caching (Redis if available)
- [ ] Write comprehensive tests

### Phase 3.3: API Routes (1 day)

**Lead:** FullstackAI

- [ ] Create feature access routes
- [ ] Create grant/revoke routes
- [ ] Create usage logging routes
- [ ] Create analytics routes
- [ ] Add RBAC enforcement (admin only)

### Phase 3.4: Admin Feature Manager (2 days)

**Lead:** FullstackAI

- [ ] Create feature manager page
- [ ] Create policy editor
- [ ] Create exception grant/revoke interface
- [ ] Add search and filters
- [ ] Add activity logs

### Phase 3.5: Three Dashboards (3 days)

**Lead:** FullstackAI

- [ ] Create Developer Dashboard (system health, logs)
- [ ] Create Finance Dashboard (revenue, metrics)
- [ ] Create Entrepreneur Dashboard (engagement, outcomes)
- [ ] Add data visualization (charts, graphs)
- [ ] Add export capabilities

### Phase 3.6: Integration & Testing (2 days)

**Lead:** SecureOpsAI

- [ ] Update menu to use feature control
- [ ] Test admin bypass on all features
- [ ] Test exception override system
- [ ] Test usage limits
- [ ] Performance test (1000 concurrent feature checks)

---

## 🎯 Key Implementation Details

### Admin 100% Access Guarantee

```typescript
// In FeatureControlService.checkFeatureAccess()
if (user.role === 'ADMIN') {
  return {
    allowed: true,
    reason: 'ADMIN_BYPASS',
    isAdmin: true, // flag indicates admin access
  };
}

// In admin-menu-v2.ts (update renderMenuItems)
const canAccess =
  role === 'ADMIN'
    ? true
    : await FeatureControlService.checkFeatureAccess(userId, item.featureId);

if (!canAccess && item.locked) {
  // Hide locked items unless admin
  return null;
}
```

### Time-Based Access

```typescript
// Temporary access for trials or special promotions
const exception = await FeatureControlService.grantFeatureToUser(
  userId,
  'ai-assistant',
  adminId,
  {
    validUntil: add(new Date(), { days: 30 }), // 30-day trial
    reason: 'Free trial - expires 2025-02-15',
  }
);
```

### Usage Limits

```typescript
// Check before allowing feature use
const allowed = await FeatureControlService.checkUsageLimit(
  userId,
  'ai-assistant',
  tokensUsed: 1000
);

if (!allowed) {
  throw new Error('Usage limit exceeded. Upgrade your plan.');
}
```

---

## 📊 Expected Outcomes

### Admin Control

- ✅ Complete visibility into feature access across all users
- ✅ Ability to grant/revoke features with reasons
- ✅ Temporary access for trials and special cases
- ✅ Audit trail of all feature changes
- ✅ No feature locked for admins (100% guarantee)

### User Experience

- ✅ Clear feature availability based on plan
- ✅ Trial access with countdown timer
- ✅ Usage meter showing remaining quota
- ✅ Upgrade prompts when limits exceeded
- ✅ Feature request tracking

### Analytics

- ✅ Feature adoption metrics
- ✅ Usage patterns by user segment
- ✅ Revenue per feature
- ✅ Trial to paid conversion rate
- ✅ Churn analysis

---

## 📝 Success Criteria

- [ ] Feature, FeaturePolicy, FeatureException models created
- [ ] FeatureControlService with admin bypass working
- [ ] Grant/revoke functionality working
- [ ] Usage logging implemented
- [ ] Feature Manager admin page complete
- [ ] Three dashboards (Dev, Finance, Entrepreneur) complete
- [ ] Admin 100% access tested and verified
- [ ] Time-based access working
- [ ] Usage limits enforced
- [ ] All routes have RBAC
- [ ] Audit trail complete
- [ ] Documentation complete

---

**Governança:** VisionVII Enterprise Governance 3.0  
**Pattern:** Service Pattern  
**Status:** Ready to Plan  
**Total Timeline:** 10 working days (15-25 January 2025)
