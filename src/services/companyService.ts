import { v4 as uuidv4 } from 'uuid';
import type { Company, CompanyFormData } from '../types/database';

// Simulation d'une base de données en mémoire
let companies: Company[] = [
  {
    id: '1',
    name: 'TechCorp',
    address: '123 Rue de la Tech, 75001 Paris',
    phone: '0123456789',
    email: 'contact@techcorp.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Digital Solutions',
    address: '456 Avenue du Digital, 69002 Lyon',
    phone: '0987654321',
    email: 'contact@digitalsolutions.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const companyService = {
  // Récupérer toutes les entreprises
  async getCompanies(): Promise<Company[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...companies]);
      }, 100);
    });
  },

  // Récupérer une entreprise par son ID
  async getCompanyById(id: string): Promise<Company | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const company = companies.find(c => c.id === id);
        resolve(company || null);
      }, 100);
    });
  },

  // Créer une nouvelle entreprise
  async createCompany(companyData: CompanyFormData): Promise<Company> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCompany: Company = {
          id: uuidv4(),
          name: companyData.name,
          address: companyData.address,
          phone: companyData.phone,
          email: companyData.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        companies.push(newCompany);
        resolve(newCompany);
      }, 100);
    });
  },

  // Mettre à jour une entreprise
  async updateCompany(id: string, companyData: Partial<CompanyFormData>): Promise<Company> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = companies.findIndex(c => c.id === id);
        if (index === -1) {
          reject(new Error('Entreprise non trouvée'));
          return;
        }

        const updatedCompany: Company = {
          ...companies[index],
          ...companyData,
          updated_at: new Date().toISOString()
        };

        companies[index] = updatedCompany;
        resolve(updatedCompany);
      }, 100);
    });
  },

  // Supprimer une entreprise
  async deleteCompany(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = companies.findIndex(c => c.id === id);
        if (index === -1) {
          reject(new Error('Entreprise non trouvée'));
          return;
        }

        companies = companies.filter(c => c.id !== id);
        resolve();
      }, 100);
    });
  }
};