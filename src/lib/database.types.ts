import type { Database } from '@supabase/supabase-js';

export interface Tables {
  companies: {
    Row: {
      id: string;
      name: string;
      address: string | null;
      phone: string | null;
      email: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      name: string;
      address?: string | null;
      phone?: string | null;
      email?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      name?: string;
      address?: string | null;
      phone?: string | null;
      email?: string | null;
      updated_at?: string;
    };
  };

  trainees: {
    Row: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string | null;
      function: string | null;
      birth_date: string | null;
      company_id: string;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string | null;
      function?: string | null;
      birth_date?: string | null;
      company_id: string;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string | null;
      function?: string | null;
      birth_date?: string | null;
      company_id?: string;
      updated_at?: string;
    };
  };

  instructors: {
    Row: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string | null;
      specialties: string[] | null;
      bio: string | null;
      is_active: boolean;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string | null;
      specialties?: string[] | null;
      bio?: string | null;
      is_active?: boolean;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string | null;
      specialties?: string[] | null;
      bio?: string | null;
      is_active?: boolean;
      updated_at?: string;
    };
  };

  formations: {
    Row: {
      id: string;
      title: string;
      description: string | null;
      duration: string;
      max_participants: number;
      start_date: string;
      end_date: string;
      location: string;
      status: 'upcoming' | 'ongoing' | 'completed';
      enrolled_count: number;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      title: string;
      description?: string | null;
      duration: string;
      max_participants?: number;
      start_date: string;
      end_date: string;
      location: string;
      status?: 'upcoming' | 'ongoing' | 'completed';
      enrolled_count?: number;
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      title?: string;
      description?: string | null;
      duration?: string;
      max_participants?: number;
      start_date?: string;
      end_date?: string;
      location?: string;
      status?: 'upcoming' | 'ongoing' | 'completed';
      enrolled_count?: number;
      updated_at?: string;
    };
  };

  formation_instructors: {
    Row: {
      formation_id: string;
      instructor_id: string;
      created_at: string;
    };
    Insert: {
      formation_id: string;
      instructor_id: string;
      created_at?: string;
    };
    Update: {
      formation_id?: string;
      instructor_id?: string;
    };
  };

  sessions: {
    Row: {
      id: string;
      formation_id: string;
      instructor_id: string;
      date: string;
      start_time: string;
      end_time: string;
      location: string;
      status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      formation_id: string;
      instructor_id: string;
      date: string;
      start_time: string;
      end_time: string;
      location: string;
      status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
      created_at?: string;
      updated_at?: string;
    };
    Update: {
      id?: string;
      formation_id?: string;
      instructor_id?: string;
      date?: string;
      start_time?: string;
      end_time?: string;
      location?: string;
      status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
      updated_at?: string;
    };
  };
}

export type Database = {
  public: Tables;
};