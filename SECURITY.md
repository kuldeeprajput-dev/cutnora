# Security Policy

This policy describes how to report security vulnerabilities in Cutnora, its
browser video editor, and the code distributed in this repository.

## Supported versions

Security fixes target the latest code on the repository's default branch.
The current development version in `package.json` is `0.1.0`. Older revisions
and releases do not have a separate security maintenance commitment; update to
the latest code when a fix is available. Forks and third-party deployments are
maintained by their respective owners.

## Reporting a vulnerability

Email the maintainer, Kuldeep Rajput, at
[contact.kuldeeprajput@gmail.com](mailto:contact.kuldeeprajput@gmail.com), using
the subject **Cutnora security report**.

Do not disclose vulnerability details in a public issue, discussion, or pull
request before coordinating with the maintainer. If GitHub's **Report a
vulnerability** option is available for this repository, you may use it instead
to submit a private report. Adding this policy does not enable that GitHub
feature; it must be enabled separately in repository settings.

Please include:

- A summary of the vulnerability and its potential impact.
- The affected commit or version, browser version, operating system, and device.
- Reproduction steps and the affected files or features, if known.
- A minimal proof of concept or sample media you have permission to share.
- Any required settings, permissions, or user actions.
- Suggested mitigations, if available, and your preferred contact details.

Remove personal data, credentials, and private recordings from reports. Explain
how to reproduce with a small synthetic sample whenever possible.

## Project-specific scope

Cutnora processes media in the browser and stores projects and assets locally
using IndexedDB and, where supported, the Origin Private File System (OPFS).
Its elements library can request assets from external providers. Relevant
security concerns include:

- Unintended exposure or transmission of imported media or project data.
- Script execution or unsafe content handling through imported files, SVG
  elements, text, project metadata, or external assets.
- Unauthorized access to, modification of, or deletion of stored project data.
- Exploitable flaws in media decoding, recording, rendering, or export paths.
- Dependency vulnerabilities with a demonstrated impact on Cutnora.

Ordinary UI bugs, export quality problems, or performance issues should follow
[CONTRIBUTING.md](CONTRIBUTING.md), unless they have a security impact.
Browser or third-party service vulnerabilities should also be reported to the
appropriate vendor; explain any Cutnora-specific impact in your report.

## Investigation and disclosure

The maintainer will review the report, request more information when needed,
and coordinate any confirmed fix and public disclosure with the reporter.
Response and resolution times depend on availability, severity, and the work
required. If you have not received a reply after seven days, follow up through
the same private channel.

Reports are handled discreetly, with information shared only as necessary to
investigate and resolve the issue. Any public acknowledgment should use the
name or handle agreed with the reporter. Please agree on a disclosure timeline
so users can receive a fix or mitigation before exploit details are published.

## Responsible testing

Use a local checkout, disposable projects, and files you own or have permission
to use. Do not access other users' data, disrupt public deployments, or perform
destructive testing without the affected owner's permission. A security report
should contain only the evidence needed to demonstrate the issue.
