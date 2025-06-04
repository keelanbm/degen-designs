-- Fix any potential invalid values in the category field for dapps table
UPDATE "dapps" SET "category" = NULL WHERE "category" NOT IN ('LENDING', 'EXCHANGE', 'MARKETPLACE', 'WALLET', 'ANALYTICS', 'GOVERNANCE', 'LAUNCHPAD', 'BRIDGE', 'OTHER');

-- Fix any potential invalid values in the category field for images table
UPDATE "images" SET "category" = NULL WHERE "category" NOT IN ('LENDING', 'EXCHANGE', 'MARKETPLACE', 'WALLET', 'ANALYTICS', 'GOVERNANCE', 'LAUNCHPAD', 'BRIDGE', 'OTHER');

-- Fix any potential invalid values in the flow field for images table
UPDATE "images" SET "flow" = NULL WHERE "flow" NOT IN ('ONBOARDING', 'TRADING', 'MINTING', 'PROFILE', 'SETTINGS', 'SWAP', 'SEND', 'RECEIVE', 'OTHER');

-- Fix any potential invalid values in the uiElement field for images table
UPDATE "images" SET "uiElement" = NULL WHERE "uiElement" NOT IN ('TABLE', 'DIALOG', 'CARD', 'FORM', 'CHART', 'MODAL', 'NAVIGATION', 'BUTTON', 'INPUT', 'OTHER'); 