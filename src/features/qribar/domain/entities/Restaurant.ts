/**
 * Restaurant Entity
 * @module features/qribar/domain/entities
 */

import { ValidationError } from '@core/domain/entities/Errors';

export interface RestaurantProps {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

export class Restaurant {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly imageUrl: string
  ) {}

  static create(props: RestaurantProps): Restaurant {
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('Restaurant name cannot be empty', 'name');
    }

    return new Restaurant(
      props.id,
      props.name.trim(),
      props.description?.trim() || '',
      props.imageUrl || ''
    );
  }

  hasImage(): boolean {
    return this.imageUrl.length > 0;
  }
}
