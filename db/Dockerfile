# Use the official PostgreSQL image
FROM postgres:15

# Copy initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/

# Set environment variables
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=password
ENV POSTGRES_DB=postgres

# Expose the PostgreSQL port
EXPOSE 5432 