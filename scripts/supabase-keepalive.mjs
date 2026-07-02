const projectUrl = process.env.SUPABASE_PROJECT_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!projectUrl || !anonKey) {
  console.error('Missing SUPABASE_PROJECT_URL/SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const endpoint = `${projectUrl.replace(/\/$/, '')}/rest/v1/rpc/healthcheck_keepalive`;

async function run() {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: '{}',
  });

  const payloadText = await response.text();

  if (!response.ok) {
    console.error('Supabase keepalive failed:', response.status, payloadText);
    process.exit(1);
  }

  console.log('Supabase keepalive success:', payloadText || 'ok');
}

run().catch((error) => {
  console.error('Unexpected keepalive error:', error.message);
  process.exit(1);
});
