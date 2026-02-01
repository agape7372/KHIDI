export interface Article {
  id: string;
  source: string;
  date: string;
  title: string;
  summary: string;
  link: string;
  isNew: boolean;
  tags: {
    type: string;
    category: string;
    layer: string;
    region: string;
    source: string;
  };
  // Optional fields for extended article data
  content?: string;
  originalContent?: string;
  category?: string;
  pdfUrl?: string;
}

// Article with AI analysis result
export interface ArticleWithAnalysis extends Article {
  aiAnalysis?: string;
}

export interface FilterState {
  type: string[];
  category: string[];
  layer: string[];
  region: string[];
  source: string[];
  search: string;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}
