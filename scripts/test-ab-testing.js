// ========================================
// A/B TESTING: VALIDATION SCRIPT
// ========================================
// Test script to validate A/B testing implementation

/**
 * Simple string hash function for consistent assignment
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

/**
 * Assigns users to A/B test groups with consistent assignment
 */
function assignTestGroup(userId, testGroups = ['A', 'B', 'C']) {
  const hash = hashCode(userId);
  return testGroups[Math.abs(hash) % testGroups.length];
}

// Test cases
const testCases = [
  { userId: 'user123' },
  { userId: 'user456' },
  { userId: 'user789' },
  { userId: 'anonymous' },
];

console.log('🧪 A/B Testing Validation');
console.log('==========================');

// Test 1: Consistent assignment
console.log('\n1. Testing consistent assignment:');
testCases.forEach(({ userId }) => {
  const group = assignTestGroup(userId);
  const isConsistent = assignTestGroup(userId) === group;
  console.log(`   User: ${userId} → Group: ${group} ✓ ${isConsistent ? 'Consistent' : 'Inconsistent'}`);
});

// Test 2: Group distribution
console.log('\n2. Testing group distribution:');
const distribution = { A: 0, B: 0, C: 0 };
for (let i = 0; i < 1000; i++) {
  const group = assignTestGroup(`user${i}`);
  distribution[group]++;
}
console.log(`   Group A: ${distribution.A} users (${(distribution.A/10).toFixed(1)}%)`);
console.log(`   Group B: ${distribution.B} users (${(distribution.B/10).toFixed(1)}%)`);
console.log(`   Group C: ${distribution.C} users (${(distribution.C/10).toFixed(1)}%)`);

console.log('\n✅ A/B Testing validation completed!');
console.log('\nNext steps:');
console.log('1. Deploy Edge Function with A/B testing support');
console.log('2. Run database migration: supabase/migrations/ab_test_metrics.sql');
console.log('3. Test with real user queries');
console.log('4. Monitor results in Supabase dashboard');
console.log('5. Use analytics queries: supabase/analytics/ab_test_dashboard.sql');