// scripts/fetch_latest_vercel_logs.js
// Usage: node scripts/fetch_latest_vercel_logs.js <vercel_project_name> <log_limit>
// Example: node scripts/fetch_latest_vercel_logs.js degen-designs-wx6g 50

const fetch = require('node-fetch');

// Set your Vercel MCP API endpoint and token here
const VERCEL_MCP_API = 'https://api.vercel.com/v13'; // Update if needed
const VERCEL_TOKEN = process.env.VERCEL_TOKEN; // Set this in your environment

if (!VERCEL_TOKEN) {
  console.error('Please set the VERCEL_TOKEN environment variable.');
  process.exit(1);
}

const projectName = process.argv[2];
const logLimit = process.argv[3] || 50;

if (!projectName) {
  console.error('Usage: node scripts/fetch_latest_vercel_logs.js <vercel_project_name> <log_limit>');
  process.exit(1);
}

async function getLatestDeployment(project) {
  const url = `${VERCEL_MCP_API}/deployments?project=${project}&limit=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch deployments: ${res.statusText}`);
  }
  const data = await res.json();
  if (!data.deployments || data.deployments.length === 0) {
    throw new Error('No deployments found for this project.');
  }
  return data.deployments[0].uid;
}

async function getDeploymentLogs(deploymentId, limit) {
  const url = `${VERCEL_MCP_API}/deployments/${deploymentId}/events?limit=${limit}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch deployment logs: ${res.statusText}`);
  }
  const data = await res.json();
  return data.events || [];
}

(async () => {
  try {
    console.log(`Fetching latest deployment for project: ${projectName}`);
    const deploymentId = await getLatestDeployment(projectName);
    console.log(`Latest deployment ID: ${deploymentId}`);
    console.log(`Fetching logs (limit: ${logLimit})...`);
    const logs = await getDeploymentLogs(deploymentId, logLimit);
    const filteredLogs = logs.filter((log) => {
      const text = (log.text || '').toLowerCase();
      const type = (log.type || '').toLowerCase();
      return text.includes('error') || text.includes('warning') || type.includes('error') || type.includes('warning');
    });
    if (filteredLogs.length === 0) {
      console.log('No warnings or errors found in the latest deployment logs.');
    } else {
      filteredLogs.forEach((log) => {
        const time = new Date(log.created).toISOString();
        console.log(`[${time}] ${log.type}: ${log.text}`);
      });
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})(); 