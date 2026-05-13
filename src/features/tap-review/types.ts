export interface SettingsType {
  id: string;
  name: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
  rating?: number;
  products?: Product[];
  stats?: Stats;
  howItWorks?: HowItWorksStep[];
  features?: Feature[];
  reviews?: Review[];
  faq?: FAQItem[];
  cta?: string;
  trustBadges?: TrustBadge[];
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

interface Stats {
  totalReviews?: number;
  averageRating?: number;
  totalScans?: number;
  [key: string]: number | string | undefined;
}

interface HowItWorksStep {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  author: string;
  businessName?: string;
  date?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order?: number;
}

interface TrustBadge {
  id: string;
  text: string;
  icon?: string;
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
