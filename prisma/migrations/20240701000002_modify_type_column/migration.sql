-- First check if the DappType enum exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DappType') THEN
        CREATE TYPE "DappType" AS ENUM ('DEFI', 'NFT', 'SOCIAL', 'GAMING', 'TOOLS', 'OTHER');
    END IF;
END $$;

-- Check if the column exists, if not add it
ALTER TABLE "dapps" 
ADD COLUMN IF NOT EXISTS "type" "DappType"; 