import type { Database } from '@supabase/supabase-js';

export interface Company {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface Trainee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  function: string | null;
  birth_date: string | null;
  company_id: string;
  company: Company;
  formations: string[];
  created_at: string;
  updated_at: string;
}

export interface TraineeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  function: string;
  birth_date: string;
  company_id: string;
  formations: string[];
}

export interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  specialties: string[];
  bio: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InstructorFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialties: string[];
  bio: string;
}

export interface Formation {
  id: string;
  title: string;
  description: string;
  duration: string;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  instructors: Instructor[];
  enrolledCount: number;
  created_at: string;
  updated_at: string;
  participants?: string[]; // Array of trainee IDs
}

export interface FormationFormData {
  title: string;
  description: string;
  duration: string;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  location: string;
  instructorIds: string[];
}

export interface Session {
  id: string;
  formation_id: string;
  formation: Formation;
  instructor_id: string;
  instructor: Instructor;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface SessionFormData {
  formation_id: string;
  instructor_id: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}