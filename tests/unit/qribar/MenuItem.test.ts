/**
 * MenuItem Entity Tests
 * @module tests/unit/qribar
 */

import { MenuItem } from '../../../src/features/qribar/domain/entities/MenuItem';

describe('MenuItem Entity', () => {
  describe('create()', () => {
    it('should create a valid MenuItem with all properties', () => {
      const menuItem = MenuItem.create({
        id: '1',
        name: 'Risotto de Setas',
        description: 'Trufa negra, parmesano',
        price: 24,
        category: 'Entrantes',
        imageUrl: 'https://example.com/image.jpg'
      });

      expect(menuItem.id).toBe('1');
      expect(menuItem.name).toBe('Risotto de Setas');
      expect(menuItem.description).toBe('Trufa negra, parmesano');
      expect(menuItem.price).toBe(24);
      expect(menuItem.category).toBe('Entrantes');
      expect(menuItem.imageUrl).toBe('https://example.com/image.jpg');
    });

    it('should create MenuItem with optional fields as defaults', () => {
      const menuItem = MenuItem.create({
        id: '1',
        name: 'Test Item',
        price: 10
      });

      expect(menuItem.description).toBe('');
      expect(menuItem.category).toBe('general');
      expect(menuItem.imageUrl).toBe('');
    });

    it('should trim whitespace from name and description', () => {
      const menuItem = MenuItem.create({
        id: '1',
        name: '  Risotto  ',
        description: '  Delicious  ',
        price: 24
      });

      expect(menuItem.name).toBe('Risotto');
      expect(menuItem.description).toBe('Delicious');
    });

    it('should throw error when name is empty', () => {
      expect(() => {
        MenuItem.create({
          id: '1',
          name: '',
          price: 10
        });
      }).toThrow('MenuItem name cannot be empty');
    });

    it('should throw error when name is only whitespace', () => {
      expect(() => {
        MenuItem.create({
          id: '1',
          name: '   ',
          price: 10
        });
      }).toThrow('MenuItem name cannot be empty');
    });

    it('should throw error when price is zero', () => {
      expect(() => {
        MenuItem.create({
          id: '1',
          name: 'Test',
          price: 0
        });
      }).toThrow('MenuItem price must be positive');
    });

    it('should throw error when price is negative', () => {
      expect(() => {
        MenuItem.create({
          id: '1',
          name: 'Test',
          price: -10
        });
      }).toThrow('MenuItem price must be positive');
    });
  });

  describe('formattedPrice', () => {
    it('should format price with 2 decimals and euro symbol', () => {
      const menuItem = MenuItem.create({
        id: '1',
        name: 'Test',
        price: 24
      });

      expect(menuItem.formattedPrice).toBe('24.00€');
    });

    it('should format price with decimals correctly', () => {
      const menuItem = MenuItem.create({
        id: '1',
        name: 'Test',
        price: 24.50
      });

      expect(menuItem.formattedPrice).toBe('24.50€');
    });
  });

  describe('hasImage()', () => {
    it('should return true when imageUrl is present', () => {
      const menuItem = MenuItem.create({
        id: '1',
        name: 'Test',
        price: 10,
        imageUrl: 'https://example.com/image.jpg'
      });

      expect(menuItem.hasImage()).toBe(true);
    });

    it('should return false when imageUrl is empty', () => {
      const menuItem = MenuItem.create({
        id: '1',
        name: 'Test',
        price: 10
      });

      expect(menuItem.hasImage()).toBe(false);
    });
  });
});
