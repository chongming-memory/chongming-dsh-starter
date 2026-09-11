# Security Policy

This repository must not contain model API keys, device tokens, employee identifiers, customer data, private knowledge-base content, or generated runtime state.

Before publishing a release, run the scan script and review the generated artifact manually. Treat `.dshcfg`, `device.cred`, sessions, attachments, storages, logs, role maps, and private Hub configuration as non-distributable user/runtime data.

If you find a credential or private data in a release artifact, revoke it first, then remove the artifact and publish a clean build.
