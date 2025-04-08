import React, { useState } from 'react';
import { User, Mail, Phone, Briefcase, Calendar, BookOpen, CheckSquare } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  function: string;
  birthDate: string;
  formations: string[];
}

const Registration = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    function: '',
    birthDate: '',
    formations: []
  });

  const formations = [
    { id: 'zcrm', name: 'Z CRM' },
    { id: 'odoo-crm', name: 'Odoo CRM' },
    { id: 'odoo-mail', name: 'Odoo Mail' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormationToggle = (formationName: string) => {
    setFormData(prev => {
      const formations = prev.formations;
      if (formations.includes(formationName)) {
        return {
          ...prev,
          formations: formations.filter(f => f !== formationName)
        };
      } else {
        return {
          ...prev,
          formations: [...formations, formationName]
        };
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-8">Formulaire d'inscription</h1>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prénom */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pl-10 input-field"
                    placeholder="Votre prénom"
                    required
                  />
                </div>
              </div>

              {/* Nom */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="pl-10 input-field"
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 input-field"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="pl-10 input-field"
                  placeholder="06 XX XX XX XX"
                  required
                />
              </div>
            </div>

            {/* Fonction */}
            <div>
              <label htmlFor="function" className="block text-sm font-medium text-gray-700 mb-1">
                Fonction
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="function"
                  name="function"
                  value={formData.function}
                  onChange={handleChange}
                  className="pl-10 input-field"
                  placeholder="Votre fonction dans l'entreprise"
                  required
                />
              </div>
            </div>

            {/* Date de naissance */}
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date de naissance
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="pl-10 input-field"
                  required
                />
              </div>
            </div>

            {/* Formations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Formations
              </label>
              <div className="space-y-2">
                {formations.map(formation => (
                  <label key={formation.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.formations.includes(formation.name)}
                      onChange={() => handleFormationToggle(formation.name)}
                      className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{formation.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button type="button" className="btn-secondary">
                Annuler
              </button>
              <button type="submit" className="btn-primary flex items-center space-x-2">
                <CheckSquare className="h-5 w-5" />
                <span>S'inscrire</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;