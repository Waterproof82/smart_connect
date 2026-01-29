/**
 * Menu Repository Implementation
 * @module features/qribar/data/repositories
 * 
 * Implements IMenuRepository contract from Domain layer
 * Follows DIP: Depends on abstractions (IMenuDataSource)
 */

import { IMenuRepository } from '../../domain/repositories/IMenuRepository';
import { MenuItem } from '../../domain/entities/MenuItem';
import { Restaurant } from '../../domain/entities/Restaurant';
import { IMenuDataSource } from '../datasources/IMenuDataSource';
import { ConsoleLogger } from '@core/domain/usecases';

const logger = new ConsoleLogger('[MenuRepository]');

export class MenuRepositoryImpl implements IMenuRepository {
  constructor(private readonly dataSource: IMenuDataSource) {}

  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const rawData = await this.dataSource.fetchMenuItems();
      
      // Transform raw data to domain entities
      return rawData.map(item => MenuItem.create(item));
    } catch (error) {
      logger.error('Error fetching menu items', error);
      throw error;
    }
  }

  async getRestaurant(): Promise<Restaurant> {
    try {
      const rawData = await this.dataSource.fetchRestaurant();
      
      // Transform raw data to domain entity
      return Restaurant.create(rawData);
    } catch (error) {
      logger.error('Error fetching restaurant', error);
      throw error;
    }
  }
}
