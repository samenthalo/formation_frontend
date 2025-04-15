// src/services/formationService.ts
import api from './api';
import type { Formation, FormationFormData } from '../types/database';
import { instructorService } from './instructorService';

const formationService = {
  // Récupérer toutes les formations
  async getFormations(): Promise<Formation[]> {
    const response = await api.get('/formations');
    return response.data;
  },

  // Récupérer une formation par son ID
  async getFormationById(id: string): Promise<Formation | null> {
    try {
      const response = await api.get(`/formations/${id}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Créer une nouvelle formation
  async createFormation(formationData: FormationFormData): Promise<Formation> {
    const instructors = await Promise.all(
      formationData.instructorIds.map(id => instructorService.getInstructorById(id))
    );

    const newFormation: Formation = {
      ...formationData,
      status: 'upcoming',
      instructors: instructors.filter(i => i !== null) as any[],
      enrolledCount: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const response = await api.post('/formations', newFormation);
    return response.data;
  },

  // Mettre à jour une formation
  async updateFormation(id: string, formationData: Partial<FormationFormData>): Promise<Formation> {
    const existingFormation = await this.getFormationById(id);
    if (!existingFormation) {
      throw new Error('Formation non trouvée');
    }

    let instructors = existingFormation.instructors;
    if (formationData.instructorIds) {
      instructors = (await Promise.all(
        formationData.instructorIds.map(id => instructorService.getInstructorById(id))
      )).filter(i => i !== null) as any[];
    }

    const updatedFormation: Formation = {
      ...existingFormation,
      ...formationData,
      instructors,
      updated_at: new Date().toISOString()
    };

    const response = await api.put(`/formations/${id}`, updatedFormation);
    return response.data;
  },

  // Supprimer une formation
  async deleteFormation(id: string): Promise<void> {
    await api.delete(`/formations/${id}`);
  }
};

export default formationService;
