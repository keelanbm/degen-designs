-- Fix invalid enum values in Image table
UPDATE "images"
SET "category" = 'EXCHANGE'
WHERE "category" = 'Swap Tokens';

-- Fix any other potential invalid enum values by setting them to 'OTHER'
UPDATE "images"
SET "category" = 'OTHER'
WHERE "category" IS NOT NULL 
AND "category" NOT IN ('LENDING', 'EXCHANGE', 'MARKETPLACE', 'WALLET', 'ANALYTICS', 'GOVERNANCE', 'LAUNCHPAD', 'BRIDGE', 'OTHER');

-- Fix any invalid categories in Dapp table
UPDATE "dapps"
SET "category" = 'OTHER'
WHERE "category" IS NOT NULL 
AND "category" NOT IN ('LENDING', 'EXCHANGE', 'MARKETPLACE', 'WALLET', 'ANALYTICS', 'GOVERNANCE', 'LAUNCHPAD', 'BRIDGE', 'OTHER'); 