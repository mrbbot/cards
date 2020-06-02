-- local test user
CREATE DATABASE cards;
CREATE USER cardsuser WITH PASSWORD 'cards';
ALTER ROLE cardsuser SET client_encoding TO 'utf8';
ALTER ROLE cardsuser SET default_transaction_isolation TO 'read committed';
ALTER ROLE cardsuser SET timezone TO 'Europe/London';
GRANT ALL PRIVILEGES ON DATABASE cards TO cardsuser;
ALTER USER cardsuser CREATEDB;

-- tables

-- cards
CREATE TABLE card_set (
    id text PRIMARY KEY,
    name text NOT NULL,
    section text NOT NULL DEFAULT '',
    wip bool NOT NULL DEFAULT FALSE
);

CREATE TABLE card (
    id text PRIMARY KEY,
    set_id text REFERENCES card_set(id) ON DELETE CASCADE,
    section text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    ordering int NOT NULL,
    document tsvector NOT NULL,
    align varchar(8) NOT NULL DEFAULT ''
);
CREATE INDEX card_document_index ON card USING gin(document);

-- users
CREATE TABLE card_user (
    username varchar(100) PRIMARY KEY,
    password varchar(100)
);

CREATE TABLE card_user_refresh_token (
    id uuid PRIMARY KEY,
    username varchar(100) REFERENCES card_user(username) ON DELETE CASCADE,
    token text
);

-- workspaces
CREATE TABLE card_workspace (
    id text PRIMARY KEY,
    name text NOT NULL,
    username varchar(100) REFERENCES card_user(username) ON DELETE CASCADE
);
CREATE TABLE card_workspace_stack (
    id uuid PRIMARY KEY,
    workspace_id text REFERENCES card_workspace(id) ON DELETE CASCADE,
    name text NOT NULL,
    ordering int NOT NULL
);
CREATE TABLE card_workspace_stack_card (
    workspace_id text REFERENCES card_workspace(id) ON DELETE CASCADE,
    stack_id uuid REFERENCES card_workspace_stack(id) ON DELETE CASCADE,
    card_id text REFERENCES card(id) ON DELETE CASCADE,
    ordering int NOT NULL,
    PRIMARY KEY (workspace_id, card_id)
);

-- ALTER TABLE card_workspace ADD COLUMN username varchar(100) REFERENCES card_user(username) ON DELETE CASCADE DEFAULT 'mrbbot';
-- ALTER TABLE card_workspace_stack ADD COLUMN ordering int NOT NULL DEFAULT 0;

-- permissions for local test user
GRANT ALL PRIVILEGES ON TABLE card_set TO cardsuser;
GRANT ALL PRIVILEGES ON TABLE card TO cardsuser;
GRANT ALL PRIVILEGES ON TABLE card_user TO cardsuser;
GRANT ALL PRIVILEGES ON TABLE card_user_refresh_token TO cardsuser;
GRANT ALL PRIVILEGES ON TABLE card_workspace TO cardsuser;
GRANT ALL PRIVILEGES ON TABLE card_workspace_stack TO cardsuser;
GRANT ALL PRIVILEGES ON TABLE card_workspace_stack_card TO cardsuser;
