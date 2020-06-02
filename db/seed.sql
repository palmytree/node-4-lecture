DROP TABLE IF EXISTS users;

CREATE TABLE users(
  id serial primary key,
  email varchar(150) UNIQUE,
  hash text
);