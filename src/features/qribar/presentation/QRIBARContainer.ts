/**
 * Dependency Injection Container for QRIBAR Feature
 * 
 * This container follows Clean Architecture principles by wiring
 * dependencies from outer layers (infrastructure) to inner layers (domain).
 * 
 * Dependency Flow: Data Sources → Repositories → Use Cases → UI Components
 */

import { MockMenuDataSource } from '../data/datasources/MockMenuDataSource';
import { MenuRepositoryImpl } from '../data/repositories/MenuRepositoryImpl';
import { GetMenuItems } from '../domain/usecases/GetMenuItems';
import { GetRestaurant } from '../domain/usecases/GetRestaurant';

/**
 * Container for all QRIBAR feature dependencies
 */
export class QRIBARContainer {
  // Use Cases (exposed to UI layer)
  public readonly getMenuItems: GetMenuItems;
  public readonly getRestaurant: GetRestaurant;

  constructor() {
    // ===================================
    // 1. DATA LAYER (Data Source)
    // ===================================
    const dataSource = new MockMenuDataSource();

    // ===================================
    // 2. DATA LAYER (Repository Implementation)
    // ===================================
    const repository = new MenuRepositoryImpl(dataSource);

    // ===================================
    // 3. DOMAIN LAYER (Use Cases)
    // ===================================
    this.getMenuItems = new GetMenuItems(repository);
    this.getRestaurant = new GetRestaurant(repository);
  }
}

/**
 * Singleton instance for application-wide use
 */
let containerInstance: QRIBARContainer | null = null;

/**
 * Get or create the QRIBAR container singleton
 */
export function getQRIBARContainer(): QRIBARContainer {
  if (!containerInstance) {
    containerInstance = new QRIBARContainer();
  }
  return containerInstance;
}

/**
 * Reset the container (useful for testing)
 */
export function resetQRIBARContainer(): void {
  containerInstance = null;
}
