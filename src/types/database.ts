export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      awards: {
        Row: {
          artwork_asset_key: string
          created_at: string
          description_en: string
          description_vi: string
          display_order: number
          kind: Database["public"]["Enums"]["award_kind"]
          title_en: string
          title_vi: string
          updated_at: string
        }
        Insert: {
          artwork_asset_key: string
          created_at?: string
          description_en: string
          description_vi: string
          display_order: number
          kind: Database["public"]["Enums"]["award_kind"]
          title_en: string
          title_vi: string
          updated_at?: string
        }
        Update: {
          artwork_asset_key?: string
          created_at?: string
          description_en?: string
          description_vi?: string
          display_order?: number
          kind?: Database["public"]["Enums"]["award_kind"]
          title_en?: string
          title_vi?: string
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name_en: string
          name_vi: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name_en: string
          name_vi: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name_en?: string
          name_vi?: string
        }
        Relationships: []
      }
      gift_redemptions: {
        Row: {
          created_at: string
          gift_name: string
          id: string
          quantity: number
          redeemed_at: string
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gift_name: string
          id?: string
          quantity?: number
          redeemed_at?: string
          source?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gift_name?: string
          id?: string
          quantity?: number
          redeemed_at?: string
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hashtags: {
        Row: {
          created_at: string | null
          id: string
          label_en: string
          label_vi: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          label_en: string
          label_vi: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          label_en?: string
          label_vi?: string
          slug?: string
        }
        Relationships: []
      }
      kudo_hashtags: {
        Row: {
          hashtag_id: string
          kudo_id: string
        }
        Insert: {
          hashtag_id: string
          kudo_id: string
        }
        Update: {
          hashtag_id?: string
          kudo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudo_hashtags_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_hashtags_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_hashtags_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_hashtags_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      kudo_hearts: {
        Row: {
          created_at: string | null
          kudo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          kudo_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          kudo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudo_hearts_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_hearts_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_hearts_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_hearts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kudo_images: {
        Row: {
          created_at: string
          id: string
          kudo_id: string
          position: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          kudo_id: string
          position?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          kudo_id?: string
          position?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudo_images_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_images_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_images_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      kudo_moderation_events: {
        Row: {
          actor: string | null
          created_at: string
          criterion: string | null
          id: string
          kudo_id: string
          new_status: Database["public"]["Enums"]["kudo_status"]
          prev_status: Database["public"]["Enums"]["kudo_status"]
        }
        Insert: {
          actor?: string | null
          created_at?: string
          criterion?: string | null
          id?: string
          kudo_id: string
          new_status: Database["public"]["Enums"]["kudo_status"]
          prev_status: Database["public"]["Enums"]["kudo_status"]
        }
        Update: {
          actor?: string | null
          created_at?: string
          criterion?: string | null
          id?: string
          kudo_id?: string
          new_status?: Database["public"]["Enums"]["kudo_status"]
          prev_status?: Database["public"]["Enums"]["kudo_status"]
        }
        Relationships: [
          {
            foreignKeyName: "kudo_moderation_events_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_moderation_events_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_moderation_events_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos_with_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      kudo_recipients: {
        Row: {
          kudo_id: string
          recipient_id: string
        }
        Insert: {
          kudo_id: string
          recipient_id: string
        }
        Update: {
          kudo_id?: string
          recipient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudo_recipients_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_recipients_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_recipients_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_recipients_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kudo_reports: {
        Row: {
          created_at: string
          id: string
          kudo_id: string
          note: string | null
          reason_slug: string
          reporter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kudo_id: string
          note?: string | null
          reason_slug: string
          reporter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kudo_id?: string
          note?: string | null
          reason_slug?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kudo_reports_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_reports_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_reports_kudo_id_fkey"
            columns: ["kudo_id"]
            isOneToOne: false
            referencedRelation: "kudos_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kudo_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kudos: {
        Row: {
          anonymous_alias: string | null
          body: string
          created_at: string | null
          id: string
          is_anonymous: boolean
          sender_id: string
          status: Database["public"]["Enums"]["kudo_status"]
          title: string | null
        }
        Insert: {
          anonymous_alias?: string | null
          body: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean
          sender_id: string
          status?: Database["public"]["Enums"]["kudo_status"]
          title?: string | null
        }
        Update: {
          anonymous_alias?: string | null
          body?: string
          created_at?: string | null
          id?: string
          is_anonymous?: boolean
          sender_id?: string
          status?: Database["public"]["Enums"]["kudo_status"]
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kudos_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          payload: Json
          read_at: string | null
          recipient_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json
          read_at?: string | null
          recipient_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          read_at?: string | null
          recipient_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department_id: string | null
          display_name: string | null
          email: string
          honour_title: Database["public"]["Enums"]["honour_title"] | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          display_name?: string | null
          email: string
          honour_title?: Database["public"]["Enums"]["honour_title"] | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          display_name?: string | null
          email?: string
          honour_title?: Database["public"]["Enums"]["honour_title"] | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      secret_boxes: {
        Row: {
          badge_kind: Database["public"]["Enums"]["badge_kind"] | null
          created_at: string
          id: string
          opened_at: string | null
          prize_asset_key: string | null
          prize_name: string | null
          prize_type: string | null
          user_id: string
        }
        Insert: {
          badge_kind?: Database["public"]["Enums"]["badge_kind"] | null
          created_at?: string
          id?: string
          opened_at?: string | null
          prize_asset_key?: string | null
          prize_name?: string | null
          prize_type?: string | null
          user_id: string
        }
        Update: {
          badge_kind?: Database["public"]["Enums"]["badge_kind"] | null
          created_at?: string
          id?: string
          opened_at?: string | null
          prize_asset_key?: string | null
          prize_name?: string | null
          prize_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "secret_boxes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      kudos_feed: {
        Row: {
          anonymous_alias: string | null
          body: string | null
          created_at: string | null
          id: string | null
          is_anonymous: boolean | null
          sender_id: string | null
          status: Database["public"]["Enums"]["kudo_status"] | null
          title: string | null
        }
        Insert: {
          anonymous_alias?: string | null
          body?: string | null
          created_at?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          sender_id?: never
          status?: Database["public"]["Enums"]["kudo_status"] | null
          title?: string | null
        }
        Update: {
          anonymous_alias?: string | null
          body?: string | null
          created_at?: string | null
          id?: string | null
          is_anonymous?: boolean | null
          sender_id?: never
          status?: Database["public"]["Enums"]["kudo_status"] | null
          title?: string | null
        }
        Relationships: []
      }
      kudos_with_stats: {
        Row: {
          anonymous_alias: string | null
          body: string | null
          created_at: string | null
          hearts_count: number | null
          id: string | null
          is_anonymous: boolean | null
          sender_id: string | null
          status: Database["public"]["Enums"]["kudo_status"] | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kudos_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      compute_honour_tier: {
        Args: { p_user_id: string }
        Returns: Database["public"]["Enums"]["honour_title"]
      }
      create_kudo: {
        Args: {
          p_anonymous_alias?: string
          p_body: string
          p_hashtag_slugs: string[]
          p_image_paths: string[]
          p_is_anonymous: boolean
          p_recipient_id: string
          p_title: string
        }
        Returns: string
      }
      open_secret_box: {
        Args: never
        Returns: {
          badge_kind: Database["public"]["Enums"]["badge_kind"] | null
          created_at: string
          id: string
          opened_at: string | null
          prize_asset_key: string | null
          prize_name: string | null
          prize_type: string | null
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "secret_boxes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      award_kind:
        | "mvp"
        | "best_manager"
        | "signature_creator"
        | "top_project"
        | "top_project_leader"
        | "top_talent"
      badge_kind:
        | "revival"
        | "touch_of_light"
        | "stay_gold"
        | "flow_to_horizon"
        | "beyond_the_boundary"
        | "root_further"
      honour_title: "Legend Hero" | "Rising Hero" | "Super Hero" | "New Hero"
      kudo_status: "active" | "soft_hidden" | "spam"
      notification_type:
        | "kudos_received"
        | "kudos_liked"
        | "secret_box_granted"
        | "level_up"
        | "content_soft_hidden"
        | "badge_collected"
        | "admin_review_request"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      award_kind: [
        "mvp",
        "best_manager",
        "signature_creator",
        "top_project",
        "top_project_leader",
        "top_talent",
      ],
      badge_kind: [
        "revival",
        "touch_of_light",
        "stay_gold",
        "flow_to_horizon",
        "beyond_the_boundary",
        "root_further",
      ],
      honour_title: ["Legend Hero", "Rising Hero", "Super Hero", "New Hero"],
      kudo_status: ["active", "soft_hidden", "spam"],
      notification_type: [
        "kudos_received",
        "kudos_liked",
        "secret_box_granted",
        "level_up",
        "content_soft_hidden",
        "badge_collected",
        "admin_review_request",
      ],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
