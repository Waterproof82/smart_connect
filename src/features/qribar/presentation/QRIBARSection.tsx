/**
 * QRIBARSection Component
 * @module features/qribar/presentation
 * 
 * Container component with Dependency Injection
 * Follows Clean Architecture + SOLID principles
 */

import React, { useRef } from 'react';
import { MenuPhone, MenuInfo } from './components';
import { useQRIBAR, useIntersectionObserver } from './hooks';
import { GetMenuItems } from '../domain/usecases/GetMenuItems';
import { GetRestaurant } from '../domain/usecases/GetRestaurant';
import { MenuRepositoryImpl } from '../data/repositories/MenuRepositoryImpl';
import { MockMenuDataSource } from '../data/datasources/MockMenuDataSource';

// Dependency Injection Setup
const dataSource = new MockMenuDataSource();
const repository = new MenuRepositoryImpl(dataSource);
const getMenuItems = new GetMenuItems(repository);
const getRestaurant = new GetRestaurant(repository);

export const QRIBARSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef);
  
  // Execute business logic through use cases
  const { menuItems, restaurant, isLoading, error } = useQRIBAR(
    getMenuItems,
    getRestaurant
  );

  if (error) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="text-red-500">Error loading menu: {error}</p>
      </div>
    );
  }

  if (isLoading || !restaurant) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="text-gray-400">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center" ref={sectionRef}>
      <div className="order-2 lg:order-1">
        <MenuPhone 
          restaurant={restaurant}
          menuItems={menuItems}
          isVisible={isVisible}
        />
      </div>

      <div className="order-1 lg:order-2">
        <MenuInfo isVisible={isVisible} />
      </div>
    </div>
  );
};
