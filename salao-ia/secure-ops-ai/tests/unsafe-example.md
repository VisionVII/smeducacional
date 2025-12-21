# 🧪 Unsafe Example - Test File for SecureOpsAI

**ATENÇÃO**: Este arquivo contém propositalmente código inseguro para testar o SecureOpsAI.  
NUNCA use estes padrões em produção!

```typescript
// ❌ CRITICAL: Missing auth() check
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

// ❌ CRITICAL: Hardcoded secret
const API_KEY = "sk-1234567890abcdef";
const password = "admin123";

// ❌ HIGH: Missing Zod validation
export async function POST(req: NextRequest) {
  const body = await req.json();
  await prisma.course.create({ data: body }); // Direct body usage!
  return NextResponse.json({ success: true });
}

// ❌ HIGH: Missing role check
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Faltou: if (session.user.role !== 'ADMIN') ...
  await prisma.systemConfig.update({ ... });
}

// ❌ MEDIUM: Missing rate limiting
export async function POST(req: NextRequest) {
  const { email } = await req.json();
  await sendPasswordResetEmail(email);
  return NextResponse.json({ success: true });
}

// ❌ MEDIUM: Error exposes sensitive info
try {
  await prisma.user.create({ ... });
} catch (error: any) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}

// ❌ HIGH: SQL Injection potential
const userId = req.query.id;
const query = `SELECT * FROM users WHERE id = ${userId}`; // Vulnerable!

// ❌ HIGH: XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ❌ INFO: console.log in production
console.log('User data:', user);
```
