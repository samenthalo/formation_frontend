import { v4 as uuidv4 } from 'uuid';

// Types
interface Formation {
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
}

interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  specialties: string[];
  bio: string | null;
  is_active: boolean;
}

interface Session {
  id: string;
  formation_id: string;
  formation: Formation;
  instructor_id: string;
  instructor: Instructor;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

// Mock data
let formations: Formation[] = [
  {
    id: '1',
    title: 'Z CRM - Formation Avancée',
    description: 'Formation avancée sur Z CRM',
    duration: '14 heures',
    maxParticipants: 12,
    startDate: '2024-03-20',
    endDate: '2024-03-21',
    location: 'Salle 302',
    status: 'upcoming',
    instructors: [],
    enrolledCount: 0
  },
  {
    id: '2',
    title: 'Odoo CRM - Formation',
    description: 'Formation sur Odoo CRM',
    duration: '7 heures',
    maxParticipants: 15,
    startDate: '2024-03-25',
    endDate: '2024-03-25',
    location: 'Salle 201',
    status: 'upcoming',
    instructors: [],
    enrolledCount: 0
  },
  {
    id: '3',
    title: 'Odoo Mail - Workshop',
    description: 'Workshop sur Odoo Mail',
    duration: '4 heures',
    maxParticipants: 10,
    startDate: '2024-03-28',
    endDate: '2024-03-28',
    location: 'Salle 102',
    status: 'upcoming',
    instructors: [],
    enrolledCount: 0
  }
];

let instructors: Instructor[] = [
  {
    id: '1',
    first_name: 'Sophie',
    last_name: 'Bernard',
    email: 'sophie.bernard@formation.com',
    phone: '0612345678',
    specialties: ['Z CRM', 'Odoo CRM'],
    bio: 'Experte en CRM avec 10 ans d\'expérience',
    is_active: true
  },
  {
    id: '2',
    first_name: 'Marc',
    last_name: 'Dubois',
    email: 'marc.dubois@formation.com',
    phone: '0687654321',
    specialties: ['Odoo Mail', 'Odoo CRM'],
    bio: 'Spécialiste Odoo',
    is_active: true
  }
];

let sessions: Session[] = [
  // Z CRM - Formation Avancée (2 jours)
  {
    id: '1',
    formation_id: '1',
    formation: formations[0],
    instructor_id: '1',
    instructor: instructors[0],
    date: '2024-03-20',
    start_time: '09:00',
    end_time: '17:00',
    location: 'Salle 302',
    status: 'scheduled'
  },
  {
    id: '2',
    formation_id: '1',
    formation: formations[0],
    instructor_id: '1',
    instructor: instructors[0],
    date: '2024-03-21',
    start_time: '09:00',
    end_time: '17:00',
    location: 'Salle 302',
    status: 'scheduled'
  },
  // Odoo CRM - Formation (1 jour)
  {
    id: '3',
    formation_id: '2',
    formation: formations[1],
    instructor_id: '2',
    instructor: instructors[1],
    date: '2024-03-25',
    start_time: '09:00',
    end_time: '17:30',
    location: 'Salle 201',
    status: 'scheduled'
  },
  // Odoo Mail - Workshop (demi-journée)
  {
    id: '4',
    formation_id: '3',
    formation: formations[2],
    instructor_id: '2',
    instructor: instructors[1],
    date: '2024-03-28',
    start_time: '14:00',
    end_time: '18:00',
    location: 'Salle 102',
    status: 'scheduled'
  }
];

// API
export const api = {
  formations: {
    getAll: async () => {
      return new Promise<Formation[]>((resolve) => {
        setTimeout(() => resolve(formations), 500);
      });
    },
    getById: async (id: string) => {
      return new Promise<Formation | null>((resolve) => {
        setTimeout(() => {
          const formation = formations.find(f => f.id === id);
          resolve(formation || null);
        }, 500);
      });
    },
    create: async (formation: Omit<Formation, 'id'>) => {
      return new Promise<Formation>((resolve) => {
        setTimeout(() => {
          const newFormation = { ...formation, id: uuidv4() };
          formations = [...formations, newFormation];
          resolve(newFormation);
        }, 500);
      });
    }
  },
  instructors: {
    getAll: async () => {
      return new Promise<Instructor[]>((resolve) => {
        setTimeout(() => resolve(instructors), 500);
      });
    }
  },
  sessions: {
    getAll: async () => {
      return new Promise<Session[]>((resolve) => {
        setTimeout(() => resolve(sessions), 500);
      });
    },
    create: async (sessionData: Omit<Session, 'id' | 'formation' | 'instructor'>) => {
      return new Promise<Session>((resolve) => {
        setTimeout(() => {
          const formation = formations.find(f => f.id === sessionData.formation_id);
          const instructor = instructors.find(i => i.id === sessionData.instructor_id);
          
          if (!formation || !instructor) {
            throw new Error('Formation or instructor not found');
          }

          const newSession: Session = {
            ...sessionData,
            id: uuidv4(),
            formation,
            instructor,
            status: 'scheduled'
          };

          sessions = [...sessions, newSession];
          resolve(newSession);
        }, 500);
      });
    }
  }
};