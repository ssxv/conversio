FROM postgres:16.1

ENV POSTGRES_USER postgres
ENV POSTGRES_PASSWORD postgres
ENV POSTGRES_DB chatapp

COPY db-setup.sql /docker-entrypoint-initdb.d/

EXPOSE 5432
