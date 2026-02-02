-- Migration to add columns for theory and facts to the situations table
ALTER TABLE situations ADD COLUMN IF NOT EXISTS theory TEXT;
ALTER TABLE situations ADD COLUMN IF NOT EXISTS finnish_fact TEXT;
