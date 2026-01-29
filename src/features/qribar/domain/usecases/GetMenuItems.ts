/**
 * Get Menu Items Use Case
 * @module features/qribar/domain/usecases
 * 
 * Business logic for retrieving menu items
 * Follows SRP: Single responsibility - get menu items
 */

import { MenuItem } from '../entities/MenuItem';
import { IMenuRepository } from '../repositories/IMenuRepository';
import { ConsoleLogger } from '@core/domain/usecases';

const logger = new ConsoleLogger('[QRIBAR]');

export class GetMenuItems {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(): Promise<MenuItem[]> {
    try {
      const menuItems = await this.menuRepository.getMenuItems();
      
      // Business rule: Filter out invalid items (defensive programming)
      return menuItems.filter(item => item.price > 0);
    } catch (error) {
      logger.error('Error fetching menu items', error);
      throw new Error('Failed to load menu items');
    }
  }
}
