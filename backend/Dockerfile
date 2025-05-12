FROM python:3.9

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Remove alembic.ini directory if it exists and create the file
RUN rm -rf /app/alembic.ini && \
    echo '[alembic]\n\
    script_location = alembic\n\
    sqlalchemy.url = postgresql://postgres:postgres@db:5432/university_db\n\
    \n\
    [loggers]\n\
    keys = root,sqlalchemy,alembic\n\
    \n\
    [handlers]\n\
    keys = console\n\
    \n\
    [formatters]\n\
    keys = generic\n\
    \n\
    [logger_root]\n\
    level = WARN\n\
    handlers = console\n\
    qualname =\n\
    \n\
    [logger_sqlalchemy]\n\
    level = WARN\n\
    handlers =\n\
    qualname = sqlalchemy.engine\n\
    \n\
    [logger_alembic]\n\
    level = INFO\n\
    handlers =\n\
    qualname = alembic\n\
    \n\
    [handler_console]\n\
    class = StreamHandler\n\
    args = (sys.stderr,)\n\
    level = NOTSET\n\
    formatter = generic\n\
    \n\
    [formatter_generic]\n\
    format = %(levelname)-5.5s [%(name)s] %(message)s\n\
    datefmt = %H:%M:%S\n\
    ' > /app/alembic.ini

# Create a script to wait for the database and run migrations
RUN echo '#!/bin/bash\n\
    echo "Waiting for database..."\n\
    sleep 10\n\
    export PYTHONPATH=/app\n\
    alembic upgrade head\n\
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload\n\
    ' > /app/start.sh

RUN chmod +x /app/start.sh

CMD ["/bin/bash", "/app/start.sh"] 