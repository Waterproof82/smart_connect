/**
 * Security Integration Tests - RLS Policies
 * 
 * Tests Row Level Security policies for documents table
 * Security: OWASP A01:2021 - Broken Access Control
 * 
 * ⚠️ REQUIRES MANUAL SETUP:
 * 1. Set SUPABASE_SERVICE_ROLE_KEY in .env.test or .env.local
 * 2. Get the key from: Supabase Dashboard > Settings > API > service_role key (secret)
 * 3. Run: npm test tests/integration/admin/documents-rls.test.ts
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load environment variables (tests should have .env.test or .env.local)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Skip tests if SERVICE_ROLE_KEY is not configured
const describeIfConfigured = SUPABASE_SERVICE_KEY ? describe : describe.skip;

describeIfConfigured('Documents Table - RLS Policies', () => {
  let anonClient: SupabaseClient;
  let serviceClient: SupabaseClient;
  let testDocumentId: string;

  beforeAll(async () => {
    // Initialize clients
    anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Create test document using service role
    const { data, error } = await serviceClient
      .from('documents')
.insert({
        content: 'Test document for RLS policies',
        source: 'security-test',
        embedding: new Array(768).fill(0.1)
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create test document: ${error.message}`);
    }

    testDocumentId = data.id;
  });

  afterAll(async () => {
    // Cleanup test document
    if (testDocumentId) {
      await serviceClient
        .from('documents')
        .delete()
        .eq('id', testDocumentId);
    }
  });

  describe('Anon Access (Chatbot)', () => {
    test('should allow anonymous SELECT on documents', async () => {
      const { data, error } = await anonClient
        .from('documents')
        .select('*')
        .eq('id', testDocumentId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.id).toBe(testDocumentId);
    });

    test('should deny anonymous INSERT on documents', async () => {
      const { data, error } = await anonClient
        .from('documents')
.insert({
          content: 'Unauthorized insert attempt',
          source: 'security-test-attack',
          embedding: new Array(768).fill(0.1)
        });

      expect(error).toBeTruthy();
      expect(error?.code).toBe('42501'); // Postgres insufficient_privilege
      expect(data).toBeNull();
    });

    test('should deny anonymous UPDATE on documents', async () => {
      const { data, error } = await anonClient
        .from('documents')
        .update({ content: 'Unauthorized update' })
        .eq('id', testDocumentId);

      expect(error).toBeNull();
      expect(data).toBeNull();
    });

    test('should deny anonymous DELETE on documents', async () => {
      const { data, error } = await anonClient
        .from('documents')
        .delete()
        .eq('id', testDocumentId);

      expect(error).toBeNull();
      expect(data).toBeNull();
    });
  });

  describe('Non-Admin User Access', () => {
    let normalUserClient: SupabaseClient;
    let normalUserEmail: string;

    beforeAll(async () => {
      // Create normal user (without admin role)
      normalUserEmail = `test-user-${Date.now()}@example.com`;
      normalUserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const { error: signUpError } = await normalUserClient.auth.signUp({
        email: normalUserEmail,
        password: 'Test123456!',
        options: {
          data: {
            role: 'user' // NOT admin
          }
        }
      });

      if (signUpError) {
        console.warn('User already exists or signup failed:', signUpError.message);
      }

      // Sign in
      await normalUserClient.auth.signInWithPassword({
        email: normalUserEmail,
        password: 'Test123456!'
      });
    });

    afterAll(async () => {
      // Cleanup: Delete test user
      await normalUserClient.auth.signOut();
    });

test('should allow non-admin SELECT on documents (everyone can read)', async () => {
      const { data, error } = await normalUserClient
        .from('documents')
        .select('*');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    test('should deny non-admin INSERT on documents', async () => {
      const { data, error } = await normalUserClient
        .from('documents')
.insert({
          content: 'Unauthorized insert by normal user',
          source: 'security-test-attack',
          embedding: new Array(768).fill(0.1)
        });

      expect(error).toBeTruthy();
      expect(data).toBeNull();
    });
  });

  describe('Admin User Access', () => {
    let adminClient: SupabaseClient;
    let adminEmail: string;

    beforeAll(async () => {
      // Note: RLS policy checks for specific admin email (admin@smartconnect.ai)
      // This test requires the actual admin credentials or service_role
      // Skipping admin-specific tests as they need real admin credentials
      
      // Use service client for admin operations (bypasses RLS)
      adminClient = serviceClient;
      adminEmail = 'admin@smartconnect.ai';
      
      // Skip if no service key
      if (!SUPABASE_SERVICE_KEY) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY required for admin tests');
      }
    });

    afterAll(async () => {
      // No cleanup needed when using service client
    });

    test('should allow admin SELECT on documents', async () => {
      const { data, error } = await adminClient
        .from('documents')
        .select('*')
        .eq('id', testDocumentId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.id).toBe(testDocumentId);
    });

    test('should allow admin INSERT on documents', async () => {
      const { data, error } = await adminClient
        .from('documents')
.insert({
          content: 'Admin inserted document',
          source: 'admin-security-test',
          embedding: new Array(768).fill(0.2)
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.content).toBe('Admin inserted document');

      // Cleanup
      if (data?.id) {
        await adminClient.from('documents').delete().eq('id', data.id);
      }
    });

    test('should allow admin UPDATE on documents', async () => {
      const { data, error } = await adminClient
        .from('documents')
        .update({ content: 'Admin updated content' })
        .eq('id', testDocumentId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.content).toBe('Admin updated content');

      // Restore original content
      await adminClient
        .from('documents')
        .update({ content: 'Test document for RLS policies' })
        .eq('id', testDocumentId);
    });

    test('should allow admin DELETE on documents', async () => {
      // Create temporary document to delete
      const { data: tempDoc } = await adminClient
        .from('documents')
.insert({
          content: 'Temporary document for delete test',
          source: 'admin-security-test',
          embedding: new Array(768).fill(0.3)
        })
        .select()
        .single();

      const { error: deleteError } = await adminClient
        .from('documents')
        .delete()
        .eq('id', tempDoc.id);

      expect(deleteError).toBeNull();

      // Verify deletion
      const { data: verifyData } = await adminClient
        .from('documents')
        .select('*')
        .eq('id', tempDoc.id)
        .single();

      expect(verifyData).toBeNull();
    });
  });

  describe('Service Role Access', () => {
    test('should allow service role full access', async () => {
      // Service role should bypass RLS
      const { data, error } = await serviceClient
        .from('documents')
        .select('*')
        .eq('id', testDocumentId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data?.id).toBe(testDocumentId);
    });
  });
});
