# Chongming DSH Starter

Chongming DSH Starter is an open packaging template for building a clean, self-hosted DeepSeek Harness desktop starter.

The goal is simple: a seed user can download a release, start it locally, enter their own model API key, choose a workspace, and try DSH / Codex-style local agent workflows without receiving any built-in company key or private data.

This repository is the open-source shell. It does not include Chongming hosted memory, Lanwei private knowledge bases, sales-coach content, employee role maps, customer data, or private Hub server configuration.

## What this starter provides

- A repeatable packaging layout for a local DSH distribution.
- No built-in model API keys.
- Local-only startup by default.
- Templates for model relay settings and DSH profile configuration.
- Optional Hub client configuration through an explicit environment file.
- Replaceable branding through `branding/default` and `scripts/apply-brand.cjs`.
- Release scanning rules to catch credentials, runtime state, and private data before publishing.

## What it does not provide

- Chongming hosted organization memory.
- Sales execution coach knowledge or workflows.
- Reliability/private enterprise knowledge bases.
- A production Hub server.
- Employee identity, role-map, or OAuth secrets.
- A vendored DSH upstream distribution in source control.

## Quick start for users

1. Download a release archive.
2. Extract it into a writable local directory.
3. Run `start.cmd`.
4. Open the local URL shown in the terminal.
5. Enter your own model API key in settings.
6. Choose a local workspace and run a small task.
7. Run `stop.cmd` when finished.

The open-source starter is useful without Chongming hosted services. Hosted organization memory and sales-coach workflows are optional commercial integrations.

## Build from an existing DSH distribution

This repository does not commit a full DSH runtime or `node_modules`. To build a starter release from an already installed distribution:

```powershell
node scripts/build-starter.cjs --source C:\path\to\existing-dsh --name Chongming-DSH-Starter-local
node scripts/scan-release.cjs output\Chongming-DSH-Starter-local
```

The build script copies the source distribution, removes runtime/user data, applies public templates, and writes a release manifest. It is intentionally conservative: anything that looks like sessions, credentials, device tokens, logs, local databases, or private runtime state is excluded.

## Custom branding

Teams can replace the starter brand with their own name, logo, headline, and shortcut icon.

```powershell
Copy-Item branding\default branding\acme -Recurse
# edit branding\acme\brand.json and replace logo.svg / icon.ico
node scripts/apply-brand.cjs --release output\Chongming-DSH-Starter-local --brand branding\acme
```

Brand assets are your responsibility. Do not reuse the Chongming bird, Lanwei marks, or any third-party trademark unless you have permission.

## Optional Hub integration

Hub integration is disabled by default. To point a private build at your own Hub, copy:

```text
templates/hub/hub-base.env.example -> hub/hub-base.env
```

Then set `DSH_HUB_BASE` to your own endpoint. Do not publish builds that point to a private production Hub unless that is the explicit release goal.

## Open-source boundary

Code in this repository is Apache-2.0 unless noted otherwise. Third-party packages keep their own licenses. Brand assets are not automatically granted under Apache-2.0; replace them for your own distribution unless the asset license permits reuse.
