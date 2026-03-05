# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | ✅ Yes             |
| older   | ❌ No              |

Only the latest deployed version on the `main` branch receives security updates.

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them responsibly via one of these channels:

1. **GitHub Security Advisories**: Use the "Report a vulnerability" button on the [Security tab](https://github.com/open-ai-school/ai-platform/security/advisories) of this repository.
2. **Email**: Send details to the repository maintainer via their GitHub profile.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgement**: Within 48 hours
- **Initial assessment**: Within 5 business days
- **Fix timeline**: Depends on severity (critical: ASAP, high: 7 days, medium: 30 days)

## Security Measures

This project implements the following security practices:

### Application Security
- HTTP security headers (HSTS, X-Frame-Options, CSP, X-Content-Type-Options)
- No secrets or credentials in source code
- All dependencies monitored via Dependabot
- Automated vulnerability scanning enabled

### Repository Security
- Branch protection on all repositories (no direct pushes to main)
- Required pull request reviews before merging
- Force pushes and branch deletions disabled
- GitHub secret scanning enabled
- Dependabot alerts and auto-fix enabled

### CI/CD Security
- GitHub Actions pinned by commit SHA (not mutable tags)
- Minimal permissions (least privilege) on all workflows
- No secrets exposed in logs

## Disclosure Policy

We follow [responsible disclosure](https://en.wikipedia.org/wiki/Responsible_disclosure). We ask that you:

- Give us reasonable time to fix the issue before public disclosure
- Do not access or modify other users' data
- Act in good faith to avoid privacy violations and disruption

Thank you for helping keep Open AI School and its community safe.
