import { PrismaClient, DappType, DappCategory, ImageFlow, UIElement } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

// Helper to create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt user for input
const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Helper to suggest dapp type based on name and description
function suggestDappType(name: string, description: string | null): DappType | null {
  const text = `${name} ${description || ''}`.toLowerCase();
  
  if (text.includes('exchange') || text.includes('swap') || text.includes('trade')) {
    return DappType.DEFI;
  } else if (text.includes('nft') || text.includes('collectible') || text.includes('art')) {
    return DappType.NFT;
  } else if (text.includes('social') || text.includes('chat') || text.includes('message')) {
    return DappType.SOCIAL;
  } else if (text.includes('game') || text.includes('play') || text.includes('gaming')) {
    return DappType.GAMING;
  } else if (text.includes('tool') || text.includes('utility') || text.includes('analytics')) {
    return DappType.TOOLS;
  }
  
  return null;
}

// Helper to suggest dapp category based on name and description
function suggestDappCategory(name: string, description: string | null): DappCategory | null {
  const text = `${name} ${description || ''}`.toLowerCase();
  
  if (text.includes('lend') || text.includes('borrow') || text.includes('loan')) {
    return DappCategory.LENDING;
  } else if (text.includes('exchange') || text.includes('swap') || text.includes('dex')) {
    return DappCategory.EXCHANGE;
  } else if (text.includes('marketplace') || text.includes('buy') || text.includes('sell')) {
    return DappCategory.MARKETPLACE;
  } else if (text.includes('wallet') || text.includes('custody') || text.includes('key')) {
    return DappCategory.WALLET;
  } else if (text.includes('analytics') || text.includes('stats') || text.includes('dashboard')) {
    return DappCategory.ANALYTICS;
  } else if (text.includes('dao') || text.includes('vote') || text.includes('governance')) {
    return DappCategory.GOVERNANCE;
  } else if (text.includes('launch') || text.includes('ico') || text.includes('initial')) {
    return DappCategory.LAUNCHPAD;
  } else if (text.includes('bridge') || text.includes('cross') || text.includes('chain')) {
    return DappCategory.BRIDGE;
  }
  
  return null;
}

// Helper to suggest image flow type based on title and description
function suggestImageFlow(title: string | null, description: string | null): ImageFlow | null {
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  
  if (text.includes('onboard') || text.includes('welcome') || text.includes('signup') || text.includes('register')) {
    return ImageFlow.ONBOARDING;
  } else if (text.includes('trade') || text.includes('exchange') || text.includes('swap')) {
    return ImageFlow.TRADING;
  } else if (text.includes('mint') || text.includes('create') || text.includes('new')) {
    return ImageFlow.MINTING;
  } else if (text.includes('profile') || text.includes('account') || text.includes('user')) {
    return ImageFlow.PROFILE;
  } else if (text.includes('settings') || text.includes('preferences') || text.includes('config')) {
    return ImageFlow.SETTINGS;
  } else if (text.includes('swap')) {
    return ImageFlow.SWAP;
  } else if (text.includes('send') || text.includes('transfer')) {
    return ImageFlow.SEND;
  } else if (text.includes('receive') || text.includes('deposit')) {
    return ImageFlow.RECEIVE;
  }
  
  return null;
}

// Helper to suggest UI element based on title and description
function suggestUIElement(title: string | null, description: string | null): UIElement | null {
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  
  if (text.includes('table') || text.includes('list') || text.includes('grid')) {
    return UIElement.TABLE;
  } else if (text.includes('dialog') || text.includes('popup')) {
    return UIElement.DIALOG;
  } else if (text.includes('card') || text.includes('panel')) {
    return UIElement.CARD;
  } else if (text.includes('form') || text.includes('input') || text.includes('field')) {
    return UIElement.FORM;
  } else if (text.includes('chart') || text.includes('graph') || text.includes('plot')) {
    return UIElement.CHART;
  } else if (text.includes('modal') || text.includes('overlay')) {
    return UIElement.MODAL;
  } else if (text.includes('nav') || text.includes('menu') || text.includes('sidebar')) {
    return UIElement.NAVIGATION;
  } else if (text.includes('button') || text.includes('cta') || text.includes('action')) {
    return UIElement.BUTTON;
  } else if (text.includes('input') || text.includes('field') || text.includes('text')) {
    return UIElement.INPUT;
  }
  
  return null;
}

// Format enum values for display
function formatEnumOptions(enumObj: any): string {
  return Object.values(enumObj).join(', ');
}

// Handle tagging dapps
async function tagDapps() {
  console.log('\n===== TAGGING DAPPS =====\n');
  
  // Get dapps without type or category
  const dapps = await prisma.dapp.findMany({
    where: {
      OR: [
        { type: null },
        { category: null }
      ]
    },
    orderBy: { createdAt: 'desc' }
  });
  
  if (dapps.length === 0) {
    console.log('All dapps are already tagged!');
    return;
  }
  
  console.log(`Found ${dapps.length} dapps to tag.\n`);
  
  for (const dapp of dapps) {
    console.log(`\nDapp: ${dapp.name}`);
    console.log(`Description: ${dapp.description || 'N/A'}`);
    console.log(`Current Type: ${dapp.type || 'None'}`);
    console.log(`Current Category: ${dapp.category || 'None'}`);
    
    // Suggest type and category
    const suggestedType = suggestDappType(dapp.name, dapp.description);
    const suggestedCategory = suggestDappCategory(dapp.name, dapp.description);
    
    console.log(`\nSuggested Type: ${suggestedType || 'None'}`);
    console.log(`Suggested Category: ${suggestedCategory || 'None'}`);
    
    // Get user input for type
    const typeInput = await prompt(`Enter type (${formatEnumOptions(DappType)}) or press Enter to use suggestion: `);
    const typeValue = typeInput.trim() ? 
      typeInput.toUpperCase() as DappType : 
      suggestedType;
    
    // Get user input for category
    const categoryInput = await prompt(`Enter category (${formatEnumOptions(DappCategory)}) or press Enter to use suggestion: `);
    const categoryValue = categoryInput.trim() ? 
      categoryInput.toUpperCase() as DappCategory : 
      suggestedCategory;
    
    // Confirm
    const confirm = await prompt(`Apply Type: ${typeValue}, Category: ${categoryValue}? (y/n): `);
    
    if (confirm.toLowerCase() === 'y') {
      await prisma.dapp.update({
        where: { id: dapp.id },
        data: {
          type: typeValue,
          category: categoryValue
        }
      });
      console.log('Dapp updated successfully!');
    } else {
      console.log('Update skipped.');
    }
    
    const continueTagging = await prompt('Continue tagging dapps? (y/n): ');
    if (continueTagging.toLowerCase() !== 'y') {
      break;
    }
  }
}

// Handle tagging images
async function tagImages() {
  console.log('\n===== TAGGING IMAGES =====\n');
  
  // Get images without flow or uiElement
  const images = await prisma.image.findMany({
    where: {
      OR: [
        { flow: null },
        { uiElement: null }
      ]
    },
    include: {
      dapp: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  if (images.length === 0) {
    console.log('All images are already tagged!');
    return;
  }
  
  console.log(`Found ${images.length} images to tag.\n`);
  
  for (const image of images) {
    console.log(`\nImage: ${image.title || 'Untitled'}`);
    console.log(`Dapp: ${image.dapp.name}`);
    console.log(`Description: ${image.description || 'N/A'}`);
    console.log(`URL: ${image.url}`);
    console.log(`Current Flow: ${image.flow || 'None'}`);
    console.log(`Current UI Element: ${image.uiElement || 'None'}`);
    
    // Suggest flow and UI element
    const suggestedFlow = suggestImageFlow(image.title, image.description);
    const suggestedUIElement = suggestUIElement(image.title, image.description);
    
    console.log(`\nSuggested Flow: ${suggestedFlow || 'None'}`);
    console.log(`Suggested UI Element: ${suggestedUIElement || 'None'}`);
    
    // Get user input for flow
    const flowInput = await prompt(`Enter flow (${formatEnumOptions(ImageFlow)}) or press Enter to use suggestion: `);
    const flowValue = flowInput.trim() ? 
      flowInput.toUpperCase() as ImageFlow : 
      suggestedFlow;
    
    // Get user input for UI element
    const uiElementInput = await prompt(`Enter UI element (${formatEnumOptions(UIElement)}) or press Enter to use suggestion: `);
    const uiElementValue = uiElementInput.trim() ? 
      uiElementInput.toUpperCase() as UIElement : 
      suggestedUIElement;
    
    // Confirm
    const confirm = await prompt(`Apply Flow: ${flowValue}, UI Element: ${uiElementValue}? (y/n): `);
    
    if (confirm.toLowerCase() === 'y') {
      await prisma.image.update({
        where: { id: image.id },
        data: {
          flow: flowValue,
          uiElement: uiElementValue
        }
      });
      console.log('Image updated successfully!');
    } else {
      console.log('Update skipped.');
    }
    
    const continueTagging = await prompt('Continue tagging images? (y/n): ');
    if (continueTagging.toLowerCase() !== 'y') {
      break;
    }
  }
}

// Main function
async function main() {
  try {
    console.log('=== DAPP ARCHIVE TAGGING TOOL ===');
    console.log('This tool helps you tag existing dapps and images with metadata.');
    
    // Ask what to tag
    const tagChoice = await prompt('What would you like to tag? (1: Dapps, 2: Images, 3: Both): ');
    
    if (tagChoice === '1' || tagChoice === '3') {
      await tagDapps();
    }
    
    if (tagChoice === '2' || tagChoice === '3') {
      await tagImages();
    }
    
    console.log('\nTagging complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run the script
main(); 