-- Create the DappType enum if it doesn't exist
CREATE TYPE IF NOT EXISTS "DappType" AS ENUM ('DEFI', 'NFT', 'SOCIAL', 'GAMING', 'TOOLS', 'OTHER');

-- Add the type column to the dapps table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dapps' AND column_name = 'type') THEN
        ALTER TABLE "dapps" ADD COLUMN "type" "DappType";
    END IF;
END $$; 