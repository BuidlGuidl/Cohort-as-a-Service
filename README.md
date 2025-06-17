# Cohort-as-a-Service [WIP]

### Testing process
- Create `packages/ponder/.env.local` following `packages/ponder/.env.example`
- Start postgres locally `brew services start postgresql`
- run `psql postgres`
- Create a db `CREATE DATABASE caas_db;` The `DATABASE_URL` in the `.env.example` is tied to the `caas_db`
- On a different terminal, run `yarn ponder:dev`
- In the nextjs app add `NEXT_PUBLIC_PONDER_API_URL=http://localhost:42069` to the `.env.local`
