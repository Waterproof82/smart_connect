/**
 * useIntersectionObserver Hook
 * @module features/qribar/presentation/hooks
 * 
 * Reusable hook for scroll animations
 * Follows SRP: Single responsibility - handle intersection observation
 */

import { useEffect, useState, RefObject } from 'react';

export const useIntersectionObserver = (
  ref: RefObject<HTMLElement>,
  options?: IntersectionObserverInit
): boolean => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, ...options }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return isVisible;
};
