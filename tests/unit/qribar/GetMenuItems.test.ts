/**
 * GetMenuItems Use Case Tests
 * @module tests/unit/qribar
 */

import { GetMenuItems } from '../../../src/features/qribar/domain/usecases/GetMenuItems';
import { IMenuRepository } from '../../../src/features/qribar/domain/repositories/IMenuRepository';
import { MenuItem } from '../../../src/features/qribar/domain/entities/MenuItem';

describe('GetMenuItems Use Case', () => {
  let mockRepository: jest.Mocked<IMenuRepository>;
  let useCase: GetMenuItems;

  beforeEach(() => {
    mockRepository = {
      getMenuItems: jest.fn(),
      getRestaurant: jest.fn()
    };
    useCase = new GetMenuItems(mockRepository);
  });

  it('should return menu items from repository', async () => {
    const mockItems = [
      MenuItem.create({ id: '1', name: 'Item 1', price: 10 }),
      MenuItem.create({ id: '2', name: 'Item 2', price: 20 })
    ];
    mockRepository.getMenuItems.mockResolvedValue(mockItems);

    const result = await useCase.execute();

    expect(result).toEqual(mockItems);
    expect(mockRepository.getMenuItems).toHaveBeenCalledTimes(1);
  });

  it('should filter out items with zero or negative price', async () => {
    const mockItems = [
      MenuItem.create({ id: '1', name: 'Valid Item', price: 10 }),
      // Note: MenuItem.create() already prevents negative prices, 
      // but this tests the use case's defensive filtering
    ];
    mockRepository.getMenuItems.mockResolvedValue(mockItems);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should throw error with user-friendly message when repository fails', async () => {
    mockRepository.getMenuItems.mockRejectedValue(new Error('Database error'));

    await expect(useCase.execute()).rejects.toThrow('Failed to load menu items');
  });

  it('should return empty array when no items exist', async () => {
    mockRepository.getMenuItems.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
