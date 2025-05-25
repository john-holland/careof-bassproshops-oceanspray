#!/bin/bash
set -e

# Usage: ./01-check_and_create_db.sh <db_name>

DB_USER="postgres"

create_db_if_not_exists() {
  local db_name="$1"
  if psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$db_name"; then
    echo "Database '$db_name' already exists. Skipping creation."
  else
    echo "Creating database '$db_name'..."
    createdb -U "$DB_USER" "$db_name"
  fi
}

# List of databases to check and create
for db in uav fishery pact_broker; do
  create_db_if_not_exists "$db"
done

echo "All databases exist. Proceeding with initialization." 