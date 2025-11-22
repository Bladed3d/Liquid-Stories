# Cloudflare Email Routing Setup Guide

**Purpose:** Free custom domain email forwarding to Gmail
**Cost:** $0/month
**Time:** ~30 minutes

---

## Prerequisites

- Namecheap domain (debuglayer.com)
- Gmail account
- Cloudflare account (free)

---

## Part 1: Add Domain to Cloudflare

### Step 1: Create Cloudflare Account

1. Go to **cloudflare.com**
2. Sign up for free account
3. Verify email

### Step 2: Add Your Domain

1. Click "Add a Site"
2. Enter `debuglayer.com`
3. Select **Free plan**
4. Click "Continue"

### Step 3: Cloudflare Scans DNS

Cloudflare will import your existing DNS records. Review them:
- Verify your Vercel records are there (A record, CNAME, etc.)
- Click "Continue"

### Step 4: Update Nameservers at Namecheap

Cloudflare will give you two nameservers like:
```
ada.ns.cloudflare.com
bob.ns.cloudflare.com
```

**In Namecheap:**
1. Log in → Domain List → Manage
2. Find "Nameservers" section
3. Change from "Namecheap BasicDNS" to **"Custom DNS"**
4. Enter the two Cloudflare nameservers
5. Save

**Propagation:** 15 minutes to 24 hours (usually fast)

### Step 5: Wait for Activation

Cloudflare will email you when your domain is active. You can also check the dashboard - it will show "Active" status.

---

## Part 2: Enable Email Routing

### Step 1: Access Email Routing

1. In Cloudflare dashboard, select your domain
2. Click **"Email"** in left sidebar
3. Click **"Email Routing"**

### Step 2: Enable Email Routing

1. Click "Get started" or "Enable Email Routing"
2. Cloudflare will add required MX and TXT records automatically
3. Click "Add records and enable"

### Step 3: Verify Destination Email

1. Click "Destination addresses"
2. Add your Gmail address
3. Cloudflare sends verification email to Gmail
4. Click verification link in Gmail

---

## Part 3: Create Forwarding Rules

### Step 1: Add Email Addresses

Click "Create address" and add rules:

| Custom Address | Forwards To |
|----------------|-------------|
| `hello@debuglayer.com` | youremail@gmail.com |
| `support@debuglayer.com` | youremail@gmail.com |
| `info@debuglayer.com` | youremail@gmail.com |

### Step 2: Catch-All (Optional)

To receive ALL emails to your domain:
1. Go to "Routing rules" tab
2. Enable "Catch-all address"
3. Set action: Forward to your Gmail

This catches typos and any address you haven't explicitly created.

---

## Part 4: Configure Gmail "Send As"

This lets you REPLY from your custom domain in Gmail.

### Step 1: Create App Password (if using 2FA)

1. Go to **myaccount.google.com**
2. Security → 2-Step Verification → App passwords
3. Create new app password for "Mail"
4. Save the 16-character password

### Step 2: Add Send-As Address in Gmail

1. Open Gmail → Settings (gear icon) → "See all settings"
2. Go to **"Accounts and Import"** tab
3. Find "Send mail as" section
4. Click **"Add another email address"**

### Step 3: Enter Your Custom Email

1. Name: `DebugLayer` (or your name)
2. Email: `hello@debuglayer.com`
3. Uncheck "Treat as an alias"
4. Click "Next Step"

### Step 4: SMTP Server Settings

Use Gmail's SMTP to send:

| Field | Value |
|-------|-------|
| SMTP Server | `smtp.gmail.com` |
| Port | `587` |
| Username | `youremail@gmail.com` |
| Password | Your app password (16 chars) |
| Secured connection | TLS |

Click "Add Account"

### Step 5: Verify

Gmail sends confirmation code to your custom address → it forwards to your Gmail → enter the code.

### Step 6: Set as Default (Optional)

In Gmail settings → "Accounts and Import" → "Send mail as":
- Click "make default" next to your custom domain
- Now all outgoing mail shows `hello@debuglayer.com`

---

## Part 5: Test Everything

### Test Receiving

1. Send email FROM another account TO `hello@debuglayer.com`
2. Should arrive in your Gmail inbox

### Test Sending

1. In Gmail, compose new email
2. Click "From" field - select `hello@debuglayer.com`
3. Send to another account
4. Verify it shows your custom domain as sender

### Test Reply

1. Reply to an email sent to your custom domain
2. It should automatically reply from that address

---

## DNS Records Reference

Cloudflare automatically adds these, but for reference:

### MX Records (Email Routing)
```
Type: MX
Name: @
Mail server: route1.mx.cloudflare.net
Priority: 69

Type: MX
Name: @
Mail server: route2.mx.cloudflare.net
Priority: 50

Type: MX
Name: @
Mail server: route3.mx.cloudflare.net
Priority: 6
```

### SPF Record
```
Type: TXT
Name: @
Content: v=spf1 include:_spf.mx.cloudflare.net ~all
```

### DMARC Record (Recommended)
```
Type: TXT
Name: _dmarc
Content: v=DMARC1; p=none; rua=mailto:hello@debuglayer.com
```

---

## Troubleshooting

### Emails Not Arriving

1. Check Cloudflare Email Routing is "Active"
2. Verify destination email is confirmed
3. Check Gmail spam folder
4. Wait for DNS propagation (up to 24 hours)

### Can't Send As Custom Domain

1. Verify app password is correct (no spaces)
2. Check SMTP settings match exactly
3. Ensure "Less secure apps" isn't blocking (use app password instead)

### Emails Going to Spam

1. Add DMARC record
2. SPF record should be present
3. Send a few test emails to "warm up" the address

---

## Multiple Team Members

For multiple people:
1. Create separate forwarding rules:
   - `alice@debuglayer.com` → alice@gmail.com
   - `bob@debuglayer.com` → bob@gmail.com
2. Each person configures their own Gmail "Send As"

---

## Comparison: What You Get vs Paid

| Feature | Cloudflare (Free) | Paid Email ($1-6/mo) |
|---------|-------------------|----------------------|
| Receive email | Yes | Yes |
| Send email | Via Gmail | Direct |
| Custom domain | Yes | Yes |
| Storage | Gmail's storage | 5-30GB |
| Calendar | Use Google Calendar | Included |
| Mobile app | Gmail app | Dedicated app |
| Admin panel | Cloudflare | Full admin |

---

## Summary

After setup, your workflow:

1. **Receive:** Email to `hello@debuglayer.com` arrives in Gmail
2. **Reply:** Gmail automatically uses your custom domain
3. **Compose:** Select custom domain in "From" field
4. **Manage:** All in familiar Gmail interface

---

**Setup Date:** _______________
**Verified Working:** [ ]

---

## Next Steps After Email Setup

1. Add email to website footer/contact page
2. Update investor materials with professional email
3. Set up email signature
4. Consider adding to MailerLite for newsletter management
