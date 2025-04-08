import { v4 as uuidv4 } from 'uuid';
import type { Instructor, InstructorFormData } from '../types/database';

// Simulation d'une base de données en mémoire
let instructors: Instructor[] = [
  {
    id: '1',
    first_name: 'Sophie',
    last_name: 'Bernard',
    email: 'sophie.bernard@formation.com',
    phone: '0612345678',
    specialties: ['React', 'JavaScript', 'TypeScript'],
    bio: 'Experte en développement frontend avec 10 ans d\'expérience',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    first_name: 'Marc',
    last_name: 'Dubois',
    email: 'marc.dubois@formation.com',
    phone: '0687654321',
    specialties: ['Node.js', 'Express', 'MongoDB'],
    bio: 'Spécialiste backend et architecte logiciel',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const instructorService = {
  // Récupérer tous les formateurs
  async getInstructors(): Promise<Instructor[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...instructors]);
      }, 100);
    });
  },

  // Récupérer un formateur par son ID
  async getInstructorById(id: string): Promise<Instructor | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const instructor = instructors.find(i => i.id === id);
        resolve(instructor || null);
      }, 100);
    });
  },

  // Créer un nouveau formateur
  async createInstructor(instructorData: InstructorFormData): Promise<Instructor> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newInstructor: Instructor = {
          id: uuidv4(),
          ...instructorData,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        instructors.push(newInstructor);
        resolve(newInstructor);
      }, 100);
    });
  },

  // Mettre à jour un formateur
  async updateInstructor(id: string, instructorData: Partial<InstructorFormData>): Promise<Instructor> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = instructors.findIndex(i => i.id === id);
        if (index === -1) {
          reject(new Error('Formateur non trouvé'));
          return;
        }

        const updatedInstructor: Instructor = {
          ...instructors[index],
          ...instructorData,
          updated_at: new Date().toISOString()
        };

        instructors[index] = updatedInstructor;
        resolve(updatedInstructor);
      }, 100);
    });
  },

  // Supprimer un formateur
  async deleteInstructor(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = instructors.findIndex(i => i.id === id);
        if (index === -1) {
          reject(new Error('Formateur non trouvé'));
          return;
        }

        instructors = instructors.filter(i => i.id !== id);
        resolve();
      }, 100);
    });
  },

  // Activer/désactiver un formateur
  async toggleInstructorStatus(id: string): Promise<Instructor> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = instructors.findIndex(i => i.id === id);
        if (index === -1) {
          reject(new Error('Formateur non trouvé'));
          return;
        }

        const updatedInstructor: Instructor = {
          ...instructors[index],
          is_active: !instructors[index].is_active,
          updated_at: new Date().toISOString()
        };

        instructors[index] = updatedInstructor;
        resolve(updatedInstructor);
      }, 100);
    });
  }
};