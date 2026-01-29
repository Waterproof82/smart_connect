/**
 * GetRestaurant Use Case Tests
 * @module tests/unit/qribar
 */

import { GetRestaurant } from '../../../src/features/qribar/domain/usecases/GetRestaurant';
import { IMenuRepository } from '../../../src/features/qribar/domain/repositories/IMenuRepository';
import { Restaurant } from '../../../src/features/qribar/domain/entities/Restaurant';

describe('GetRestaurant Use Case', () => {
  let mockRepository: jest.Mocked<IMenuRepository>;
  let useCase: GetRestaurant;

  beforeEach(() => {
    mockRepository = {
      getMenuItems: jest.fn(),
      getRestaurant: jest.fn()
    };
    useCase = new GetRestaurant(mockRepository);
  });

  it('should return restaurant from repository', async () => {
    const mockRestaurant = Restaurant.create({
      id: '1',
      name: 'Le Gourmet',
      description: 'Fine Dining'
    });
    mockRepository.getRestaurant.mockResolvedValue(mockRestaurant);

    const result = await useCase.execute();

    expect(result).toEqual(mockRestaurant);
    expect(mockRepository.getRestaurant).toHaveBeenCalledTimes(1);
  });

  it('should throw error with user-friendly message when repository fails', async () => {
    mockRepository.getRestaurant.mockRejectedValue(new Error('Database error'));

    await expect(useCase.execute()).rejects.toThrow('Failed to load restaurant information');
  });
});
