---
name: legal
disable-model-invocation: true
description: |
  Generate Privacy Policy, Terms of Service, and Cookie Policy pages.
  Use when setting up legal pages for a new project, when asked to
  "create privacy policy", "add terms of service", "generate legal pages",
  or when /arc:letsgo identifies missing legal documents.
license: MIT
metadata:
  author: howells
website:
  order: 12
  desc: Privacy & terms
  summary: Generate Privacy Policy, Terms of Service, and Cookie Policy. Scans your codebase first so it knows what data you actually collect.
  what: |
    Legal scans your codebase to see what you're actually doing—analytics, auth providers, payment processing, form submissions, cookies. Then it asks a few targeted questions about your business (company name, contact email, jurisdiction). The output is markdown pages ready to drop into your site. Not boilerplate—tailored to your actual implementation.
  why: |
    Every app needs legal pages, but most developers copy-paste generic templates that don't match what their app actually does. Legal generates accurate starting points based on your real data practices. Still needs lawyer review before launch—these are templates, not legal advice.
  decisions:
    - Codebase scan first. Detects Stripe, Google Analytics, auth providers—knows your stack.
    - Minimal questions. Only asks what it can't infer from code.
    - Output is markdown. Drop into your site, style to match.
  workflow:
    position: branch
    joins: letsgo
---

<tool_restrictions>
# MANDATORY Tool Restrictions

## BANNED TOOLS — calling these is a skill violation:
- **`EnterPlanMode`** — BANNED. Do NOT call this tool. This skill has its own multi-step process. Execute the steps below directly.
- **`ExitPlanMode`** — BANNED. You are never in plan mode.
</tool_restrictions>

<arc_runtime>
This workflow requires the full Arc bundle, not a prompts-only install.
Resolve the Arc install root from this skill's location and refer to it as `${ARC_ROOT}`.
Use `${ARC_ROOT}/...` for Arc-owned files such as `references/`, `disciplines/`, `agents/`, `templates/`, and `scripts/`.
Use project-local paths such as `.ruler/` or `rules/` for the user's repository.
</arc_runtime>

<progress_context>
**Use Read tool:** `docs/arc/progress.md` (first 50 lines)

Check for recent feature work that might affect data collection scope.
</progress_context>

# Legal Pages Workflow

Generate comprehensive legal pages (Privacy Policy, Terms of Service, Cookie Policy) through a guided, interactive process. Combines automatic project detection with user questions to create tailored documents.

**These are starting points that MUST be reviewed by a qualified lawyer before publishing.**

---

## Process Overview

```
Step 1: Disclaimer & Scope     → Set expectations
Step 2: Project Detection      → Scan codebase for data collection
Step 3: Guided Questions       → Interactive Q&A to fill gaps (5 rounds)
Step 4: Generate Documents     → Create tailored legal pages
Step 5: Implementation         → Add to project with proper routing
Step 6: Next Steps            → Cookie consent, lawyer review, etc.
```

---

## Step 1: Disclaimer & Scope

**Always start with this disclaimer:**

> ⚠️ **Important: These are template documents, not legal advice.**
>
> I'll generate comprehensive legal pages based on your project and answers, but:
> - I am not a lawyer and this is not legal advice
> - These templates should be reviewed by a qualified attorney
> - Laws vary by jurisdiction and change frequently
> - Regulated industries (healthcare, finance, children) have special requirements
>
> These documents will give you a solid starting point that covers common requirements under GDPR, CCPA, and general best practices.

**Ask: "Do you want to proceed with generating legal pages for this project?"**

---

## Step 2: Project Detection

Perform comprehensive codebase scan for data collection signals.

### Detection Checklist

```
Search for and report on:

AUTHENTICATION
├── next-auth / NextAuth.js    → OAuth providers, session strategy
├── clerk                       → User profiles, organizations
├── supabase auth              → Email, OAuth, phone auth
├── firebase auth              → Multiple auth methods
├── lucia                       → Session-based auth
├── auth0                       → Enterprise SSO, social login
├── passport.js                → Strategy-based auth
└── Custom auth                → JWT, session cookies

ANALYTICS & TRACKING
├── Google Analytics (gtag, GA4)
│   └── Cookies: _ga (2 years), _gid (24h), _gat (1 min)
├── Google Tag Manager         → Container for multiple tags
├── Plausible                  → Privacy-focused, no cookies
├── Fathom                     → Privacy-focused, no cookies
├── PostHog                    → Product analytics, session recording
├── Mixpanel                   → Event tracking, user profiles
├── Amplitude                  → Product analytics
├── Heap                       → Auto-capture analytics
├── Hotjar/FullStory          → Session recording, heatmaps
├── Vercel Analytics          → Privacy-focused, no cookies
└── Segment                    → Customer data platform

PAYMENTS & BILLING
├── Stripe
│   └── You store: customer_id, subscription status
│   └── Stripe stores: payment methods, card details
│   └── Cookies: __stripe_mid, __stripe_sid
├── Paddle                     → Merchant of record model
├── LemonSqueezy              → Merchant of record model
├── PayPal                     → Payment processor
└── Custom billing             → Invoice data, payment history

EMAIL SERVICES
├── Resend                     → Transactional email
├── SendGrid                   → Email delivery
├── Postmark                   → Transactional email
├── Mailchimp/ConvertKit      → Marketing email, subscriber lists
├── Customer.io               → Marketing automation
└── AWS SES                    → Email infrastructure

ERROR TRACKING & MONITORING
├── Sentry                     → Error tracking, may capture user context
├── LogRocket                  → Session replay, error tracking
├── Bugsnag                    → Error monitoring
├── Datadog                    → APM, logging, traces
└── New Relic                  → Application monitoring

CUSTOMER SUPPORT
├── Intercom                   → Chat, user data, conversation history
├── Crisp                      → Live chat
├── Zendesk                    → Support tickets
├── HelpScout                  → Customer support
└── Freshdesk                  → Support platform

DATABASE & STORAGE
├── PostgreSQL/MySQL          → User data storage
├── MongoDB                    → Document storage
├── Prisma                     → ORM (check schema for PII)
├── Drizzle                    → ORM
├── Supabase                   → Database + auth + storage
├── PlanetScale               → MySQL platform
├── Neon                       → Serverless Postgres
├── Cloudinary                → Image/video storage
├── Uploadthing               → File uploads
├── AWS S3                     → Object storage
└── Vercel Blob               → File storage

HOSTING & INFRASTRUCTURE
├── Vercel                     → Logs IP addresses, request data
├── Netlify                    → Similar logging
├── AWS                        → CloudFront logs, ALB logs
├── Cloudflare                → CDN, may set cookies
└── Railway/Render            → Platform logs

MARKETING & ADS
├── Facebook Pixel            → Conversion tracking
│   └── Cookies: _fbp, fr
├── Google Ads                → Conversion tracking
│   └── Cookies: _gcl_au, _gcl_aw
├── LinkedIn Insight Tag      → B2B tracking
├── Twitter/X Pixel           → Conversion tracking
├── TikTok Pixel              → Conversion tracking
└── Pinterest Tag             → Conversion tracking

CMS & CONTENT
├── Sanity                     → Content management
├── Contentful                → Headless CMS
├── Payload                    → Headless CMS
├── Strapi                     → Headless CMS
└── WordPress API             → Content source

FORMS & DATA COLLECTION
├── Contact forms              → Name, email, message
├── Newsletter signup         → Email address
├── User profiles             → Various PII
├── File uploads              → User-generated content
├── Surveys/feedback          → User responses
└── Job applications          → Resumes, personal info
```

### Detection Output Format

Present findings to user:

```markdown
## 📊 Data Collection Detection Results

### Authentication
**Detected:** NextAuth.js with Google and GitHub OAuth
- **Data collected:** Email, name, profile picture from OAuth providers
- **Data stored:** User record in database, session cookie
- **Session strategy:** JWT / Database sessions

### Analytics
**Detected:** Google Analytics 4
- **Data collected:** Page views, events, device info, IP address
- **Cookies set:**
  | Cookie | Purpose | Duration | Type |
  |--------|---------|----------|------|
  | _ga | Distinguishes users | 2 years | Analytics |
  | _gid | Distinguishes users | 24 hours | Analytics |

### Payments
**Detected:** Stripe
- **Data you store:** Customer ID, subscription status, billing address
- **Data Stripe stores:** Payment methods, transaction history
- **Note:** You are NOT a data controller for card numbers—Stripe is

### Third-Party Processors
| Service | Data Shared | Purpose | Their Privacy Policy |
|---------|-------------|---------|---------------------|
| Vercel | IP, request logs | Hosting | vercel.com/legal/privacy-policy |
| Resend | Email addresses | Transactional email | resend.com/legal/privacy-policy |
| Sentry | Error data, user context | Error tracking | sentry.io/privacy |

### Cookies Summary
| Category | Count | Examples |
|----------|-------|----------|
| Essential | 2 | Session, CSRF token |
| Analytics | 2 | _ga, _gid |
| Marketing | 0 | None detected |
| Functional | 1 | Theme preference |
```

---

## Step 3: Guided Questions

Use the AskUserQuestion interaction pattern for each round. One focused topic at a time, and do not narrate missing tools or fallbacks to the user.

### Round 1: Business Identity

```
Question: "What are your business details?"
Header: "Business"
Options: [Free text response needed]

Gather:
- Legal business name (e.g., "Acme Inc." or "John Smith trading as Acme")
- Country/state of incorporation or residence
- Business type: Company, LLC, Sole proprietor, etc.
- Website URL
- Contact email for privacy/legal inquiries
- Physical address (required for some jurisdictions, recommended for all)
```

### Round 2: Target Audience & Jurisdiction

```
Question: "Where are your users located?"
Header: "Jurisdiction"
Options:
  - "Worldwide (GDPR + CCPA compliant)" [Recommended]
    → Covers EU, California, and general best practices
  - "US only"
    → CCPA for California, general US practices
  - "EU/EEA only"
    → GDPR-focused
  - "Specific countries"
    → Ask follow-up for which countries

Follow-up if needed:
Question: "Do you expect users under 18?"
Header: "Age"
Options:
  - "No, adults only (18+)"
  - "Yes, 13-17 with parental consent"
  - "Yes, under 13" → COPPA applies, special handling required
  - "Not sure"
```

### Round 3: Documents Needed

```
Question: "Which legal documents do you need?"
Header: "Documents"
MultiSelect: true
Options:
  - "Privacy Policy" [Required for almost all sites]
    → Required if you collect ANY data (even just analytics)
  - "Terms of Service"
    → Required for apps/SaaS, recommended for all
  - "Cookie Policy"
    → Required if using non-essential cookies (can be section in Privacy Policy)
  - "Acceptable Use Policy"
    → Recommended if users can post content or interact
```

### Round 4: Service Type & Features

```
Question: "What type of service is this?"
Header: "Service type"
Options:
  - "SaaS / Web application"
    → User accounts, possibly subscriptions
  - "E-commerce / Online store"
    → Products, checkout, shipping
  - "Content / Blog / Marketing site"
    → Minimal data collection
  - "Marketplace / Platform"
    → Multiple user types, transactions between users
  - "API / Developer tools"
    → API keys, usage data, developer accounts

Follow-up based on selection:
- SaaS: "Do you offer free trials? Refund policy? Subscription billing?"
- E-commerce: "Physical or digital products? Return policy? Shipping regions?"
- Marketplace: "Do you facilitate payments between users? Take commission?"
```

### Round 5: Specific Policies

```
Question: "What are your data practices?"
Header: "Practices"
MultiSelect: true
Options:
  - "We use data only for providing our service"
  - "We send marketing emails (with consent)"
  - "We share anonymized/aggregated data"
  - "We use AI/ML to process user data"
  - "We allow third-party integrations"

Question: "What is your refund/cancellation policy?"
Header: "Refunds"
Options:
  - "14-day money-back guarantee"
  - "30-day money-back guarantee"
  - "Pro-rated refunds for annual plans"
  - "No refunds (for digital goods)"
  - "Custom policy" → Ask for details
```

---

## Step 4: Generate Documents

Based on detection + user answers, generate **fully personalized documents**.

### CRITICAL: No Placeholders

**DO NOT** generate documents with `[PLACEHOLDER]` markers. The documents must be:
- Filled in with actual company name, URLs, emails from user answers
- Populated with actual detected services (Stripe, Vercel, etc.) by name
- Include real cookie names and durations from detection
- Have actual data categories based on what was detected
- Remove sections that don't apply (e.g., no Payments section if no payments detected)

**Example — WRONG:**
```
We share data with [SERVICE_PROVIDERS].
Contact us at [EMAIL].
```

**Example — CORRECT:**
```
We share data with Vercel (hosting), Stripe (payments), and Resend (email).
Contact us at privacy@acme.com.
```

The templates below show the **structure**. When generating, replace ALL bracketed items with real values from detection and user answers. If a section doesn't apply to this project, omit it entirely.

---

### Structure Reference Templates

The template structures for each document are maintained in separate files. **Read these templates at runtime** to use as the structure reference when generating personalized documents:

- **Privacy Policy:** `${ARC_ROOT}/templates/privacy-policy.md`
- **Terms of Service:** `${ARC_ROOT}/templates/terms-of-service.md`
- **Cookie Policy:** `${ARC_ROOT}/templates/cookie-policy.md`

**Use Read tool** to load each template before generating. The templates show the **structure** — when generating, replace ALL bracketed items with real values from detection and user answers. If a section doesn't apply to this project, omit it entirely.

---

## Step 5: Implementation

### Create the Pages

**For Next.js App Router:**

```
app/
├── (legal)/
│   ├── layout.tsx          # Shared layout for legal pages
│   ├── privacy/page.tsx    # Privacy Policy
│   ├── terms/page.tsx      # Terms of Service
│   └── cookies/page.tsx    # Cookie Policy (or section in privacy)
```

**Example layout:**
```tsx
// app/(legal)/layout.tsx
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <article className="prose prose-gray dark:prose-invert max-w-none">
        {children}
      </article>
    </div>
  )
}
```

**Offer to create:**
1. The page files with generated content
2. Footer links to the legal pages
3. Cookie consent banner component (if needed)

---

## Step 6: Next Steps

Present to user after generation:

```markdown
## ✅ Legal Pages Generated

**Created:**
- `/privacy` — Privacy Policy
- `/terms` — Terms of Service
- `/cookies` — Cookie Policy

## Required Next Steps

1. **Add footer links**
   - Link to Privacy Policy, Terms, and Cookies from your site footer

2. **Cookie consent banner** (if using non-essential cookies)
   - Required before setting analytics/marketing cookies
   - Must offer "Reject All" option for GDPR compliance
   - Consider: [CookieConsent](https://github.com/orestbida/cookieconsent), [Osano](https://www.osano.com/), or custom

3. **Legal review**
   - Have these documents reviewed by a lawyer, especially if:
     - You handle sensitive data (health, financial)
     - You have users in multiple jurisdictions
     - You're in a regulated industry
     - You process children's data

4. **Keep updated**
   - Update "Last updated" date when you make changes
   - Review annually at minimum
   - Update when you add new data collection or third-party services

5. **Data Subject Requests**
   - Set up a process to handle privacy requests (access, deletion, etc.)
   - Aim to respond within 30 days (GDPR requirement)
```

---

<arc_log>
**After completing this skill, append to the activity log.**
See: `${ARC_ROOT}/references/arc-log.md`

Entry: `/arc:legal — Generated Privacy Policy, Terms, Cookie Policy`
</arc_log>

---

## Interop

- Invoked by **/arc:letsgo** when legal documents are missing
- May invoke **cookie consent implementation** after generating Cookie Policy
- References project detection patterns shared with /arc:letsgo
