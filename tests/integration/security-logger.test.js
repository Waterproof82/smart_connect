import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase - USAR VARIABLES DE ENTORNO
// NO hardcodear claves en archivos versionados
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key-here';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Función para loguear eventos de seguridad
async function logSecurityEvent(eventType, details, severity = 'WARNING') {
    try {
        const { data, error } = await supabase
            .from('security_logs')
            .insert({
                event_type: eventType,
                details: details,
                severity: severity,
                ip_address: '127.0.0.1',
                user_agent: 'Node.js Automated Test Script',
                metadata: { test: true, timestamp: new Date().toISOString() }
            })
            .select();

        if (error) {
            console.error('❌ Error logging event:', error);
            return { success: false, error };
        }
        
        console.log(`✅ ${severity} event logged: ${eventType}`);
        return { success: true, data };
    } catch (err) {
        console.error('❌ Exception:', err);
        return { success: false, error: err };
    }
}

// Función para obtener estadísticas
async function getStats() {
    try {
        const { data, error } = await supabase
            .from('security_logs')
            .select('severity', { count: 'exact' });

        if (error) {
            console.error('❌ Error getting stats:', error);
            return null;
        }

        const stats = {
            total: data.length,
            critical: data.filter(log => log.severity === 'CRITICAL').length,
            warning: data.filter(log => log.severity === 'WARNING').length
        };

        return stats;
    } catch (err) {
        console.error('❌ Exception getting stats:', err);
        return null;
    }
}

// TEST 1: XSS Injection Detection
async function testXSSInjection() {
    console.log('\n🔴 TEST 1: XSS Injection Detection');
    console.log('━'.repeat(50));
    
    const xssPayloads = [
        '<script>alert("XSS")</script>',
        'javascript:alert(1)',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>'
    ];

    for (const payload of xssPayloads) {
        await logSecurityEvent(
            'XSS_ATTEMPT',
            `Detected malicious input: ${payload.substring(0, 50)}`,
            'CRITICAL'
        );
    }
}

// TEST 2: Rate Limiting
async function testRateLimiting() {
    console.log('\n🟡 TEST 2: Rate Limiting Enforcement');
    console.log('━'.repeat(50));
    
    // Simular 7 intentos (límite es 5)
    for (let i = 1; i <= 7; i++) {
        if (i > 5) {
            await logSecurityEvent(
                'RATE_LIMIT_EXCEEDED',
                `User exceeded rate limit: attempt ${i}/5`,
                'WARNING'
            );
        } else {
            console.log(`📊 Request ${i}/5 - OK`);
        }
    }
}

// TEST 3: Authentication Failure
async function testAuthFailure() {
    console.log('\n🟡 TEST 3: Authentication Failure Tracking');
    console.log('━'.repeat(50));
    
    const failedAttempts = [
        { user: 'admin@test.com', reason: 'Invalid password' },
        { user: 'user@test.com', reason: 'Account not found' },
        { user: 'test@test.com', reason: 'Too many attempts' }
    ];

    for (const attempt of failedAttempts) {
        await logSecurityEvent(
            'AUTH_FAILURE',
            `Failed login for ${attempt.user}: ${attempt.reason}`,
            'WARNING'
        );
    }
}

// Función principal
async function runTests() {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║   🔒 SECURITY LOGGER - AUTOMATED TESTS       ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    console.log('📊 Initial Statistics:');
    const initialStats = await getStats();
    if (initialStats) {
        console.log(`   Total Events: ${initialStats.total}`);
        console.log(`   Critical: ${initialStats.critical}`);
        console.log(`   Warning: ${initialStats.warning}`);
    }

    // Ejecutar tests
    await testXSSInjection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testRateLimiting();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testAuthFailure();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Estadísticas finales
    console.log('\n📊 Final Statistics:');
    const finalStats = await getStats();
    if (finalStats) {
        console.log(`   Total Events: ${finalStats.total}`);
        console.log(`   Critical: ${finalStats.critical}`);
        console.log(`   Warning: ${finalStats.warning}`);
        
        const newEvents = finalStats.total - (initialStats?.total || 0);
        console.log(`\n✨ New Events Created: ${newEvents}`);
    }

    console.log('\n✅ All tests completed!');
    console.log('🔍 Check Supabase Dashboard → security_logs to verify\n');
}

// Ejecutar
runTests().catch(console.error);
