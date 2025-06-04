import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const prisma = new PrismaClient();

async function main() {
  console.log('=== DAPP ARCHIVE SCHEMA DEPLOYMENT ===');
  console.log('This script will push the current Prisma schema to the database.');
  
  try {
    // 1. First check the connection to ensure we have access to the database
    console.log('Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful!');
    
    // 2. Run the prisma db push command
    console.log('Pushing schema to database...');
    const { stdout, stderr } = await execPromise('npx prisma db push');
    
    if (stderr && !stderr.includes('Everything is up to date')) {
      console.error('Error pushing schema:', stderr);
      process.exit(1);
    }
    
    console.log('Schema push output:', stdout);
    console.log('Schema pushed successfully!');
    
    // 3. Verify the schema changes
    console.log('Verifying schema changes...');
    
    // Check if we can query using the new columns
    try {
      // Attempt to query using the type column
      await prisma.dapp.findFirst({
        where: {
          type: { not: null }
        },
        select: { id: true }
      });
      
      // Attempt to query using the category column
      await prisma.dapp.findFirst({
        where: {
          category: { not: null }
        },
        select: { id: true }
      });
      
      // Attempt to query using the flow column
      await prisma.image.findFirst({
        where: {
          flow: { not: null }
        },
        select: { id: true }
      });
      
      // Attempt to query using the uiElement column
      await prisma.image.findFirst({
        where: {
          uiElement: { not: null }
        },
        select: { id: true }
      });
      
      console.log('Schema verification successful! New columns are available.');
    } catch (error) {
      console.error('Schema verification failed:', error);
      console.error('The columns may not have been created properly.');
      process.exit(1);
    }
    
    // 4. Generate new Prisma client
    console.log('Generating Prisma client...');
    const { stdout: genStdout, stderr: genStderr } = await execPromise('npx prisma generate');
    
    if (genStderr) {
      console.error('Error generating Prisma client:', genStderr);
      process.exit(1);
    }
    
    console.log('Prisma client generated successfully!');
    console.log('Schema deployment completed successfully!');
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main(); 