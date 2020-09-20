CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    password varchar(255),
    email_or_pn varchar(255)
);