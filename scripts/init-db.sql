-- Initialize database
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Database is already created by POSTGRES_DB environment variable
-- This file can be used for additional initialization if needed

-- Example: Create read-only user for monitoring
-- CREATE USER monitoring WITH PASSWORD 'monitoring_password';
-- GRANT CONNECT ON DATABASE nestjs_api TO monitoring;
-- GRANT USAGE ON SCHEMA public TO monitoring;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitoring;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO monitoring;