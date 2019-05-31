USE sfwebloader;

SET FOREIGN_KEY_CHECKS=0; DROP TABLE IF EXISTS configs;

CREATE TABLE configs (
    id VARCHAR(20) NOT NULL,
    config TEXT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY id_UNIQUE (id)
);

SET FOREIGN_KEY_CHECKS=0; DROP TABLE IF EXISTS records;
SET FOREIGN_KEY_CHECKS=0; DROP TABLE IF EXISTS documents;
SET FOREIGN_KEY_CHECKS=0; DROP TABLE IF EXISTS sfschemas;
SET FOREIGN_KEY_CHECKS=0; DROP TABLE IF EXISTS sfconnections;
SET FOREIGN_KEY_CHECKS=0; DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(40) NOT NULL,
    password varchar(200) NOT NULL,
    email varchar(45),
    default_conn INT(11),
    PRIMARY KEY (id),
    UNIQUE KEY id_UNIQUE (id),
    UNIQUE KEY username_UNIQUE (username),
    UNIQUE KEY email_UNIQUE (email)
);

CREATE TABLE sfconnections (
    id int(11) NOT NULL AUTO_INCREMENT,
    user int(11),
    title varchar(40) NOT NULL,
    config varchar(3000) NOT NULL,
    default_sfschema INT(11),
    PRIMARY KEY (id),
    UNIQUE KEY id_UNIQUE (id),
    UNIQUE KEY title_UNIQUE (title),
    FOREIGN KEY sfconnection_user_FOREIGN (user)
    REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

ALTER TABLE users 
ADD FOREIGN KEY default_conn_sfconnection_FOREIGN (default_conn)
REFERENCES sfconnections (id)
ON UPDATE CASCADE
ON DELETE SET NULL;

CREATE TABLE sfschemas (
    id int(11) NOT NULL AUTO_INCREMENT,
    user int(11),
    sfconnection int(11),
    title varchar(40) NOT NULL,
    config MEDIUMTEXT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY id_UNIQUE (id),
    FOREIGN KEY sfschema_user_FOREIGN (user)
    REFERENCES users (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
    FOREIGN KEY sfconnection_FOREIGN (sfconnection)
    REFERENCES sfconnections (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

ALTER TABLE sfconnections
ADD FOREIGN KEY default_sfschema_sfschema_FOREIGN (default_sfschema)
REFERENCES sfschemas (id)
ON UPDATE CASCADE
ON DELETE SET NULL;

CREATE TABLE documents (
    id int(11) NOT NULL AUTO_INCREMENT,
    type varchar(100) NOT NULL,
    fileblob LONGBLOB NOT NULL,
    html LONGTEXT NOT NULL,
    filehash varchar(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY id_UNIQUE (id),
    UNIQUE KEY hash_UNIQUE (filehash)
);

CREATE TABLE records (
    id int(11) NOT NULL AUTO_INCREMENT,
    document int(11) NOT NULL,
    sfschema int(11) NOT NULL,
    data TEXT,
    PRIMARY KEY (id),
    UNIQUE KEY id_UNIQUE (id),
    FOREIGN KEY record_document_FOREIGN (document)
    REFERENCES documents (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
    FOREIGN KEY record_sfschema_FOREIGN (sfschema) 
    REFERENCES sfschemas (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);
