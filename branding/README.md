# Branding

This directory contains a safe, replaceable example brand for Chongming DSH Starter.

To make your own branded starter:

1. Copy `branding/default` to a new folder, for example `branding/acme`.
2. Replace `logo.svg` with your own SVG.
3. Optionally add `icon.ico` for Windows shortcuts.
4. Edit `brand.json`.
5. Apply it to a built release:

```powershell
node scripts/apply-brand.cjs --release output\Chongming-DSH-Starter-local --brand branding\acme
```

Do not reuse someone else's trademark, company logo, or private brand assets unless you have permission.
