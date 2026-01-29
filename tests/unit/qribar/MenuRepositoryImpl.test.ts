/**
 * MenuRepositoryImpl Tests
 * @module tests/unit/qribar
 */

import { MenuRepositoryImpl } from '../../../src/features/qribar/data/repositories/MenuRepositoryImpl';
import { IMenuDataSource } from '../../../src/features/qribar/data/datasources/IMenuDataSource';
import { MenuItemProps } from '../../../src/features/qribar/domain/entities/MenuItem';
import { RestaurantProps } from '../../../src/features/qribar/domain/entities/Restaurant';

describe('MenuRepositoryImpl', () => {
  let mockDataSource: jest.Mocked<IMenuDataSource>;
  let repository: MenuRepositoryImpl;

  beforeEach(() => {
    mockDataSource = {
      fetchMenuItems: jest.fn(),
      fetchRestaurant: jest.fn()
    };
    repository = new MenuRepositoryImpl(mockDataSource);
  });

  describe('getMenuItems()', () => {
    it('should return array of MenuItem entities', async () => {
      const mockData: MenuItemProps[] = [
        { id: '1', name: 'Item 1', price: 10 },
        { id: '2', name: 'Item 2', price: 20 }
      ];
      mockDataSource.fetchMenuItems.mockResolvedValue(mockData);

      const result = await repository.getMenuItems();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[0].name).toBe('Item 1');
      expect(result[1].id).toBe('2');
      expect(mockDataSource.fetchMenuItems).toHaveBeenCalledTimes(1);
    });

    it('should transform raw data to MenuItem entities', async () => {
      const mockData: MenuItemProps[] = [
        { id: '1', name: '  Test  ', price: 10, description: '  Desc  ' }
      ];
      mockDataSource.fetchMenuItems.mockResolvedValue(mockData);

      const result = await repository.getMenuItems();

      expect(result[0].name).toBe('Test');
      expect(result[0].description).toBe('Desc');
    });

    it('should throw error when data source fails', async () => {
      mockDataSource.fetchMenuItems.mockRejectedValue(new Error('Network error'));

      await expect(repository.getMenuItems()).rejects.toThrow('Network error');
    });
  });

  describe('getRestaurant()', () => {
    it('should return Restaurant entity', async () => {
      const mockData: RestaurantProps = {
        id: 'rest-1',
        name: 'Le Gourmet',
        description: 'Fine Dining',
        imageUrl: 'https://example.com/image.jpg'
      };
      mockDataSource.fetchRestaurant.mockResolvedValue(mockData);

      const result = await repository.getRestaurant();

      expect(result.id).toBe('rest-1');
      expect(result.name).toBe('Le Gourmet');
      expect(result.description).toBe('Fine Dining');
      expect(mockDataSource.fetchRestaurant).toHaveBeenCalledTimes(1);
    });

    it('should transform raw data to Restaurant entity', async () => {
      const mockData: RestaurantProps = {
        id: '1',
        name: '  Test Restaurant  '
      };
      mockDataSource.fetchRestaurant.mockResolvedValue(mockData);

      const result = await repository.getRestaurant();

      expect(result.name).toBe('Test Restaurant');
    });

    it('should throw error when data source fails', async () => {
      mockDataSource.fetchRestaurant.mockRejectedValue(new Error('Network error'));

      await expect(repository.getRestaurant()).rejects.toThrow('Network error');
    });
  });
});
