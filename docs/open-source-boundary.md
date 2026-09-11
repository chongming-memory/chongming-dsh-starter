# Open-source Boundary

Chongming DSH Starter is the open shell around a local DSH distribution. Its purpose is to make the first experience clean: download, start, enter your own API key, and try local agent work.

Keep these parts open:

- Build scripts and release layout.
- Public configuration templates.
- Credential-free startup flow.
- Local runtime safety rules.
- Documentation for optional service integration.

Keep these parts out of this repository:

- Model API keys and credential files.
- `.dshcfg`, sessions, attachments, storages, profiles, logs, and local databases.
- Employee names, open IDs, role maps, OAuth secrets, and device tokens.
- Private Hub server code and production endpoints.
- Chongming hosted-memory implementation details that belong to the commercial service.
- Reliability knowledge cards, sales-coach private knowledge, customer records, or internal playbooks.

A public release may mention Chongming hosted memory as an optional integration, but it must run without it.
