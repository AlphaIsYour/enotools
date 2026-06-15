# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in EnoTools, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please email: **security@enotools.dev**

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 5 business days
- **Fix or mitigation**: Depends on severity, typically within 14 days for critical issues

## Scope

EnoTools is a client-side-only application. All tool processing happens in the user's browser. There are no server-side API endpoints, user accounts, or database interactions.

### In scope

- Cross-site scripting (XSS) in tool inputs or outputs
- Content injection via tool processing
- Security header misconfigurations
- Dependency vulnerabilities with exploitable client-side impact

### Out of scope

- Self-XSS (user entering scripts in their own browser session)
- Denial of service via large inputs (these are client-side tools)
- Social engineering attacks
- Issues in third-party dependencies without a demonstrated exploit path in EnoTools

## Security Measures

- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- HTML sanitization in markdown rendering
- HTML entity escaping in syntax-highlighted output
- No server-side data storage or transmission
- No use of `eval()` or `new Function()` with user input
- No use of `dangerouslySetInnerHTML` with unsanitized user content

## Dependencies

EnoTools uses the following libraries that process user-provided content:

- **marked** (Markdown to HTML) - output is sanitized before rendering
- **diff** (text comparison) - output rendered as text, not HTML
- **qrcode** (QR code generation) - generates images from user input

## Updates

This security policy is reviewed and updated as needed. Last updated: June 2026.
