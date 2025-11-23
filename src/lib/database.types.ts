/**
 * TypeScript types for Supabase database schema
 * Auto-generated types for type-safe database queries
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      biblical_passages: {
        Row: {
          id: string
          book: string
          chapter: number
          verse_start: number
          verse_end: number | null
          translation: string
          text: string
          embedding: number[] | null
          themes: string[]
          testament: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          book: string
          chapter: number
          verse_start: number
          verse_end?: number | null
          translation: string
          text: string
          embedding?: number[] | null
          themes?: string[]
          testament?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          book?: string
          chapter?: number
          verse_start?: number
          verse_end?: number | null
          translation?: string
          text?: string
          embedding?: number[] | null
          themes?: string[]
          testament?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      original_language: {
        Row: {
          id: string
          passage_id: string | null
          testament: string | null
          original_text: string
          transliteration: string | null
          word_number: number | null
          strongs_number: string | null
          root_word: string | null
          part_of_speech: string | null
          definition: string | null
          etymology: string | null
          cultural_context: string | null
          semantic_range: string[]
          other_uses: Json
          created_at: string
        }
        Insert: {
          id?: string
          passage_id?: string | null
          testament?: string | null
          original_text: string
          transliteration?: string | null
          word_number?: number | null
          strongs_number?: string | null
          root_word?: string | null
          part_of_speech?: string | null
          definition?: string | null
          etymology?: string | null
          cultural_context?: string | null
          semantic_range?: string[]
          other_uses?: Json
          created_at?: string
        }
        Update: {
          id?: string
          passage_id?: string | null
          testament?: string | null
          original_text?: string
          transliteration?: string | null
          word_number?: number | null
          strongs_number?: string | null
          root_word?: string | null
          part_of_speech?: string | null
          definition?: string | null
          etymology?: string | null
          cultural_context?: string | null
          semantic_range?: string[]
          other_uses?: Json
          created_at?: string
        }
      }
      historical_parallels: {
        Row: {
          id: string
          title: string
          time_period: string | null
          location: string | null
          situation_summary: string
          key_actors: string[]
          political_context: string | null
          what_happened: string
          outcome: string
          lessons_learned: string | null
          similarity_themes: string[]
          embedding: number[] | null
          source_references: string[]
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          time_period?: string | null
          location?: string | null
          situation_summary: string
          key_actors?: string[]
          political_context?: string | null
          what_happened: string
          outcome: string
          lessons_learned?: string | null
          similarity_themes?: string[]
          embedding?: number[] | null
          source_references?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          time_period?: string | null
          location?: string | null
          situation_summary?: string
          key_actors?: string[]
          political_context?: string | null
          what_happened?: string
          outcome?: string
          lessons_learned?: string | null
          similarity_themes?: string[]
          embedding?: number[] | null
          source_references?: string[]
          created_at?: string
        }
      }
      project_2025_policies: {
        Row: {
          id: string
          chapter: string | null
          page_number: number | null
          policy_title: string | null
          policy_text: string
          policy_area: string | null
          key_recommendations: string[]
          embedding: number[] | null
          implementation_status: string | null
          related_actions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chapter?: string | null
          page_number?: number | null
          policy_title?: string | null
          policy_text: string
          policy_area?: string | null
          key_recommendations?: string[]
          embedding?: number[] | null
          implementation_status?: string | null
          related_actions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chapter?: string | null
          page_number?: number | null
          policy_title?: string | null
          policy_text?: string
          policy_area?: string | null
          key_recommendations?: string[]
          embedding?: number[] | null
          implementation_status?: string | null
          related_actions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      analysis_requests: {
        Row: {
          id: string
          political_statement: string
          statement_embedding: number[] | null
          user_id: string | null
          status: string
          error_message: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          political_statement: string
          statement_embedding?: number[] | null
          user_id?: string | null
          status?: string
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          political_statement?: string
          statement_embedding?: number[] | null
          user_id?: string | null
          status?: string
          error_message?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      analysis_results: {
        Row: {
          id: string
          request_id: string | null
          relevant_passages: Json
          etymology_insights: Json
          biblical_context: Json
          historical_parallels: Json
          policy_connections: Json
          government_data: Json
          news_articles: Json
          executive_summary: string | null
          detailed_analysis: string | null
          original_language_insights: string | null
          historical_comparison: string | null
          modern_application: string | null
          theological_perspectives: Json
          confidence_score: number | null
          processing_time_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          request_id?: string | null
          relevant_passages?: Json
          etymology_insights?: Json
          biblical_context?: Json
          historical_parallels?: Json
          policy_connections?: Json
          government_data?: Json
          news_articles?: Json
          executive_summary?: string | null
          detailed_analysis?: string | null
          original_language_insights?: string | null
          historical_comparison?: string | null
          modern_application?: string | null
          theological_perspectives?: Json
          confidence_score?: number | null
          processing_time_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string | null
          relevant_passages?: Json
          etymology_insights?: Json
          biblical_context?: Json
          historical_parallels?: Json
          policy_connections?: Json
          government_data?: Json
          news_articles?: Json
          executive_summary?: string | null
          detailed_analysis?: string | null
          original_language_insights?: string | null
          historical_comparison?: string | null
          modern_application?: string | null
          theological_perspectives?: Json
          confidence_score?: number | null
          processing_time_ms?: number | null
          created_at?: string
        }
      }
      news_cache: {
        Row: {
          id: string
          url: string
          title: string | null
          source: string | null
          published_date: string | null
          content: string | null
          summary: string | null
          keywords: string[]
          sentiment: string | null
          embedding: number[] | null
          fetched_at: string
        }
        Insert: {
          id?: string
          url: string
          title?: string | null
          source?: string | null
          published_date?: string | null
          content?: string | null
          summary?: string | null
          keywords?: string[]
          sentiment?: string | null
          embedding?: number[] | null
          fetched_at?: string
        }
        Update: {
          id?: string
          url?: string
          title?: string | null
          source?: string | null
          published_date?: string | null
          content?: string | null
          summary?: string | null
          keywords?: string[]
          sentiment?: string | null
          embedding?: number[] | null
          fetched_at?: string
        }
      }
    }
    Functions: {
      search_biblical_passages: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
          translation_filter?: string
        }
        Returns: {
          id: string
          book: string
          chapter: number
          verse_start: number
          verse_end: number | null
          text: string
          translation: string
          themes: string[]
          similarity: number
        }[]
      }
      search_historical_parallels: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          title: string
          time_period: string | null
          location: string | null
          situation_summary: string
          outcome: string
          lessons_learned: string | null
          similarity: number
        }[]
      }
      search_project_2025: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
        }
        Returns: {
          id: string
          chapter: string | null
          policy_title: string | null
          policy_text: string
          policy_area: string | null
          key_recommendations: string[]
          similarity: number
        }[]
      }
      search_news: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
          days_back?: number
        }
        Returns: {
          id: string
          title: string | null
          source: string | null
          url: string
          summary: string | null
          published_date: string | null
          similarity: number
        }[]
      }
    }
  }
}

// Helper types for common operations
export type BiblicalPassage = Database['public']['Tables']['biblical_passages']['Row'];
export type HistoricalParallel = Database['public']['Tables']['historical_parallels']['Row'];
export type AnalysisRequest = Database['public']['Tables']['analysis_requests']['Row'];
export type AnalysisResult = Database['public']['Tables']['analysis_results']['Row'];
