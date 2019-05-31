USE sfwebloader;

DROP TABLE configs;

CREATE TABLE configs (
    id VARCHAR(20) NOT NULL,
    config TEXT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY id_UNIQUE (id)
);
