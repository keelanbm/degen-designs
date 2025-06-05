-- Create temporary backup tables
CREATE TABLE "images_backup" AS TABLE "images";
CREATE TABLE "dapps_backup" AS TABLE "dapps";

-- First, convert all string values that don't match enums to NULL
UPDATE "images"
SET "category" = NULL
WHERE "category" IS NOT NULL 
AND "category" NOT IN ('LENDING', 'EXCHANGE', 'MARKETPLACE', 'WALLET', 'ANALYTICS', 'GOVERNANCE', 'LAUNCHPAD', 'BRIDGE', 'OTHER');

UPDATE "dapps"
SET "category" = NULL
WHERE "category" IS NOT NULL 
AND "category" NOT IN ('LENDING', 'EXCHANGE', 'MARKETPLACE', 'WALLET', 'ANALYTICS', 'GOVERNANCE', 'LAUNCHPAD', 'BRIDGE', 'OTHER');

UPDATE "dapps"
SET "type" = NULL
WHERE "type" IS NOT NULL 
AND "type" NOT IN ('DEFI', 'NFT', 'SOCIAL', 'GAMING', 'TOOLS', 'OTHER');

-- Update specific known values
UPDATE "images"
SET "category" = 'EXCHANGE'
WHERE "category" = 'Swap Tokens';

-- Fix any remaining issues by setting to default values
UPDATE "images"
SET "category" = 'OTHER'
WHERE "category" IS NOT NULL 
AND "category" NOT IN ('LENDING', 'EXCHANGE', 'MARKETPLACE', 'WALLET', 'ANALYTICS', 'GOVERNANCE', 'LAUNCHPAD', 'BRIDGE', 'OTHER');

UPDATE "dapps"
SET "category" = 'OTHER'
WHERE "category" IS NOT NULL 
AND "category" NOT IN ('LENDING', 'EXCHANGE', 'MARKETPLACE', 'WALLET', 'ANALYTICS', 'GOVERNANCE', 'LAUNCHPAD', 'BRIDGE', 'OTHER');

UPDATE "dapps"
SET "type" = 'OTHER'
WHERE "type" IS NOT NULL 
AND "type" NOT IN ('DEFI', 'NFT', 'SOCIAL', 'GAMING', 'TOOLS', 'OTHER'); 