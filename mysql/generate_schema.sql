USE sfpdfwebloader;

DROP TABLE IF EXISTS configs;

CREATE TABLE configs (
    id VARCHAR(20) NOT NULL,
    config TEXT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY id_UNIQUE (id)
);

DROP TABLE IF EXISTS records;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS sfschemas;
DROP TABLE IF EXISTS sfconnections;
DROP TABLE IF EXISTS users;

CREATE TABLE "users" (
    "id" int(11) NOT NULL AUTO_INCREMENT,
    "username" varchar(40) NOT NULL,
    "password" varchar(40) NOT NULL,
    "email" varchar(45) NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE KEY "id_UNIQUE" ("id"),
    UNIQUE KEY "username_UNIQUE" ("username"),
    UNIQUE KEY "email_UNIQUE" ("email")
);

CREATE TABLE "sfconnections" (
    "id" int(11) NOT NULL AUTO_INCREMENT,
    "user" int(11),
    "config" varchar(3000) NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY "user_FOREIGN" ("user")
    REFERENCES "users" ("id")
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE TABLE "sfschemas" (
    "id" int(11) NOT NULL AUTO_INCREMENT,
    "user" int(11),
    "config" MEDIUMTEXT NOT NULL,
    PRIMARY KEY ("id"),
    FOREIGN KEY "user_FOREIGN" ("user")
    REFERENCES "users" ("id")
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE TABLE "documents" (
    "id" int(11) NOT NULL AUTO_INCREMENT,
    "sfschema" int(11) NOT NULL,
    "type" varchar(100) NOT NULL,
    "file" LONGBLOB,
    "html" LONGTEXT,
    PRIMARY KEY ("id"),
    FOREIGN KEY "sfschema_FOREIGN" ("sfschema")
    REFERENCES "sfschemas" ("id")
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE "records" (
    "id" int(11) NOT NULL AUTO_INCREMENT,
    "document" int(11) NOT NULL,
    "data" TEXT,
    PRIMARY KEY ("id"),
    FOREIGN KEY "document_FOREIGN" ("document")
    REFERENCES "documents" ("id")
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);
