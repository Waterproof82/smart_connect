export interface SettingsType {
  id: string;
  name: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
  rating?: number;
  products?: any[];
  stats?: any;
  howItWorks?: any[];
  features?: any[];
  reviews?: any[];
  faq?: any[];
  cta?: string;
  trustBadges?: any[];
}

export interface NavbarProps {
  logo: string;
  navItems: Array<{ id: string; name: string; href?: string }>;
}

export interface FooterProps {
  logo: string;
  navItems: Array<{ id: string; name: string; href?: string }>;
  socialLinks: Array<{ id: string; name: string; href?: string }>;
}

export interface StarRatingProps {
  rating: number;
}

export interface ProductGalleryProps {
  products: Array<{ id: string; name: string; description?: string }>;
}

export interface StatsBannerProps {
  stats: { [key: string]: number };
}

export interface HowItWorksProps {
  steps: Array<{ id: string; title: string; description: string }>;
}

export interface FeaturesProps {
  features: Array<{ id: string; title: string; description: string }>;
}

export interface SocialProofProps {
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    author: string;
  }>;
}

export interface FAQProps {
  questions: Array<{ id: string; question: string; answer: string }>;
}

export interface CTASectionProps {
  callToAction: string;
}
