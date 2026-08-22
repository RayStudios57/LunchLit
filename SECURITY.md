# Security Policy

## Supported Versions

We issue security updates and patches for official LunchLIT deployments, prioritizing the Vercel production build:

| Version | Supported | Deployment Platform | Patch Frequency |
| --- | --- | --- | --- |
| 1.1.x | :white_check_mark: | Vercel | Active & Priority |
| 1.1.x | :warning: | Lovable | Limited / Periodic |
| < 1.1 | :x: | Legacy Deployments | Unsupported |

> **Note:** Builds hosted on **Lovable** remain fully functional, but security patches and updates are deployed less frequently compared to official builds on **Vercel**. For the most up-to-date and secure experience, use the main Vercel deployment.

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
* **Resolution:** Valid vulnerabilities will be patched in supported releases prior to public disclosure.
