# Quick Start: LED Breadcrumbs in 5 Minutes

Get LED breadcrumbs running in your project in under 5 minutes.

---

## Step 1: Copy the Files (1 minute)

**Copy the breadcrumb system:**

```bash
# From your DebugLayer repo
cp docs/examples/breadcrumb-system-example.ts your-project/lib/breadcrumb-system.ts
cp docs/examples/led-ranges-example.ts your-project/lib/led-ranges.ts
```

**Or install via npm** (if packaged):
```bash
npm install @debuglayer/breadcrumbs
```

---

## Step 2: Add to Your First Component (2 minutes)

### Next.js/React Example

```typescript
// app/page.tsx or pages/index.tsx
import { BreadcrumbTrail } from '@/lib/breadcrumb-system';
import { LED_RANGES } from '@/lib/led-ranges';

export default function Home() {
  // Create trail for this component
  const trail = new BreadcrumbTrail('HomePage');

  // Light LED when component mounts
  React.useEffect(() => {
    trail.light(LED_RANGES.PAGE_LIFECYCLE.MOUNT, 'page_mounted');

    return () => {
      trail.light(LED_RANGES.PAGE_LIFECYCLE.UNMOUNT, 'page_unmounting');
    };
  }, []);

  const handleClick = () => {
    trail.light(LED_RANGES.USER_INTERACTION.BUTTON_CLICK, 'button_clicked', {
      buttonId: 'test-button'
    });
  };

  return (
    <div>
      <h1>Welcome</h1>
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
}
```

---

## Step 3: Run and View the Log (1 minute)

**Start your app:**
```bash
npm run dev
```

**View the breadcrumb log:**
```bash
cat breadcrumb-debug.log
```

**You'll see:**
```
✅ LED 30000: page_mounted [HomePage]
✅ LED 30100: button_clicked [HomePage] {"buttonId":"test-button"}
```

**🎉 That's it! LED breadcrumbs are working!**

---

## Step 4: Add LEDs to Critical Points (1 minute)

### Where to Add LEDs

**Add LEDs at:**
1. **Function entry points** - Know what was called
2. **Before external calls** - API, database, file system
3. **After external calls** - Success or failure
4. **Conditionals** - Which branch was taken
5. **Error handlers** - What failed and why

### Example: API Call

```typescript
async function submitForm(data: FormData) {
  const trail = new BreadcrumbTrail('FormSubmission');

  // Entry point
  trail.light(LED_RANGES.FORM_SUBMISSION.VALIDATION_START, 'validating', { data });

  try {
    // Before API call
    trail.light(LED_RANGES.API_CALLS.REQUEST_START, 'calling_api', {
      endpoint: '/api/submit'
    });

    const result = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    // After successful API call
    trail.light(LED_RANGES.API_CALLS.RESPONSE_RECEIVED, 'api_success', {
      status: result.status
    });

    return result;

  } catch (error) {
    // Error path
    trail.fail(LED_RANGES.ERRORS.NETWORK_ERROR, error, 'api_failed', {
      endpoint: '/api/submit'
    });
    throw error;
  }
}
```

**Log will show:**
```
✅ LED 30400: validating [FormSubmission] {"data":{...}}
✅ LED 30200: calling_api [FormSubmission] {"endpoint":"/api/submit"}
✅ LED 30202: api_success [FormSubmission] {"status":200}
```

**Or if it fails:**
```
✅ LED 30400: validating [FormSubmission] {"data":{...}}
✅ LED 30200: calling_api [FormSubmission] {"endpoint":"/api/submit"}
❌ LED 30801 FAILED [FormSubmission]: api_failed - Network timeout
```

---

## Common Patterns

### Pattern 1: Page Load

```typescript
useEffect(() => {
  trail.light(LED_RANGES.PAGE_LIFECYCLE.HYDRATION_START, 'hydrating');

  // Your initialization code

  trail.light(LED_RANGES.PAGE_LIFECYCLE.READY, 'page_ready');
}, []);
```

### Pattern 2: Form Validation

```typescript
const validateForm = (values) => {
  trail.light(LED_RANGES.FORM_SUBMISSION.VALIDATION_START, 'validating');

  const errors = {};

  if (!values.email) {
    trail.light(LED_RANGES.FORM_SUBMISSION.FIELD_ERROR, 'email_required');
    errors.email = 'Required';
  }

  if (Object.keys(errors).length === 0) {
    trail.light(LED_RANGES.FORM_SUBMISSION.VALIDATION_PASSED, 'validation_ok');
  } else {
    trail.light(LED_RANGES.FORM_SUBMISSION.VALIDATION_FAILED, 'validation_errors', { errors });
  }

  return errors;
};
```

### Pattern 3: Error Boundary

```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.trail = new BreadcrumbTrail('ErrorBoundary');
  }

  componentDidCatch(error, errorInfo) {
    this.trail.fail(
      LED_RANGES.ERRORS.COMPONENT_ERROR,
      error,
      'error_caught',
      { component: errorInfo.componentStack }
    );
  }
}
```

---

## Debugging with LED Logs

### Finding Errors

```bash
# Show only failures
grep "❌" breadcrumb-debug.log

# Show specific LED range (e.g., API calls 30200-30299)
grep "LED 302" breadcrumb-debug.log

# Show last 20 entries
tail -20 breadcrumb-debug.log

# Show entries from specific component
grep "\[FormSubmission\]" breadcrumb-debug.log
```

### Reading the Log

**Format:**
```
[STATUS] LED [ID]: [operation] [Component] [context]
```

**Example:**
```
✅ LED 30200: api_call_started [LoginForm] {"endpoint":"/api/login"}
```

- **✅** = Success
- **LED 30200** = API_CALLS.REQUEST_START
- **api_call_started** = Operation name
- **[LoginForm]** = Component that logged it
- **{...}** = Context data

---

## Next Steps

Now that LEDs are working:

1. **Add LEDs to more components** - Cover critical paths first
2. **Customize LED ranges** - Edit `lib/led-ranges.ts` for your needs
3. **Integrate with AI agents** - See [Building AI Agent Teams](../../Docs/BUILDING-AI-AGENT-TEAMS.md)
4. **Read best practices** - [Best Practices Guide](./best-practices.md)

---

## Troubleshooting

### LED logs not appearing

**Check:**
1. File permissions - Can write to `breadcrumb-debug.log`?
2. Server-side rendering - LEDs in client components need API endpoint
3. Console output - Should see logs in terminal/browser console too

### How to clear the log

```bash
# Clear the log file
> breadcrumb-debug.log

# Or delete it
rm breadcrumb-debug.log
```

### Too many logs

**Filter to what matters:**
```bash
# Only errors
grep "❌" breadcrumb-debug.log

# Only one component
grep "\[MyComponent\]" breadcrumb-debug.log

# Only one LED range
grep "LED 302" breadcrumb-debug.log
```

---

## Platform-Specific Setup

For detailed setup instructions for your framework:

- **[Next.js Integration](../guides/nextjs-integration.md)**
- **[React Integration](../guides/react-integration.md)**
- **[Express.js Integration](../guides/express-integration.md)**
- **[Python/Flask Integration](../guides/python-integration.md)**

---

## Success!

You now have LED breadcrumbs running in your project. Every LED you add makes debugging faster and AI agents more effective.

**Remember:** More LEDs = Better debugging = Less time wasted

Happy debugging! 🎉
