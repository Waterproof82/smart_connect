import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanKnowledgeBase() {
  console.log('🧹 Cleaning knowledge base...\n');

  // Count before
  const { count: beforeCount } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Documents before: ${beforeCount}`);

  // Delete all documents
  const { error } = await supabase
    .from('documents')
    .delete()
    .gt('id', 0); // Delete all rows where id > 0 (all rows)

  if (error) {
    console.error('❌ Error cleaning:', error);
    process.exit(1);
  }

  // Count after
  const { count: afterCount } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Documents after: ${afterCount}`);
  console.log('✅ Knowledge base cleaned!\n');
}

await cleanKnowledgeBase();
