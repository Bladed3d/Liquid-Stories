# LED Breadcrumbs: Best Practices

**How to use LED breadcrumbs effectively for maximum debugging power**

---

## LED Placement Strategy

### The Golden Rule

**Place LEDs at decision points, not everywhere.**

❌ **Wrong:**
```typescript
function calculateTotal(items) {
  trail.light(LED_RANGES.DATA.FUNCTION_START, 'starting');
  let total = 0;
  trail.light(LED_RANGES.DATA.VARIABLE_INIT, 'initialized');
  for (let item of items) {
    trail.light(LED_RANGES.DATA.LOOP_ITERATION, 'iterating');
    total += item.price;
    trail.light(LED_RANGES.DATA.ADDITION, 'added');
  }
  trail.light(LED_RANGES.DATA.FUNCTION_END, 'ending');
  return total;
}
```

✅ **Right:**
```typescript
function calculateTotal(items) {
  trail.light(LED_RANGES.DATA.CALC_START, 'calculating_total', { itemCount: items.length });

  const total = items.reduce((sum, item) => sum + item.price, 0);

  trail.light(LED_RANGES.DATA.CALC_COMPLETE, 'total_calculated', { total });
  return total;
}
```

### Where to Place LEDs

**1. Function Entry (for critical functions)**

```typescript
async function processPayment(amount, card) {
  const trail = new BreadcrumbTrail('PaymentProcessor');
  trail.light(LED_RANGES.PAYMENT.PROCESS_START, 'processing', { amount });

  // ... payment logic
}
```

**2. Before External Calls**

```typescript
trail.light(LED_RANGES.API.REQUEST_START, 'calling_stripe', { amount });
const result = await stripe.charges.create({ amount });
trail.light(LED_RANGES.API.RESPONSE_RECEIVED, 'stripe_success', { chargeId: result.id });
```

**3. Conditional Branches**

```typescript
if (user.isPremium) {
  trail.light(LED_RANGES.BUSINESS_LOGIC.PREMIUM_PATH, 'premium_discount_applied');
  discount = 0.2;
} else {
  trail.light(LED_RANGES.BUSINESS_LOGIC.STANDARD_PATH, 'standard_pricing');
  discount = 0;
}
```

**4. Error Handlers**

```typescript
try {
  // operation
} catch (error) {
  trail.fail(LED_RANGES.ERRORS.OPERATION_FAILED, error, 'payment_failed', {
    amount,
    cardLast4: card.last4
  });
  throw error;
}
```

**5. State Changes**

```typescript
const handleStateChange = (newState) => {
  trail.light(LED_RANGES.STATE.TRANSITION, 'state_changing', {
    from: currentState,
    to: newState
  });
  setState(newState);
};
```

---

## Naming Conventions

### LED Range Names

**Use SCREAMING_SNAKE_CASE:**
```typescript
LED_RANGES = {
  USER_AUTHENTICATION: { ... },  // ✅
  userAuthentication: { ... },   // ❌
  user_authentication: { ... }   // ❌
}
```

### LED IDs

**Use descriptive, hierarchical names:**
```typescript
USER_AUTHENTICATION: {
  LOGIN_START: 30700,        // ✅ Clear what it does
  LOGIN_SUCCESS: 30701,      // ✅ Clear outcome
  LOGIN_FAILED: 30702,       // ✅ Clear outcome

  START: 30700,              // ❌ Too vague
  SUCCESS: 30701,            // ❌ Success of what?
  FAIL: 30702                // ❌ What failed?
}
```

### Operation Names

**Use present_continuous or past_tense:**
```typescript
trail.light(LED_RANGES.API.REQUEST_START, 'calling_api');      // ✅ Present continuous
trail.light(LED_RANGES.API.RESPONSE_RECEIVED, 'api_succeeded'); // ✅ Past tense

trail.light(LED_RANGES.API.REQUEST_START, 'call');            // ❌ Vague
trail.light(LED_RANGES.API.RESPONSE_RECEIVED, 'success');      // ❌ Too generic
```

---

## Context Data Best Practices

### Include Relevant Data Only

❌ **Wrong (too much):**
```typescript
trail.light(LED_RANGES.USER.LOGIN, 'login_attempt', {
  email: user.email,
  password: user.password,        // ❌ Never log passwords!
  sessionId: session.id,
  userAgent: req.headers.userAgent,
  ipAddress: req.ip,
  timestamp: Date.now(),
  serverVersion: process.version
  // ... too much data
});
```

✅ **Right (just enough):**
```typescript
trail.light(LED_RANGES.USER.LOGIN, 'login_attempt', {
  email: user.email,
  source: 'web_app'
});
```

### Never Log Sensitive Data

**❌ Never log:**
- Passwords
- API keys
- Credit card numbers
- Social security numbers
- Full tokens

**✅ Log safely:**
```typescript
// Bad
trail.light(LED_RANGES.AUTH.TOKEN_RECEIVED, 'got_token', { token });

// Good
trail.light(LED_RANGES.AUTH.TOKEN_RECEIVED, 'got_token', {
  tokenLength: token.length,
  tokenType: 'Bearer'
});
```

### Use Structured Data

```typescript
// ✅ Structured
trail.light(LED_RANGES.API.REQUEST_START, 'api_call', {
  endpoint: '/users',
  method: 'GET',
  params: { page: 1, limit: 10 }
});

// ❌ Unstructured
trail.light(LED_RANGES.API.REQUEST_START, 'api_call', {
  message: 'Calling GET /users with page=1 and limit=10'
});
```

---

## LED Range Organization

### Group by Feature Area

```typescript
export const LED_RANGES = {
  // 30000-30099: Page lifecycle
  PAGE_LIFECYCLE: { ... },

  // 30100-30199: User interactions
  USER_INTERACTION: { ... },

  // 30200-30299: API calls
  API_CALLS: { ... },

  // 30800-30899: Errors (always reserve top of range)
  ERRORS: { ... }
};
```

### Leave Room for Growth

```typescript
// ❌ Bad: No room to grow
USER_AUTH: {
  LOGIN: 30700,
  LOGOUT: 30701,
  REFRESH: 30702,
  // What if we need more auth operations?
}

// ✅ Good: Room to grow
USER_AUTH: {
  LOGIN_START: 30700,
  LOGIN_SUCCESS: 30701,
  LOGIN_FAILED: 30702,
  LOGOUT: 30710,
  TOKEN_REFRESH: 30720,
  // Room for: 30703-30709, 30711-30719, 30721-30799
}
```

### Reserve Error Range

**Always use the top 100 of your range for errors:**
```typescript
// Project range: 30000-39999
ERRORS: {
  GENERIC: 39800,
  NETWORK: 39801,
  VALIDATION: 39802,
  // ... through 39899
}
```

---

## Performance Considerations

### LED Breadcrumbs Are Lightweight

**Overhead per LED:** <0.1ms
**Log file growth:** ~100 bytes per LED
**Memory impact:** Minimal (breadcrumbs cleared per component)

### When to Worry About Performance

**You probably don't need to optimize unless:**
- Logging >1000 LEDs per second
- Log file >100MB
- Running on extremely constrained hardware

### Optimization Strategies

**1. Conditional logging (production)**

```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  trail.light(LED_RANGES.DEBUG.DETAILED_INFO, 'debug_info', { ... });
}
```

**2. Log rotation**

```bash
# Daily log rotation
mv breadcrumb-debug.log breadcrumb-debug-$(date +%Y%m%d).log
> breadcrumb-debug.log
```

**3. Selective filtering**

```typescript
// Only log errors and critical paths
if (isError || isCriticalPath) {
  trail.light(...);
}
```

---

## Working with AI Agents

### Make LEDs AI-Friendly

**✅ Good for AI:**
```typescript
trail.fail(LED_RANGES.API.TIMEOUT, error, 'api_timeout', {
  endpoint: '/users',
  duration: 5000,
  expectedDuration: 2000
});
```

**AI reads:** "API timeout after 5000ms to /users, expected 2000ms"
**AI fixes:** Adds retry logic or increases timeout

**❌ Bad for AI:**
```typescript
trail.fail(LED_RANGES.API.FAILED, error, 'error');
```

**AI reads:** "Something failed"
**AI guesses:** ???

### Include "What Should Happen"

```typescript
trail.light(LED_RANGES.VALIDATION.CHECK, 'validating_email', {
  email: input.email,
  expected: 'valid_email_format',
  actual: isValid ? 'valid' : 'invalid'
});
```

**AI sees expectations** and can fix mismatches.

---

## Testing with LED Breadcrumbs

### Use LEDs in Tests

```typescript
test('should process payment successfully', async () => {
  const result = await processPayment(100, mockCard);

  // Check breadcrumb trail
  const trail = BreadcrumbTrail.getTrailFor('PaymentProcessor');
  const breadcrumbs = trail.getBreadcrumbs();

  // Verify LED sequence
  expect(breadcrumbs[0].led).toBe(LED_RANGES.PAYMENT.PROCESS_START);
  expect(breadcrumbs[1].led).toBe(LED_RANGES.API.REQUEST_START);
  expect(breadcrumbs[2].led).toBe(LED_RANGES.API.RESPONSE_RECEIVED);
  expect(breadcrumbs[3].led).toBe(LED_RANGES.PAYMENT.PROCESS_COMPLETE);
});
```

### Clear Between Tests

```typescript
beforeEach(() => {
  BreadcrumbTrail.clearAll();
});
```

---

## Common Pitfalls

### Pitfall 1: Too Many LEDs

**Problem:** LED every line of code
**Solution:** LED only decision points

### Pitfall 2: Vague Operation Names

**Problem:** `trail.light(LED_ID, 'doing_stuff')`
**Solution:** `trail.light(LED_ID, 'validating_user_email')`

### Pitfall 3: No Context

**Problem:** `trail.light(LED_ID, 'failed')`
**Solution:** `trail.fail(LED_ID, error, 'validation_failed', { field: 'email', value: input })`

### Pitfall 4: Logging Sensitive Data

**Problem:** `{ password: userPassword }`
**Solution:** `{ passwordLength: userPassword.length }`

### Pitfall 5: Not Using LED Ranges

**Problem:** Random LED numbers: 12345, 98765, 42
**Solution:** Organized ranges: 30100, 30101, 30102

---

## LED Breadcrumb Checklist

Before committing code with LEDs:

- [ ] LEDs at function entry points?
- [ ] LEDs before external calls?
- [ ] LEDs in error handlers?
- [ ] Descriptive operation names?
- [ ] Relevant context included?
- [ ] No sensitive data logged?
- [ ] LED IDs from defined ranges?
- [ ] Component name is clear?

---

## Real-World Examples

### Example 1: E-commerce Checkout

```typescript
async function processCheckout(cart, paymentInfo) {
  const trail = new BreadcrumbTrail('CheckoutFlow');

  trail.light(LED_RANGES.CHECKOUT.START, 'checkout_started', {
    itemCount: cart.items.length,
    total: cart.total
  });

  // Validate cart
  if (!cart.isValid()) {
    trail.fail(LED_RANGES.CHECKOUT.VALIDATION_FAILED,
      new Error('Invalid cart'),
      'cart_invalid',
      { reason: 'expired_items' }
    );
    throw new Error('Cart contains expired items');
  }

  trail.light(LED_RANGES.CHECKOUT.CART_VALIDATED, 'cart_valid');

  // Process payment
  try {
    trail.light(LED_RANGES.PAYMENT.PROCESS_START, 'processing_payment');
    const charge = await stripeAPI.createCharge(cart.total, paymentInfo);
    trail.light(LED_RANGES.PAYMENT.SUCCESS, 'payment_succeeded', {
      chargeId: charge.id,
      amount: charge.amount
    });
  } catch (error) {
    trail.fail(LED_RANGES.PAYMENT.FAILED, error, 'payment_failed', {
      amount: cart.total,
      errorCode: error.code
    });
    throw error;
  }

  trail.light(LED_RANGES.CHECKOUT.COMPLETE, 'checkout_complete');
}
```

### Example 2: User Authentication

```typescript
async function authenticateUser(email, password) {
  const trail = new BreadcrumbTrail('AuthService');

  trail.light(LED_RANGES.AUTH.LOGIN_START, 'login_attempt', { email });

  // Check user exists
  const user = await db.findUser(email);

  if (!user) {
    trail.light(LED_RANGES.AUTH.USER_NOT_FOUND, 'user_not_found', { email });
    return { success: false, reason: 'invalid_credentials' };
  }

  trail.light(LED_RANGES.AUTH.USER_FOUND, 'user_found');

  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    trail.light(LED_RANGES.AUTH.INVALID_PASSWORD, 'password_mismatch');
    return { success: false, reason: 'invalid_credentials' };
  }

  trail.light(LED_RANGES.AUTH.PASSWORD_VERIFIED, 'password_correct');

  // Generate token
  const token = jwt.sign({ userId: user.id }, SECRET);
  trail.light(LED_RANGES.AUTH.TOKEN_GENERATED, 'token_created', {
    tokenLength: token.length
  });

  trail.light(LED_RANGES.AUTH.LOGIN_SUCCESS, 'login_complete');

  return { success: true, token };
}
```

---

## Summary

**Key Principles:**
1. **Be selective** - LED decision points, not every line
2. **Be descriptive** - Clear operation names and context
3. **Be secure** - Never log sensitive data
4. **Be organized** - Use LED ranges consistently
5. **Be helpful** - Make LEDs AI-friendly

**Remember:** LED breadcrumbs are for debugging, not telemetry. They should help you (and AI agents) understand what went wrong, quickly.
