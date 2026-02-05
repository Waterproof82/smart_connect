/**
 * Clean Duplicate Documents Script
 * 
 * Removes duplicate documents from the knowledge base,
 * keeping only the most recent version of each unique content+source combination.
 */

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
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Present' : 'Missing');
  process.exit(1);
}

console.log('🔑 Using Supabase URL:', supabaseUrl);
console.log('🔑 Service key length:', supabaseServiceKey.length);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanDuplicates() {
  console.log('🔍 Searching for duplicate documents...\n');

  try {
    // Get all documents
    const { data: allDocuments, error } = await supabase
      .from('documents')
      .select('id, content, source, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    if (!allDocuments || allDocuments.length === 0) {
      console.log('✅ No documents found in database');
      return;
    }

    console.log(`📊 Total documents: ${allDocuments.length}`);

    // Group by content + source to find duplicates
    const uniqueMap = new Map();
    const duplicatesToDelete = [];

    for (const doc of allDocuments) {
      // Create unique key from first 100 chars of content + source
      const contentPreview = doc.content.substring(0, 100);
      const key = `${contentPreview}_${doc.source}`;

      if (uniqueMap.has(key)) {
        // This is a duplicate, mark for deletion
        duplicatesToDelete.push(doc.id);
      } else {
        // First occurrence, keep it
        uniqueMap.set(key, doc);
      }
    }

    if (duplicatesToDelete.length === 0) {
      console.log('✅ No duplicates found!\n');
      return;
    }

    console.log(`\n⚠️  Found ${duplicatesToDelete.length} duplicate documents`);
    console.log(`✅ Will keep ${uniqueMap.size} unique documents\n`);

    // Show what will be deleted
    console.log('Documents to delete:');
    for (const id of duplicatesToDelete) {
      const doc = allDocuments.find(d => d.id === id);
      const preview = doc.content.substring(0, 50).replaceAll('\n', ' ');
      console.log(`  - ${id} | ${doc.source} | "${preview}..."`);
    }

    // Confirm deletion
    console.log('\n⚠️  This will DELETE the documents listed above.');
    console.log('Press Ctrl+C to cancel or wait 5 seconds to proceed...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Delete duplicates
    console.log('🗑️  Deleting duplicates...');
    
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .in('id', duplicatesToDelete);

    if (deleteError) {
      throw new Error(`Failed to delete duplicates: ${deleteError.message}`);
    }

    console.log(`\n✅ Successfully deleted ${duplicatesToDelete.length} duplicate documents`);
    console.log(`✅ ${uniqueMap.size} unique documents remain in database\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run cleanup with top-level await
await cleanDuplicates();
