# Next.js Integration Guide

Complete guide for integrating LED breadcrumbs into Next.js projects (App Router and Pages Router).

---

## Quick Setup

### Step 1: Install Dependencies

```bash
# No dependencies needed! LED breadcrumbs are pure TypeScript
```

### Step 2: Copy Files

```bash
# From DebugLayer repo
cp docs/examples/breadcrumb-system-example.ts lib/breadcrumb-system.ts
cp docs/examples/led-ranges-example.ts lib/led-ranges.ts
```

### Step 3: Create Log API Endpoint

LED breadcrumbs need to write to a log file. Create an API endpoint:

**For App Router (Next.js 13+):**

```typescript
// app/api/log-breadcrumb/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { appendFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { message, timestamp } = await request.json();
    const logPath = join(process.cwd(), 'breadcrumb-debug.log');

    await appendFile(logPath, message + '\n');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write breadcrumb:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
```

**For Pages Router (Next.js 12):**

```typescript
// pages/api/log-breadcrumb.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { appendFile } from 'fs/promises';
import { join } from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    const logPath = join(process.cwd(), 'breadcrumb-debug.log');

    await appendFile(logPath, message + '\n');

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Failed to write breadcrumb:', error);
    res.status(500).json({ success: false });
  }
}
```

---

## Usage Patterns

### App Router (Next.js 13+)

#### Client Component

```typescript
// app/components/UserProfile.tsx
'use client';

import { useEffect, useState } from 'react';
import { BreadcrumbTrail } from '@/lib/breadcrumb-system';
import { LED_RANGES } from '@/lib/led-ranges';

export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const trail = new BreadcrumbTrail('UserProfile');

  useEffect(() => {
    trail.light(LED_RANGES.COMPONENT_RENDERING.RENDER_START, 'component_mounted', { userId });

    fetchUser();

    return () => {
      trail.light(LED_RANGES.PAGE_LIFECYCLE.UNMOUNT, 'component_unmounting');
    };
  }, [userId]);

  const fetchUser = async () => {
    trail.light(LED_RANGES.API_CALLS.REQUEST_START, 'fetching_user', { userId });

    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();

      trail.light(LED_RANGES.API_CALLS.RESPONSE_RECEIVED, 'user_fetched', {
        status: response.status
      });

      setUser(data);
    } catch (error) {
      trail.fail(LED_RANGES.ERRORS.NETWORK_ERROR, error, 'fetch_failed', { userId });
    }
  };

  return <div>{/* ... */}</div>;
}
```

#### Server Component

```typescript
// app/components/ProductList.tsx
import { BreadcrumbTrail } from '@/lib/breadcrumb-system';
import { LED_RANGES } from '@/lib/led-ranges';

export async function ProductList() {
  const trail = new BreadcrumbTrail('ProductList');

  trail.light(LED_RANGES.COMPONENT_RENDERING.RENDER_START, 'server_component_rendering');

  try {
    trail.light(LED_RANGES.DATA_PROCESSING.PARSE_START, 'fetching_products');

    const products = await fetchProducts();

    trail.light(LED_RANGES.DATA_PROCESSING.PARSE_COMPLETE, 'products_fetched', {
      count: products.length
    });

    return (
      <div>
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  } catch (error) {
    trail.fail(LED_RANGES.ERRORS.GENERIC_ERROR, error, 'render_failed');
    throw error;
  }
}
```

#### API Route

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { BreadcrumbTrail } from '@/lib/breadcrumb-system';
import { LED_RANGES } from '@/lib/led-ranges';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const trail = new BreadcrumbTrail('UsersAPI');

  trail.light(LED_RANGES.API_CALLS.REQUEST_START, 'api_request_received', {
    userId: params.id,
    method: 'GET'
  });

  try {
    const user = await db.users.findUnique({ where: { id: params.id } });

    if (!user) {
      trail.light(LED_RANGES.API_CALLS.RESPONSE_RECEIVED, 'user_not_found', {
        userId: params.id
      });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    trail.light(LED_RANGES.API_CALLS.RESPONSE_RECEIVED, 'user_found', {
      userId: params.id
    });

    return NextResponse.json(user);
  } catch (error) {
    trail.fail(LED_RANGES.ERRORS.GENERIC_ERROR, error, 'api_error', {
      userId: params.id
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Pages Router (Next.js 12)

#### Page Component

```typescript
// pages/index.tsx
import { useEffect, useState } from 'react';
import { BreadcrumbTrail } from '@/lib/breadcrumb-system';
import { LED_RANGES } from '@/lib/led-ranges';

export default function HomePage() {
  const trail = new BreadcrumbTrail('HomePage');

  useEffect(() => {
    trail.light(LED_RANGES.PAGE_LIFECYCLE.MOUNT, 'page_mounted');

    return () => {
      trail.light(LED_RANGES.PAGE_LIFECYCLE.UNMOUNT, 'page_unmounting');
    };
  }, []);

  const handleClick = () => {
    trail.light(LED_RANGES.USER_INTERACTION.BUTTON_CLICK, 'button_clicked');
  };

  return (
    <div>
      <h1>Home</h1>
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
}
```

#### getServerSideProps

```typescript
// pages/products/[id].tsx
import { GetServerSideProps } from 'next';
import { BreadcrumbTrail } from '@/lib/breadcrumb-system';
import { LED_RANGES } from '@/lib/led-ranges';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const trail = new BreadcrumbTrail('ProductPage');

  trail.light(LED_RANGES.PAGE_LIFECYCLE.HYDRATION_START, 'ssr_started', {
    productId: context.params.id
  });

  try {
    const product = await fetchProduct(context.params.id as string);

    trail.light(LED_RANGES.DATA_PROCESSING.PARSE_COMPLETE, 'product_fetched', {
      productId: product.id
    });

    return {
      props: { product }
    };
  } catch (error) {
    trail.fail(LED_RANGES.ERRORS.GENERIC_ERROR, error, 'ssr_failed', {
      productId: context.params.id
    });

    return {
      notFound: true
    };
  }
};
```

---

## Advanced Patterns

### Form Handling with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { BreadcrumbTrail } from '@/lib/breadcrumb-system';
import { LED_RANGES } from '@/lib/led-ranges';

export function ContactForm() {
  const trail = new BreadcrumbTrail('ContactForm');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    trail.light(LED_RANGES.FORM_SUBMISSION.VALIDATION_START, 'form_submitted', {
      fields: Object.keys(data)
    });

    if (Object.keys(errors).length > 0) {
      trail.light(LED_RANGES.FORM_SUBMISSION.VALIDATION_FAILED, 'validation_errors', {
        errors: Object.keys(errors)
      });
      return;
    }

    trail.light(LED_RANGES.FORM_SUBMISSION.VALIDATION_PASSED, 'validation_passed');

    try {
      trail.light(LED_RANGES.API_CALLS.REQUEST_START, 'submitting_form');

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      trail.light(LED_RANGES.API_CALLS.RESPONSE_RECEIVED, 'form_submitted', {
        status: response.status
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      trail.light(LED_RANGES.FORM_SUBMISSION.SUBMIT_SUCCESS, 'submission_success');
    } catch (error) {
      trail.fail(LED_RANGES.FORM_SUBMISSION.SUBMIT_FAILED, error, 'submission_error');
    }
  };

  return <form onSubmit={handleSubmit(onSubmit)}>{/* ... */}</form>;
}
```

### Error Boundary

```typescript
// app/components/ErrorBoundary.tsx
'use client';

import React from 'react';
import { BreadcrumbTrail } from '@/lib/breadcrumb-system';
import { LED_RANGES } from '@/lib/led-ranges';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  private trail: BreadcrumbTrail;

  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.trail = new BreadcrumbTrail('ErrorBoundary');
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.trail.fail(
      LED_RANGES.ERRORS.COMPONENT_ERROR,
      error,
      'error_boundary_caught',
      {
        componentStack: errorInfo.componentStack?.slice(0, 200)
      }
    );
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
```

### Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { BreadcrumbTrail } from '@/lib/breadcrumb-system';
import { LED_RANGES } from '@/lib/led-ranges';

export function middleware(request: NextRequest) {
  const trail = new BreadcrumbTrail('Middleware');

  trail.light(LED_RANGES.PAGE_LIFECYCLE.HYDRATION_START, 'middleware_start', {
    path: request.nextUrl.pathname
  });

  // Auth check
  const token = request.cookies.get('auth-token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    trail.light(LED_RANGES.AUTH.PERMISSION_DENIED, 'redirect_to_login', {
      attemptedPath: request.nextUrl.pathname
    });

    return NextResponse.redirect(new URL('/login', request.url));
  }

  trail.light(LED_RANGES.PAGE_LIFECYCLE.READY, 'middleware_complete');

  return NextResponse.next();
}
```

---

## Debugging

### View Logs in Development

```bash
# Terminal 1: Run Next.js
npm run dev

# Terminal 2: Watch logs in real-time
tail -f breadcrumb-debug.log

# Or filter for errors only
tail -f breadcrumb-debug.log | grep "❌"
```

### Browser Console Debugging

LED breadcrumbs expose a debug object in the browser console:

```javascript
// In browser console
debug.getAllTrails()
// Shows all breadcrumb trails

debug.getTrail('UserProfile')
// Shows breadcrumbs for specific component
```

---

## Production Considerations

### Environment-Based Logging

```typescript
// lib/breadcrumb-system.ts

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const LOG_LEVEL = process.env.LOG_LEVEL || 'all'; // 'all', 'errors', 'none'

export class BreadcrumbTrail {
  light(ledId: number, operation: string, context?: Record<string, any>): void {
    if (LOG_LEVEL === 'none') return;
    if (IS_PRODUCTION && LOG_LEVEL === 'errors') return;

    // ... rest of implementation
  }

  fail(ledId: number, error: Error, operation: string, context?: Record<string, any>): void {
    if (LOG_LEVEL === 'none') return;

    // Always log errors
    // ... rest of implementation
  }
}
```

### Log Rotation

```bash
# Add to package.json scripts
"scripts": {
  "rotate-logs": "mv breadcrumb-debug.log breadcrumb-debug-$(date +%Y%m%d).log && touch breadcrumb-debug.log"
}
```

---

## Next Steps

- **[Best Practices](../product/best-practices.md)** - How to use LEDs effectively
- **[Building AI Agent Teams](../../Docs/BUILDING-AI-AGENT-TEAMS.md)** - Integrate with AI development
- **[Examples](../examples/)** - Real-world implementations

---

## Troubleshooting

### Logs not appearing

**Check:**
1. API endpoint exists at `/api/log-breadcrumb`
2. File permissions allow writing to project root
3. Console shows breadcrumbs (fallback to console.log)

### Type errors

```bash
# Ensure TypeScript sees the files
npm run type-check

# May need to restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
```

### Performance concerns

LED breadcrumbs have minimal overhead, but if concerned:
- Use `LOG_LEVEL='errors'` in production
- Implement log rotation
- Only log critical paths

---

**You're ready to use LED breadcrumbs in Next.js!** 🎉
