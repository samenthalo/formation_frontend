import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, BookOpen, CheckSquare } from 'lucide-react';
import type { FormationFormData, Instructor } from '../../types/database';

interface FormationFormProps {
  onSubmit: (formData: FormationFormData) => Promise<void>;
  instructors: Instructor[];
}

const FormationForm: React.FC<FormationFormProps> = ({ onSubmit, instructors }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormationFormData>({
    title: '',
    description: '',
    duration: '',
    maxParticipants: 10,
    startDate: '',
    endDate: '',
    location: '',
    instructorIds: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      navigate('/admin/formations');
    } catch (error) {
      console.error('Erreur lors de la création de la formation:', error);
    }
  };

  const handleInstructorToggle = (instructorId: string) => {
    setFormData(prev => {
      const instructorIds = prev.instructorIds;
      if (instructorIds.includes(instructorId)) {
        return {
          ...prev,
          instructorIds: instructorIds.filter(id => id !== instructorId)
        };
      } else {
        return {
          ...prev,
          instructorIds: [...instructorIds, instructorId]
        };
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Nouvelle Formation</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md">
        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de la formation
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="pl-10 input-field"
                    placeholder="Ex: Formation React Avancé"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field h-32 resize-none"
                  placeholder="Décrivez le contenu et les objectifs de la formation..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Détails logistiques */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Détails logistiques</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="pl-10 input-field"
                    placeholder="Ex: 35 heures"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre maximum de participants
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                    className="pl-10 input-field"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="pl-10 input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="pl-10 input-field"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="pl-10 input-field"
                    placeholder="Ex: Salle 302"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Formateurs */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4">Formateurs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {instructors.map(instructor => (
                <div
                  key={instructor.id}
                  onClick={() => handleInstructorToggle(instructor.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.instructorIds.includes(instructor.id)
                      ? 'border-primary bg-primary bg-opacity-5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">
                        {instructor.first_name} {instructor.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{instructor.email}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.instructorIds.includes(instructor.id)
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {formData.instructorIds.includes(instructor.id) && (
                        <CheckSquare className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  {instructor.specialties && instructor.specialties.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {instructor.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {instructors.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                Aucun formateur disponible. Veuillez d'abord ajouter des formateurs.
              </p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/formations')}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button type="submit" className="btn-primary flex items-center space-x-2">
            <CheckSquare className="h-5 w-5" />
            <span>Créer la formation</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormationForm;