import { v4 as uuidv4 } from 'uuid';
import type { Trainee, TraineeFormData } from '../types/database';
import { companyService } from './companyService';

// Simulation d'une base de données en mémoire
let trainees: Trainee[] = [
  {
    id: '1',
    first_name: 'Marie',
    last_name: 'Martin',
    email: 'marie.martin@email.com',
    phone: '0612345678',
    function: 'Développeur Frontend',
    birth_date: '1990-01-01',
    company_id: '1',
    company: {
      id: '1',
      name: 'TechCorp',
      address: '123 Rue de la Tech, 75001 Paris',
      phone: '0123456789',
      email: 'contact@techcorp.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    formations: ['Z CRM', 'Odoo CRM'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    first_name: 'Jean',
    last_name: 'Dupont',
    email: 'jean.dupont@email.com',
    phone: '0687654321',
    function: 'Chef de projet',
    birth_date: '1985-05-15',
    company_id: '2',
    company: {
      id: '2',
      name: 'Digital Solutions',
      address: '456 Avenue du Digital, 69002 Lyon',
      phone: '0987654321',
      email: 'contact@digitalsolutions.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    formations: ['Odoo CRM', 'Odoo Mail'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const traineeService = {
  // Récupérer tous les stagiaires
  async getTrainees(): Promise<Trainee[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...trainees]);
      }, 100);
    });
  },

  // Récupérer un stagiaire par son ID
  async getTraineeById(id: string): Promise<Trainee | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const trainee = trainees.find(t => t.id === id);
        resolve(trainee || null);
      }, 100);
    });
  },

  // Créer un nouveau stagiaire
  async createTrainee(traineeData: TraineeFormData): Promise<Trainee> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const company = await companyService.getCompanyById(traineeData.company_id);
        if (!company) throw new Error('Entreprise non trouvée');

        const newTrainee: Trainee = {
          id: uuidv4(),
          ...traineeData,
          company,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        trainees.push(newTrainee);
        resolve(newTrainee);
      }, 100);
    });
  },

  // Mettre à jour un stagiaire
  async updateTrainee(id: string, traineeData: Partial<TraineeFormData>): Promise<Trainee> {
    return new Promise(async (resolve, reject) => {
      setTimeout(async () => {
        const index = trainees.findIndex(t => t.id === id);
        if (index === -1) {
          reject(new Error('Stagiaire non trouvé'));
          return;
        }

        let company = trainees[index].company;
        if (traineeData.company_id && traineeData.company_id !== trainees[index].company_id) {
          const newCompany = await companyService.getCompanyById(traineeData.company_id);
          if (!newCompany) {
            reject(new Error('Entreprise non trouvée'));
            return;
          }
          company = newCompany;
        }

        const updatedTrainee: Trainee = {
          ...trainees[index],
          ...traineeData,
          company,
          updated_at: new Date().toISOString()
        };

        trainees[index] = updatedTrainee;
        resolve(updatedTrainee);
      }, 100);
    });
  },

  // Supprimer un stagiaire
  async deleteTrainee(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = trainees.findIndex(t => t.id === id);
        if (index === -1) {
          reject(new Error('Stagiaire non trouvé'));
          return;
        }

        trainees = trainees.filter(t => t.id !== id);
        resolve();
      }, 100);
    });
  }
};