/**
 * useIntersectionObserver Hook
 * @module shared/hooks
 *
 * Reusable hook for scroll animations
 * Follows SRP: Single responsibility - handle intersection observation
 */

import { useEffect, useState, useRef, RefObject } from 'react';

export const useIntersectionObserver = (
  ref: RefObject<HTMLElement | null>,
  options?: IntersectionObserverInit
): boolean => {
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [isVisible, setIsVisible] = useState(prefersReducedMotion);
  const optionsRef = useRef(options);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, ...optionsRef.current }
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
  }, [ref]);

  return isVisible;
};
