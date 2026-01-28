/**
 * Menu Repository Interface
 * @module features/qribar/domain/repositories
 * 
 * Follows DIP: Domain defines the contract, Data layer implements it
 */

import { MenuItem } from '../entities/MenuItem';
import { Restaurant } from '../entities/Restaurant';

export interface IMenuRepository {
  /**
   * Get all menu items for a restaurant
   * @returns Promise with array of MenuItem entities
   */
  getMenuItems(): Promise<MenuItem[]>;

  /**
   * Get restaurant information
   * @returns Promise with Restaurant entity
   */
  getRestaurant(): Promise<Restaurant>;
}
