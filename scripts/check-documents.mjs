/**
 * Script to verify and update document sources in Supabase
 * 
 * Usage: node scripts/check-documents.mjs
 */

/* eslint-env node */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import process from 'node:process';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDocuments() {
  console.log('🔍 Checking documents in Supabase...\n');

  // Fetch all documents
  const { data, error } = await supabase
    .from('documents')
    .select('id, content, source, metadata');

  if (error) {
    console.error('❌ Error fetching documents:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No documents found in the database');
    return;
  }

  console.log(`📊 Total documents: ${data.length}\n`);

  // Group by source
  const bySource = data.reduce((acc, doc) => {
    const source = doc.source || 'NULL';
    if (!acc[source]) acc[source] = [];
    acc[source].push(doc);
    return acc;
  }, {});

  // Display summary
  console.log('📋 Documents by source:');
  Object.entries(bySource).forEach(([source, docs]) => {
    console.log(`\n  ${source}: ${docs.length} documents`);
    docs.slice(0, 3).forEach((doc, idx) => {
      const preview = doc.content.substring(0, 60).replaceAll('\n', ' ');
      console.log(`    ${idx + 1}. ${preview}...`);
    });
    if (docs.length > 3) {
      console.log(`    ... and ${docs.length - 3} more`);
    }
  });

  // Check for NULL sources
  const nullSources = data.filter(doc => !doc.source);
  if (nullSources.length > 0) {
    console.log('\n⚠️  WARNING: Found documents with NULL source!');
    console.log(`   These ${nullSources.length} documents will be classified as 'general'`);
    console.log('\n💡 Recommendation:');
    console.log('   1. Run: scripts/update-document-sources.sql in Supabase SQL Editor');
    console.log('   2. Or manually update documents with proper source values');
    console.log('   3. Valid sources: "qribar", "reviews", "general"');
  } else {
    console.log('\n✅ All documents have valid source values');
  }
}

// Run check
await checkDocuments();
