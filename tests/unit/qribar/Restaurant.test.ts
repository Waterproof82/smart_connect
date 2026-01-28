/**
 * Restaurant Entity Tests
 * @module tests/unit/qribar
 */

import { Restaurant } from '../../../src/features/qribar/domain/entities/Restaurant';

describe('Restaurant Entity', () => {
  describe('create()', () => {
    it('should create a valid Restaurant with all properties', () => {
      const restaurant = Restaurant.create({
        id: '1',
        name: 'Le Gourmet',
        description: 'Alta Cocina & Vinos',
        imageUrl: 'https://example.com/restaurant.jpg'
      });

      expect(restaurant.id).toBe('1');
      expect(restaurant.name).toBe('Le Gourmet');
      expect(restaurant.description).toBe('Alta Cocina & Vinos');
      expect(restaurant.imageUrl).toBe('https://example.com/restaurant.jpg');
    });

    it('should create Restaurant with optional fields as defaults', () => {
      const restaurant = Restaurant.create({
        id: '1',
        name: 'Test Restaurant'
      });

      expect(restaurant.description).toBe('');
      expect(restaurant.imageUrl).toBe('');
    });

    it('should trim whitespace from name and description', () => {
      const restaurant = Restaurant.create({
        id: '1',
        name: '  Le Gourmet  ',
        description: '  Fine Dining  '
      });

      expect(restaurant.name).toBe('Le Gourmet');
      expect(restaurant.description).toBe('Fine Dining');
    });

    it('should throw error when name is empty', () => {
      expect(() => {
        Restaurant.create({
          id: '1',
          name: ''
        });
      }).toThrow('Restaurant name cannot be empty');
    });

    it('should throw error when name is only whitespace', () => {
      expect(() => {
        Restaurant.create({
          id: '1',
          name: '   '
        });
      }).toThrow('Restaurant name cannot be empty');
    });
  });

  describe('hasImage()', () => {
    it('should return true when imageUrl is present', () => {
      const restaurant = Restaurant.create({
        id: '1',
        name: 'Test',
        imageUrl: 'https://example.com/image.jpg'
      });

      expect(restaurant.hasImage()).toBe(true);
    });

    it('should return false when imageUrl is empty', () => {
      const restaurant = Restaurant.create({
        id: '1',
        name: 'Test'
      });

      expect(restaurant.hasImage()).toBe(false);
    });
  });
});
