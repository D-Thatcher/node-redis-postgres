
Create, read, update, delete in a Node.js app with an Express server and Postgres database.


```bash
brew install postgresql
brew services start postgresql
psql postgres
```

```sql
CREATE ROLE me WITH LOGIN PASSWORD 'password';
ALTER ROLE me CREATEDB;
CREATE DATABASE api;
GRANT ALL PRIVILEGES ON DATABASE api TO me;
```

```bash
psql -d api -U me
```

```sql
CREATE TABLE users (
  ID SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  password VARCHAR(255),
);

INSERT INTO users (name, email)
  VALUES ('Jerry', 'jerry@example.com'), ('George', 'george@example.com');
```

