import React, { useState, useEffect } from 'react';
import { UserCircle, Search, Calendar, Clock, MapPin, BookOpen, CheckSquare, Building, Monitor, XCircle, PlusCircle, Trash } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface SessionFormData {
  titre: string;
  description: string;
  lieu: string;
  nb_heures: number;
  statut: string;
  nb_inscrits: number;
  formation: string; // Changé pour stocker uniquement l'ID
  formateur: string; // Changé pour stocker uniquement l'ID
  creneaux: { jour: string; heure_debut: string; heure_fin: string; id_formateur: string }[];
  mode: 'presentiel' | 'distanciel';
  lien: string;
  responsable_nom: string;
  responsable_prenom: string;
  responsable_telephone: string;
  responsable_email: string;
}

interface Formation {
  id_formation: string; // Utiliser id_formation
  titre: string;
  description: string;
}

interface Instructor {
  id_formateur: string; // Utiliser id_formateur
  nom: string;
  prenom: string;
  tags: string[];
}

const SessionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [formations, setFormations] = useState<Formation[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<SessionFormData>({
    titre: '',
    description: '',
    lieu: '',
    nb_heures: 0,
    statut: 'créée', // Définir le statut à "créée" par défaut
    nb_inscrits: 0, // Ajouter un champ pour le nombre d'inscrits
    formation: '', // Changé pour stocker uniquement l'ID
    formateur: '', // Changé pour stocker uniquement l'ID
    creneaux: [{ jour: '', heure_debut: '', heure_fin: '', id_formateur: '' }],
    mode: 'presentiel',
    lien: '',
    responsable_nom: '',
    responsable_prenom: '',
    responsable_telephone: '',
    responsable_email: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await fetch('http://localhost:8000/formations');
        if (!response.ok) {
          throw new Error(`Erreur HTTP! Statut: ${response.status}`);
        }
        const data = await response.json();
        console.log('Formations récupérées:', data); // Ajoute ce log
        setFormations(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des formations:', error);
      }
    };

    const fetchInstructors = async () => {
      try {
        const response = await fetch('http://localhost:8000/formateur');
        if (!response.ok) {
          throw new Error(`Erreur HTTP! Statut: ${response.status}`);
        }
        const data = await response.json();
        console.log('Formateurs récupérés:', data); // Ajoute ce log
        setInstructors(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des formateurs:', error);
      }
    };

    fetchFormations();
    fetchInstructors();
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Vérification si le mode est "distanciel" et que le lien est vide
    if (formData.mode === 'distanciel' && !formData.lien) {
      setError('Le lien de visio est obligatoire pour les sessions en distanciel.');
      return;
    }
  
    // Vérification si le mode est "présentiel" et que le lieu est vide
    if (formData.mode === 'presentiel' && !formData.lieu) {
      setError('Le lieu est obligatoire pour les sessions en présentiel.');
      return;
    }
  
    const hasError = formData.creneaux.some(
      item => new Date(`${item.jour}T${item.heure_fin}`) < new Date(`${item.jour}T${item.heure_debut}`)
    );
  
    if (hasError) {
      setError('L\'heure de fin ne peut pas être antérieure à l\'heure de début pour une même date.');
      return;
    }
  
    // Calculer le nombre d'heures
    const totalHours = formData.creneaux.reduce((total, creneau) => {
      const start = new Date(`${creneau.jour}T${creneau.heure_debut}`);
      const end = new Date(`${creneau.jour}T${creneau.heure_fin}`);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Convertir en heures
      return total + duration;
    }, 0);
  
    const formDataToSend = new FormData();
    formDataToSend.append('titre', formData.titre);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('lieu', formData.lieu);
    formDataToSend.append('nb_heures', totalHours.toString());
    formDataToSend.append('statut', formData.statut);
    formDataToSend.append('nb_inscrits', formData.nb_inscrits.toString());
    formDataToSend.append('formation', formData.formation); // Ajouter l'ID de la formation
    formDataToSend.append('formateur', formData.formateur); // Ajouter l'ID du formateur par défaut
    formDataToSend.append('mode', formData.mode);
    formDataToSend.append('lien', formData.lien);
    formDataToSend.append('responsable_nom', formData.responsable_nom);
    formDataToSend.append('responsable_prenom', formData.responsable_prenom);
    formDataToSend.append('responsable_telephone', formData.responsable_telephone);
    formDataToSend.append('responsable_email', formData.responsable_email);
  
    formData.creneaux.forEach((creneau, index) => {
      formDataToSend.append(`creneaux[${index}][jour]`, creneau.jour);
      formDataToSend.append(`creneaux[${index}][heure_debut]`, creneau.heure_debut);
      formDataToSend.append(`creneaux[${index}][heure_fin]`, creneau.heure_fin);
      formDataToSend.append(`creneaux[${index}][id_formateur]`, creneau.id_formateur || formData.formateur); // Utiliser id_formateur spécifique au créneau ou par défaut
    });
  
    console.log('Données envoyées:', formDataToSend); // Ajoute ce log
  
    try {
      const response = await fetch('http://localhost:8000/sessionformation/create', {
        method: 'POST',
        body: formDataToSend,
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('Session créée:', result);
        navigate('/admin/formations');
      } else {
        const errorData = await response.json();
        console.error('Erreur du serveur:', errorData); // Ajoute ce log
        setError(errorData.message || 'Erreur lors de la création de la session.');
      }
    } catch (error) {
      console.error('Erreur réseau:', error); // Ajoute ce log
      setError('Erreur réseau. Veuillez réessayer plus tard.');
    }
  };

  const handleAddSchedule = () => {
    setFormData(prevData => ({
      ...prevData,
      creneaux: [...prevData.creneaux, { jour: '', heure_debut: '', heure_fin: '', id_formateur: prevData.formateur }]
    }));
  };

  const handleRemoveSchedule = (index: number) => {
    setFormData(prevData => {
      const creneaux = [...prevData.creneaux];
      creneaux.splice(index, 1);
      return { ...prevData, creneaux };
    });
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    setFormData(prevData => {
      const creneaux = [...prevData.creneaux];
      creneaux[index] = { ...creneaux[index], [field]: value };
      return { ...prevData, creneaux };
    });
  };

  const handleDefaultInstructorChange = (value: string) => {
    setFormData(prevData => {
      const updatedCreneaux = prevData.creneaux.map(item => ({
        ...item,
        id_formateur: value
      }));
      return { ...prevData, creneaux: updatedCreneaux, formateur: value }; // Mettre à jour formateur avec l'ID
    });
  };

  const handleShowSummary = (formation: Formation) => {
    setSelectedFormation(formation);
    setShowSummary(true);
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    setSelectedFormation(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{id ? 'Modifier' : 'Nouvelle'} Session</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md">
        <div className="p-6 space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                className="pl-10 input-field w-full"
                placeholder="Titre de la session"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="pl-10 input-field w-full"
                placeholder="Description de la session"
                required
              />
            </div>
          </div>

          {/* Formation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formation
            </label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={formData.formation}
                onChange={(e) => {
                  console.log('ID de la formation sélectionnée:', e.target.value); // Ajoute ce log
                  setFormData({ ...formData, formation: e.target.value });
                }}
                className="pl-10 input-field w-full"
                required
              >
                <option value="">Sélectionnez une formation</option>
                {formations.map((formation) => (
                  <option key={formation.id_formation} value={formation.id_formation}>
                    {formation.titre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleShowSummary(formations.find(f => f.id_formation === formData.formation)!)}
                className="absolute right-3 text-gray-400 hover:text-gray-600"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Formateur par défaut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formateur par défaut
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircle className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={formData.formateur}
                onChange={(e) => {
                  console.log('ID du formateur sélectionné:', e.target.value); // Ajoute ce log
                  handleDefaultInstructorChange(e.target.value);
                }}
                className="pl-10 input-field w-full"
                required
              >
                <option value="">Sélectionnez un formateur</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id_formateur} value={instructor.id_formateur}>
                    {instructor.nom} {instructor.prenom} {Array.isArray(instructor.tags) ? `(${instructor.tags.join(', ')})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Planning */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Planning
            </label>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Heure de début
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Heure de fin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Formateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.creneaux.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="date"
                          value={item.jour}
                          onChange={(e) => handleScheduleChange(index, 'jour', e.target.value)}
                          className="input-field w-full"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="time"
                          value={item.heure_debut}
                          onChange={(e) => handleScheduleChange(index, 'heure_debut', e.target.value)}
                          className="input-field w-full"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="time"
                          value={item.heure_fin}
                          onChange={(e) => handleScheduleChange(index, 'heure_fin', e.target.value)}
                          className="input-field w-full"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={item.id_formateur}
                          onChange={(e) => {
                            console.log('ID du formateur sélectionné pour le créneau:', e.target.value); // Ajoute ce log
                            handleScheduleChange(index, 'id_formateur', e.target.value);
                          }}
                          className="input-field w-full"
                          required
                        >
                          <option value="">Sélectionnez un formateur</option>
                          {instructors.map((instructor) => (
                            <option key={instructor.id_formateur} value={instructor.id_formateur}>
                              {instructor.nom} {instructor.prenom} {Array.isArray(instructor.tags) ? `(${instructor.tags.join(', ')})` : ''}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleRemoveSchedule(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={handleAddSchedule}
              className="flex items-center text-blue-500 hover:text-blue-700 mt-4"
            >
              <PlusCircle className="h-5 w-5 mr-1" />
              Ajouter une date
            </button>
          </div>

          {/* Nombre d'inscrits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre d'inscrits
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircle className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={formData.nb_inscrits}
                onChange={(e) => setFormData({ ...formData, nb_inscrits: parseInt(e.target.value) })}
                className="pl-10 input-field w-full"
                placeholder="Nombre d'inscrits"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg mt-4">
              <XCircle className="h-5 w-5 inline-block mr-2" />
              {error}
            </div>
          )}

          {/* Lieu et Mode */}
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.lieu}
                  onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                  className="pl-10 input-field w-full"
                  placeholder="Ex: Salle 302"
                  required={formData.mode === 'presentiel'} // Champ obligatoire uniquement si le mode est "présentiel"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {formData.mode === 'presentiel' ? (
                    <Building className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Monitor className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value as 'presentiel' | 'distanciel' })}
                  className="pl-10 input-field w-full"
                  required
                >
                  <option value="presentiel">Présentiel</option>
                  <option value="distanciel">Distanciel</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lien de visio et Responsable de formation */}
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lien de visio
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={formData.lien}
                  onChange={(e) => setFormData({ ...formData, lien: e.target.value })}
                  className="pl-10 input-field w-full"
                  placeholder="Ex: https://meet.google.com/abc-defg-hij"
                  required={formData.mode === 'distanciel'} // Champ obligatoire uniquement si le mode est "distanciel"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsable
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.responsable_prenom}
                    onChange={(e) => setFormData({ ...formData, responsable_prenom: e.target.value })}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.responsable_nom}
                    onChange={(e) => setFormData({ ...formData, responsable_nom: e.target.value })}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.responsable_email}
                    onChange={(e) => setFormData({ ...formData, responsable_email: e.target.value })}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.responsable_telephone}
                    onChange={(e) => setFormData({ ...formData, responsable_telephone: e.target.value })}
                    className="input-field w-full"
                    required
                  />
                </div>
              </div>
            </div>
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
            <span>{id ? 'Mettre à jour' : 'Créer'} la session</span>
          </button>
        </div>
      </form>

      {/* Résumé de la formation */}
      {showSummary && selectedFormation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Résumé de la formation</h2>
              <button onClick={handleCloseSummary} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-700">{selectedFormation.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionForm;
