-- Find any records with invalid category values and set them to null
UPDATE "dapps" SET "category" = NULL WHERE "category" NOT IN ('LENDING', 'EXCHANGE', 'MARKETPLACE', 'WALLET', 'ANALYTICS', 'GOVERNANCE', 'LAUNCHPAD', 'BRIDGE', 'OTHER');

-- Find any records with invalid category values in the images table and set them to null
UPDATE "images" SET "category" = NULL WHERE "category" NOT IN ('LENDING', 'EXCHANGE', 'MARKETPLACE', 'WALLET', 'ANALYTICS', 'GOVERNANCE', 'LAUNCHPAD', 'BRIDGE', 'OTHER'); 