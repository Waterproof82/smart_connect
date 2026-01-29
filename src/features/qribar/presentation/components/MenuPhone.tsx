/**
 * MenuPhone Component
 * @module features/qribar/presentation/components
 * 
 * Pure presentational component - displays menu in phone mockup
 * Follows SRP: Single responsibility - render phone UI
 */

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { MenuItem } from '../../domain/entities/MenuItem';
import { Restaurant } from '../../domain/entities/Restaurant';

interface MenuPhoneProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  isVisible: boolean;
}

export const MenuPhone: React.FC<MenuPhoneProps> = ({ 
  restaurant, 
  menuItems, 
  isVisible 
}) => {
  return (
    <div className={`flex justify-center transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${
      isVisible ? 'opacity-100 translate-x-0 blur-0 rotate-0' : 'opacity-0 -translate-x-20 blur-md -rotate-6'
    }`}>
      <div className="relative w-full max-w-[320px] aspect-[9/19] bg-[#0c0c0c] rounded-[3rem] border-8 border-[#1a1a1a] shadow-2xl overflow-hidden group">
        {/* Header with restaurant info */}
        <div className="absolute top-0 w-full h-40 overflow-hidden">
          {restaurant.hasImage() && (
            <>
              <img 
                src={restaurant.imageUrl} 
                alt={restaurant.name} 
                className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent"></div>
            </>
          )}
          <div className="absolute bottom-4 left-6">
            <h4 className="text-xl font-bold">{restaurant.name}</h4>
            {restaurant.description && (
              <p className="text-[10px] text-gray-400">{restaurant.description}</p>
            )}
          </div>
        </div>

        {/* Menu items */}
        <div className="mt-44 px-6 space-y-4">
          {menuItems.map((item, i) => (
            <div 
              key={item.id}
              className="flex justify-between items-center py-3 border-b border-white/5 transition-all duration-700"
              style={{ 
                transitionDelay: `${isVisible ? (800 + (i * 100)) : 0}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(10px)'
              }}
            >
              <div>
                <h5 className="text-sm font-semibold">{item.name}</h5>
                {item.description && (
                  <p className="text-[10px] text-gray-500">{item.description}</p>
                )}
              </div>
              <span className="text-amber-500 font-bold text-sm">{item.formattedPrice}</span>
            </div>
          ))}
        </div>

        {/* Cart button */}
        <div className={`absolute bottom-8 left-6 right-6 transition-all duration-700 delay-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <button className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm hover:bg-gray-200 transition-colors">
            <ShoppingCart className="w-4 h-4" />
            Ver Carrito ({menuItems.length})
          </button>
        </div>
      </div>
    </div>
  );
};
