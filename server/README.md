# Use as notes for now

## Requirements

```
Details:
- psycopg[binary] bundles libpq and OpenSSL, so no system packages needed. (local/dev)
- psycopg[c] uses the C accelerator and system’s libpq. Install OS deps:
  - Debian/Ubuntu: apt-get install -y libpq5 libpq-dev gcc python3-dev
  - Alpine: apk add --no-cache postgresql-libs && apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev
```