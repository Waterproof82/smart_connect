/**
 * Menu Data Source Interface
 * @module features/qribar/data/datasources
 * 
 * Abstraction for data retrieval (can be API, Mock, Local Storage, etc.)
 */

import { MenuItemProps } from '../../domain/entities/MenuItem';
import { RestaurantProps } from '../../domain/entities/Restaurant';

export interface IMenuDataSource {
  /**
   * Fetch raw menu items data
   */
  fetchMenuItems(): Promise<MenuItemProps[]>;

  /**
   * Fetch raw restaurant data
   */
  fetchRestaurant(): Promise<RestaurantProps>;
}
