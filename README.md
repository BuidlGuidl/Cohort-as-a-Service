# Cohort-as-a-Service [WIP]

### Testing process
- Copy or rename ```packages/ponder/.env.example``` to ```packages/ponder/.env.local```
- Add your Alchemy key to ```packages/ponder/.env.example```
- Start postgres locally ```brew services start postgresql``` (MacOS & Linux only)
- Run ```psql postgres```
- Create a db ```CREATE DATABASE caas_db;```  The ```DATABASE_URL``` in ```.env.local``` links to the ```caas_db```
- In a different terminal, run ```yarn ponder:dev``` and wait until this completes
- Copy or rename ```packages/nextjs/.env.example``` to ```packages/nextjs/.env.local```
- Add ```NEXT_PUBLIC_PONDER_URL=http://localhost:42069``` to ```packages/nextjs/.env.local```
- Create the file ```packages/nextjs/.env```
- Delete the ```DATABASE_URL``` line from ```packages/nextjs/.env.local``` and add it to ```packages/nextjs/.env```
