/**
 * Get Restaurant Use Case
 * @module features/qribar/domain/usecases
 * 
 * Business logic for retrieving restaurant information
 */

import { Restaurant } from '../entities/Restaurant';
import { IMenuRepository } from '../repositories/IMenuRepository';
import { ConsoleLogger } from '@core/domain/usecases';
import { NotFoundError } from '@core/domain/entities/Errors';

const logger = new ConsoleLogger('[QRIBAR]');

export class GetRestaurant {
  constructor(private readonly menuRepository: IMenuRepository) {}

  async execute(): Promise<Restaurant> {
    try {
      return await this.menuRepository.getRestaurant();
    } catch (error) {
      logger.error('Error fetching restaurant', error);
      throw new NotFoundError('Restaurant information');
    }
  }
}
