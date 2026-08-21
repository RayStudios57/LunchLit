# Security Policy

## Supported Versions

We actively issue security updates and patches exclusively for the latest Vercel deployment of LunchLIT:

| Version | Supported | Deployment Platform |
| --- | --- | --- |
| 1.1.x | :white_check_mark: | Vercel Only |
| Lovable Versions (All) | :x: | Unverified / Unsupported |
| < 1.1 | :x: | Legacy Deployments |

> **Note:** Only official builds hosted on **Vercel** are supported. Legacy development prototypes or versions generated via **Lovable** are explicitly unsupported and do not receive security updates.

---

## Security Practices

LunchLIT enforces strict data protection standards to safeguard student information:

* **Row Level Security (RLS):** Database policies enforce strict user isolation across profiles, Brag Sheets, and wellness logs.
* **Storage Protection:** File uploads utilize short-lived signed URLs to prevent unauthorized media access.
* **Authentication:** Account access is secured exclusively through Google OAuth 2.0 single sign-on (SSO).

---

## Reporting a Vulnerability

If you discover a security vulnerability or data exposure risk, please report it privately rather than opening a public GitHub issue.

### Disclosure Process

1. **Email:** Send details directly to **kutturam0912@gmail.com** (or submit via the in-app feedback channel).
2. **Details to Include:**
   * A description of the vulnerability and its potential impact.
   * Step-by-step instructions or proof-of-concept code to reproduce the issue.
   * Affected components (e.g., Supabase RLS policies, PWA service workers, API routes).

### Response Timeline

* **Acknowledgment:** Expect an initial response confirming receipt within **48 hours**.
* **Updates:** Progress updates will be provided every **3 to 5 business days** during investigation and fix development.
* **Resolution:** Valid vulnerabilities will be patched immediately in supported releases prior to public disclosure.
