FROM postgres:13

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=fishery

COPY ./init.sql /docker-entrypoint-initdb.d/ 