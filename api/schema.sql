CREATE DATABASE cards;
CREATE USER cardsuser WITH PASSWORD 'cards';
ALTER ROLE cardsuser SET client_encoding TO 'utf8';
ALTER ROLE cardsuser SET default_transaction_isolation TO 'read committed';
ALTER ROLE cardsuser SET timezone TO 'Europe/London';
GRANT ALL PRIVILEGES ON DATABASE cards TO cardsuser;
ALTER USER cardsuser CREATEDB;

CREATE TABLE card_set (
    id text PRIMARY KEY,
    name text
);

CREATE TABLE card (
    id text PRIMARY KEY,
    set_id text REFERENCES card_set(id) ON DELETE CASCADE,
    section text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    document tsvector NOT NULL,
    align varchar(8) DEFAULT ''
);
CREATE INDEX card_document_fts ON card USING gin(document);

GRANT ALL PRIVILEGES ON TABLE card_set TO cardsuser;
GRANT ALL PRIVILEGES ON TABLE card TO cardsuser;
