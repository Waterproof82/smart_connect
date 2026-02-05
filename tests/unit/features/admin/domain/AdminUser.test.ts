/**
 * AdminUser Entity Tests
 * 
 * Clean Architecture: Domain Layer Tests
 */

import { AdminUser } from '@/features/admin/domain/entities/AdminUser';

describe('AdminUser Entity', () => {
  describe('create', () => {
    it('should create a valid admin user', () => {
      const user = AdminUser.create({
        id: '123',
        email: 'admin@test.com',
        role: 'admin',
        createdAt: new Date(),
      });

      expect(user.id).toBe('123');
      expect(user.email).toBe('admin@test.com');
      expect(user.role).toBe('admin');
    });

    it('should create a valid super admin user', () => {
      const user = AdminUser.create({
        id: '456',
        email: 'superadmin@test.com',
        role: 'super_admin',
        createdAt: new Date(),
      });

      expect(user.role).toBe('super_admin');
    });

    it('should throw error for invalid email', () => {
      expect(() => {
        AdminUser.create({
          id: '123',
          email: 'invalid-email',
          role: 'admin',
          createdAt: new Date(),
        });
      }).toThrow('Invalid email format');
    });

    it('should throw error for invalid role', () => {
      expect(() => {
        AdminUser.create({
          id: '123',
          email: 'admin@test.com',
          role: 'user' as 'admin',
          createdAt: new Date(),
        });
      }).toThrow('Invalid role');
    });
  });

  describe('isSuperAdmin', () => {
    it('should return true for super_admin role', () => {
      const user = AdminUser.create({
        id: '123',
        email: 'superadmin@test.com',
        role: 'super_admin',
        createdAt: new Date(),
      });

      expect(user.isSuperAdmin()).toBe(true);
    });

    it('should return false for admin role', () => {
      const user = AdminUser.create({
        id: '123',
        email: 'admin@test.com',
        role: 'admin',
        createdAt: new Date(),
      });

      expect(user.isSuperAdmin()).toBe(false);
    });
  });

  describe('canPerform', () => {
    it('super_admin should be able to perform all actions', () => {
      const user = AdminUser.create({
        id: '123',
        email: 'superadmin@test.com',
        role: 'super_admin',
        createdAt: new Date(),
      });

      expect(user.canPerform('read')).toBe(true);
      expect(user.canPerform('write')).toBe(true);
      expect(user.canPerform('delete')).toBe(true);
    });

    it('admin should only be able to read', () => {
      const user = AdminUser.create({
        id: '123',
        email: 'admin@test.com',
        role: 'admin',
        createdAt: new Date(),
      });

      expect(user.canPerform('read')).toBe(true);
      expect(user.canPerform('write')).toBe(false);
      expect(user.canPerform('delete')).toBe(false);
    });
  });
});
// Deleted by agent: unnecessary test file
