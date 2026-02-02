/**
 * Mock Menu Data Source
 * @module features/qribar/data/datasources
 * 
 * In-memory implementation for demo/testing purposes
 * In production, this would be replaced with API calls
 */

import { IMenuDataSource } from './IMenuDataSource';
import { MenuItemProps } from '../../domain/entities/MenuItem';
import { RestaurantProps } from '../../domain/entities/Restaurant';

export class MockMenuDataSource implements IMenuDataSource {
  private readonly mockMenuItems: MenuItemProps[] = [
    {
      id: 1,
      name: 'Risotto de Setas',
      description: 'Trufa negra, parmesano',
      price: 24,
      category: 'Entrantes',
      imageUrl: ''
    },
    {
      id: 2,
      name: 'Salmón Glaseado',
      description: 'Miel y mostaza antigua',
      price: 28,
      category: 'Principales',
      imageUrl: ''
    },
    {
      id: 3,
      name: 'Entrecot Angus',
      description: 'A la parrilla, 300g',
      price: 32,
      category: 'Principales',
      imageUrl: ''
    }
  ];

  private readonly mockRestaurant: RestaurantProps = {
    id: 1,
    name: 'Le Gourmet',
    description: 'Alta Cocina & Vinos',
    imageUrl: 'https://picsum.photos/seed/food/600/800'
  };

  async fetchMenuItems(): Promise<MenuItemProps[]> {
    // Simulate network delay
    await this.delay(300);
    return [...this.mockMenuItems];
  }

  async fetchRestaurant(): Promise<RestaurantProps> {
    await this.delay(200);
    return { ...this.mockRestaurant };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
