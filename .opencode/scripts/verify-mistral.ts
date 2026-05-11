#!/usr/bin/env ts-node
// verify-mistral.ts
// Script para verificar el estado de los modelos y generar un reporte de salud.

import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';

// Configuración para módulos ES
const __dirname = process.argv[1]
    ? dirname(process.argv[1])
    : process.cwd();

// Tipos para el reporte de salud
interface ModelHealth {
    model: string;
    status: 'healthy' | 'degraded' | 'critical';
    error?: string;
    lastChecked: string;
}

interface HealthSummary {
    total: number;
    critical: number;
    degraded: number;
    healthy: number;
}

interface HealthReport {
    summary: HealthSummary;
    models: ModelHealth[];
    lastUpdated: string;
}

// Función para simular la verificación de un modelo
function checkModel(modelName: string): ModelHealth {
    let status: ModelHealth['status'] = 'healthy', error = '';
    
    // Simulación de estados de modelos
    if (modelName.includes('inexistente')) {
        status = 'critical';
        error = 'Modelo no encontrado en el perfil';
    } else if (modelName.includes('degradado')) {
        status = 'degraded';
        error = 'Modelo con rendimiento reducido';
    }
    
    return {
        model: modelName,
        status,
        error,
        lastChecked: new Date().toISOString(),
    };
}

// Función para cargar el perfil de modelos
async function loadProfile(): Promise<Record<string, string>> {
    const profilePath = join(__dirname, '..', '..', '.opencode', 'sdd-profile-free.json');
    try {
        const profileContent = await fs.readFile(profilePath, 'utf-8');
        return JSON.parse(profileContent);
    } catch (err) {
        throw new Error(`Error al cargar el perfil: ${err instanceof Error ? err.message : err}`);
    }
}

// Función para generar el reporte de salud
async function generateHealthReport(profile: Record<string, string>): Promise<HealthReport> {
    const models: ModelHealth[] = [];
    const summary: HealthSummary = { total: 0, critical: 0, degraded: 0, healthy: 0 };
    
    for (const [modelName] of Object.entries(profile)) {
        const modelHealth = checkModel(modelName);
        models.push(modelHealth);
        
        summary.total++;
        if (modelHealth.status === 'critical') summary.critical++;
        else if (modelHealth.status === 'degraded') summary.degraded++;
        else summary.healthy++;
    }
    
    return {
        summary,
        models,
        lastUpdated: new Date().toISOString(),
    };
}

// Función principal
async function main() {
    try {
        console.warn('🔍 Verificando modelos...');
        
        const profile = await loadProfile();
        console.warn(`📋 Perfil cargado con ${Object.keys(profile).length} modelos.`);
        
        const report = await generateHealthReport(profile);
        const healthPath = join(__dirname, '..', '..', '.opencode', 'models', 'health.json');
        
        await fs.writeFile(healthPath, JSON.stringify(report, null, 2), 'utf-8');
        console.warn(`
📝 Reporte de salud guardado en ${healthPath}`);
        
        console.warn(`
📊 Resumen de salud:`);
        console.warn(`Total: ${report.summary.total}`);
        console.warn(`Críticos: ${report.summary.critical}`);
        console.warn(`Degradados: ${report.summary.degraded}`);
        console.warn(`Sanos: ${report.summary.healthy}`);
        
        const criticalModels = report.models.filter(m => m.status === 'critical');
        if (criticalModels.length > 0) {
            console.warn(`
⚠️ Modelos críticos:`);
            criticalModels.forEach(model => {
                console.warn(`- ${model.model}: ${model.error}`);
            });
        }
    } catch (err) {
        console.error(`
❌ Error al verificar modelos: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
    }
}

// Ejecutar
main();