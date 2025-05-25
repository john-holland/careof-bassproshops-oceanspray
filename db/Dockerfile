FROM postgres:13

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=unatco001
ENV POSTGRES_MULTIPLE_DATABASES=fishery,pact_broker

COPY 01-check_and_create_db.sh /docker-entrypoint-initdb.d/
COPY 02-init.sql /docker-entrypoint-initdb.d/ 