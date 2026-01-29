/**
 * useQRIBAR Hook
 * @module features/qribar/presentation/hooks
 * 
 * Custom hook that encapsulates QRIBAR business logic
 * Follows SRP: Single responsibility - manage QRIBAR state
 */

import { useState, useEffect } from 'react';
import { MenuItem } from '../../domain/entities/MenuItem';
import { Restaurant } from '../../domain/entities/Restaurant';
import { GetMenuItems } from '../../domain/usecases/GetMenuItems';
import { GetRestaurant } from '../../domain/usecases/GetRestaurant';

interface UseQRIBARResult {
  menuItems: MenuItem[];
  restaurant: Restaurant | null;
  isLoading: boolean;
  error: string | null;
}

export const useQRIBAR = (
  getMenuItems: GetMenuItems,
  getRestaurant: GetRestaurant
): UseQRIBARResult => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Execute use cases
        const [items, restaurantData] = await Promise.all([
          getMenuItems.execute(),
          getRestaurant.execute()
        ]);

        setMenuItems(items);
        setRestaurant(restaurantData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('useQRIBAR: Error loading data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getMenuItems, getRestaurant]);

  return {
    menuItems,
    restaurant,
    isLoading,
    error
  };
};
