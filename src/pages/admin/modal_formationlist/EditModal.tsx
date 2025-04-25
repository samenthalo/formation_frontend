import React, { useState, useEffect } from 'react';
import { UserCircle, Search, Calendar, Clock, MapPin, BookOpen, CheckSquare, Building, Monitor, XCircle, PlusCircle, Trash } from 'lucide-react';
import axios from 'axios';

const EditModal = ({ formation, onClose, onSave }) => {
  const [editedFormation, setEditedFormation] = useState(() => {
    console.log('Initial formation data:', formation);
    return {
      id_session: formation.id_session,
      titre: formation.titre,
      description: formation.description,
      lieu: formation.lieu,
      nb_heures: formation.nb_heures,
      statut: formation.statut,
      nb_inscrits: formation.nb_inscrits,
      formation: formation.formation,
      formateur: formation.formateur,
      responsable_nom: formation.responsable_nom,
      responsable_prenom: formation.responsable_prenom,
      responsable_telephone: formation.responsable_telephone,
      responsable_email: formation.responsable_email,
      mode: formation.mode,
      lien: formation.lien,
      creneaux: formation.creneaux || [{ jour: '', heure_debut: '', heure_fin: '', id_formateur: formation.formateur.id_formateur }],
    };
  });

  const [formations, setFormations] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await fetch('http://localhost:8000/formations');
        if (!response.ok) {
          throw new Error(`Erreur HTTP! Statut: ${response.status}`);
        }
        const data = await response.json();
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
        setInstructors(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des formateurs:', error);
      }
    };

    fetchFormations();
    fetchInstructors();
  }, []);

  useEffect(() => {
    console.log('Edited formation state:', editedFormation);
  }, [editedFormation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedFormation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormateurChange = (e) => {
    const { name, value } = e.target;
    setEditedFormation((prev) => {
      const updatedFormateur = { ...prev.formateur, [name]: value };
      const updatedCreneaux = prev.creneaux.map(creneau => ({
        ...creneau,
        id_formateur: value,
      }));
      return {
        ...prev,
        formateur: updatedFormateur,
        creneaux: updatedCreneaux,
      };
    });
  };

  const handleResponsableChange = (e) => {
    const { name, value } = e.target;
    setEditedFormation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    setEditedFormation((prev) => {
      const creneaux = [...prev.creneaux];
      creneaux[index] = { ...creneaux[index], [field]: value };
      return { ...prev, creneaux };
    });
  };

  const handleAddSchedule = () => {
    setEditedFormation((prev) => ({
      ...prev,
      creneaux: [...prev.creneaux, { jour: '', heure_debut: '', heure_fin: '', id_formateur: prev.formateur.id_formateur }],
    }));
  };

  const handleRemoveSchedule = (index) => {
    setEditedFormation((prev) => {
      const creneaux = [...prev.creneaux];
      creneaux.splice(index, 1);
      return { ...prev, creneaux };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editedFormation.mode === 'distanciel' && !editedFormation.lien) {
      setError('Le lien de visio est obligatoire pour les sessions en distanciel.');
      return;
    }

    if (editedFormation.mode === 'presentiel' && !editedFormation.lieu) {
      setError('Le lieu est obligatoire pour les sessions en présentiel.');
      return;
    }

    const hasError = editedFormation.creneaux.some(
      (item) => new Date(`${item.jour}T${item.heure_fin}`) < new Date(`${item.jour}T${item.heure_debut}`)
    );

    if (hasError) {
      setError("L'heure de fin ne peut pas être antérieure à l'heure de début pour une même date.");
      return;
    }

    const totalHours = editedFormation.creneaux.reduce((total, creneau) => {
      const start = new Date(`${creneau.jour}T${creneau.heure_debut}`);
      const end = new Date(`${creneau.jour}T${creneau.heure_fin}`);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Convertir en heures
      return total + duration;
    }, 0);

    const formData = new FormData();
    formData.append('titre', editedFormation.titre);
    formData.append('description', editedFormation.description);
    formData.append('lieu', editedFormation.lieu);
    formData.append('nb_heures', totalHours);
    formData.append('statut', editedFormation.statut);
    formData.append('nb_inscrits', editedFormation.nb_inscrits);
    formData.append('formation', editedFormation.formation);
    formData.append('formateur', editedFormation.formateur.id_formateur);
    formData.append('responsable_nom', editedFormation.responsable_nom);
    formData.append('responsable_prenom', editedFormation.responsable_prenom);
    formData.append('responsable_telephone', editedFormation.responsable_telephone);
    formData.append('responsable_email', editedFormation.responsable_email);
    formData.append('mode', editedFormation.mode);
    formData.append('lien', editedFormation.lien);

    editedFormation.creneaux.forEach((creneau, index) => {
      formData.append(`creneaux[${index}][jour]`, creneau.jour);
      formData.append(`creneaux[${index}][heure_debut]`, creneau.heure_debut);
      formData.append(`creneaux[${index}][heure_fin]`, creneau.heure_fin);
      formData.append(`creneaux[${index}][id_formateur]`, creneau.id_formateur);
    });

    // Log des données envoyées
    for (let pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }

    try {
      const response = await axios.post(`http://localhost:8000/sessionformation/${editedFormation.id_session}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
      onSave(response.data);
      setError(null); // Réinitialiser l'erreur en cas de succès
    } catch (error) {
      console.error('Error updating session:', error);
      if (error.response) {
        // Afficher l'erreur retournée par le serveur
        setError(`Erreur lors de la mise à jour de la session: ${error.response.data.error || error.response.statusText}`);
      } else {
        setError('Erreur lors de la mise à jour de la session.');
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-md w-full max-w-6xl mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Modifier la Session</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="titre"
                  value={editedFormation.titre}
                  onChange={handleChange}
                  className="pl-10 input-field w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="description"
                  value={editedFormation.description}
                  onChange={handleChange}
                  className="pl-10 input-field w-full"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Formation</label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="formation"
                  value={editedFormation.formation}
                  onChange={handleChange}
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
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Formateur par défaut</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="id_formateur"
                  value={editedFormation.formateur.id_formateur}
                  onChange={handleFormateurChange}
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Planning</label>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure de début</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure de fin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {editedFormation.creneaux.map((item, index) => (
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
                          onChange={(e) => handleScheduleChange(index, 'id_formateur', e.target.value)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d'inscrits</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCircle className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="nb_inscrits"
                  value={editedFormation.nb_inscrits}
                  onChange={handleChange}
                  className="pl-10 input-field w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="lieu"
                  value={editedFormation.lieu}
                  onChange={handleChange}
                  className="pl-10 input-field w-full"
                  required={editedFormation.mode === 'presentiel'}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {editedFormation.mode === 'presentiel' ? (
                    <Building className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Monitor className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <select
                  name="mode"
                  value={editedFormation.mode}
                  onChange={handleChange}
                  className="pl-10 input-field w-full"
                  required
                >
                  <option value="presentiel">Présentiel</option>
                  <option value="distanciel">Distanciel</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lien de visio</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  name="lien"
                  value={editedFormation.lien}
                  onChange={handleChange}
                  className="pl-10 input-field w-full"
                  required={editedFormation.mode === 'distanciel'}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  name="responsable_prenom"
                  value={editedFormation.responsable_prenom}
                  onChange={handleResponsableChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  name="responsable_nom"
                  value={editedFormation.responsable_nom}
                  onChange={handleResponsableChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="responsable_email"
                  value={editedFormation.responsable_email}
                  onChange={handleResponsableChange}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  name="responsable_telephone"
                  value={editedFormation.responsable_telephone}
                  onChange={handleResponsableChange}
                  className="input-field w-full"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg mt-4">
              <XCircle className="h-5 w-5 inline-block mr-2" />
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
