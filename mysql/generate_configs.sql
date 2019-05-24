USE sfwebloader;

DROP TABLE configs;

CREATE TABLE configs (
    id VARCHAR(20) NOT NULL,
    config TEXT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY id_UNIQUE (id)
);

INSERT INTO configs (id, config) VALUES (
    'session',
    '{ \"secret\": \"S3oqmn6dChVCqsAouT1n2OsZbZOJ8OAPl8CRE75oko198XG7WHSIGKoWnqVYDWROfxZ\", \"resave\": true, \"saveUninitialized\": true, \"maxAge\": \"7000000\" }'
);

INSERT INTO configs (id, config) VALUES (
    'jwt',
    '{ "secret": "as8d7fyeiuthw3jgb4356dkfjv336bsdntl6kge9ghub7fkbngweoruh9qfnlerfvnsi" }'
);
