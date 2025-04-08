import { v4 as uuidv4 } from 'uuid';
import type { Formation, FormationFormData } from '../types/database';
import { instructorService } from './instructorService';

// Simulation d'une base de données en mémoire
let formations: Formation[] = [
  {
    id: '1',
    title: 'Formation React Avancé',
    description: 'Maîtrisez les concepts avancés de React',
    duration: '35 heures',
    maxParticipants: 12,
    startDate: '2024-04-01',
    endDate: '2024-04-05',
    location: 'Salle 302',
    status: 'upcoming',
    instructors: [],
    enrolledCount: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const formationService = {
  // Récupérer toutes les formations
  async getFormations(): Promise<Formation[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...formations]);
      }, 100);
    });
  },

  // Récupérer une formation par son ID
  async getFormationById(id: string): Promise<Formation | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const formation = formations.find(f => f.id === id);
        resolve(formation || null);
      }, 100);
    });
  },

  // Créer une nouvelle formation
  async createFormation(formationData: FormationFormData): Promise<Formation> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const instructors = await Promise.all(
          formationData.instructorIds.map(id => instructorService.getInstructorById(id))
        );

        const newFormation: Formation = {
          id: uuidv4(),
          ...formationData,
          status: 'upcoming',
          instructors: instructors.filter(i => i !== null) as any[],
          enrolledCount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        formations.push(newFormation);
        resolve(newFormation);
      }, 100);
    });
  },

  // Mettre à jour une formation
  async updateFormation(id: string, formationData: Partial<FormationFormData>): Promise<Formation> {
    return new Promise(async (resolve, reject) => {
      setTimeout(async () => {
        const index = formations.findIndex(f => f.id === id);
        if (index === -1) {
          reject(new Error('Formation non trouvée'));
          return;
        }

        let instructors = formations[index].instructors;
        if (formationData.instructorIds) {
          instructors = (await Promise.all(
            formationData.instructorIds.map(id => instructorService.getInstructorById(id))
          )).filter(i => i !== null) as any[];
        }

        const updatedFormation: Formation = {
          ...formations[index],
          ...formationData,
          instructors,
          updated_at: new Date().toISOString()
        };

        formations[index] = updatedFormation;
        resolve(updatedFormation);
      }, 100);
    });
  },

  // Supprimer une formation
  async deleteFormation(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = formations.findIndex(f => f.id === id);
        if (index === -1) {
          reject(new Error('Formation non trouvée'));
          return;
        }

        formations = formations.filter(f => f.id !== id);
        resolve();
      }, 100);
    });
  }
};