export interface Query {
  text: string;
  intent: 'pricing_query' | 'hours_query' | 'location_query' | 'general_query';
  tags: string[];
  confidence: number;
  metadata_filters: {
    source?: string;
    is_public?: boolean;
    category?: string;
  };
}

export interface Document {
  id: string;
  content: string;
  source: string;
  embedding?: number[];
  similarity?: number;
  relevance_score?: number;
  is_public: boolean;
  created_at: string;
}

export interface RankedDocument extends Document {
  rerank_reason: string;
  final_score: number;
}