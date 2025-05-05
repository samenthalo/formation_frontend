import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ParticipantModal = ({ formation, onClose, onSave }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allStagiaires, setAllStagiaires] = useState([]);
  const [selectedStagiaires, setSelectedStagiaires] = useState(new Set());
  const [initialSelectedStagiaires, setInitialSelectedStagiaires] = useState(new Set());
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStagiaires = async () => {
      try {
        const response = await axios.get('http://localhost:8000/stagiaires');
        if (Array.isArray(response.data)) {
          setAllStagiaires(response.data);

          // Fetch the participants of the current session
          const sessionResponse = await axios.get(`http://localhost:8000/inscriptions/${formation.id_session}`);
          const initialSelected = new Set(sessionResponse.data.map(p => p.stagiaire.id_stagiaire));
          setSelectedStagiaires(initialSelected);
          setInitialSelectedStagiaires(initialSelected);
        } else {
          setError('La réponse du backend n\'est pas un tableau.');
        }
      } catch (error) {
        setError('Erreur lors de la récupération des stagiaires.');
        console.error('Erreur lors de la récupération des stagiaires:', error);
      }
    };

    fetchStagiaires();
  }, [formation]);

  const handleCheckboxChange = (stagiaireId) => {
    setSelectedStagiaires(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(stagiaireId)) {
        newSelected.delete(stagiaireId);
      } else {
        newSelected.add(stagiaireId);
      }
      return newSelected;
    });
  };

  const handleSave = async () => {
    if (!formation.id_session) {
      setError('L\'ID de la session est indéfini.');
      toast.error('L\'ID de la session est indéfini.');
      return;
    }

    const addedStagiaires = Array.from(selectedStagiaires).filter(id => !initialSelectedStagiaires.has(id));
    const removedStagiaires = Array.from(initialSelectedStagiaires).filter(id => !selectedStagiaires.has(id));

    try {
      if (addedStagiaires.length > 0) {
        const addedStagiairesData = addedStagiaires.map(id => ({
          id: id,
          id_session: formation.id_session
        }));
        await axios.post('http://localhost:8000/inscriptions', addedStagiairesData);
      }

      if (removedStagiaires.length > 0) {
        await axios.delete('http://localhost:8000/inscriptions', {
          data: {
            ids: removedStagiaires,
            id_session: formation.id_session
          }
        });
      }

      onSave(Array.from(selectedStagiaires));
      toast.success('Modifications enregistrées avec succès.');
      onClose();
    } catch (error) {
      setError('Erreur lors de l\'enregistrement des modifications.');
      toast.error('Erreur lors de l\'enregistrement des modifications.');
      console.error('Erreur lors de l\'enregistrement des modifications:', error);
    }
  };

  const filteredStagiaires = allStagiaires.filter(stagiaire =>
    (stagiaire.nom_stagiaire || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stagiaire.prenom_stagiaire || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-1/2 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Participants de la formation: {formation.titre}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            Fermer
          </button>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher un participant..."
              className="pl-10 input-field w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sélectionner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prénom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStagiaires.map(stagiaire => (
                <tr key={stagiaire.id_stagiaire} className="hover:bg-gray-100">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStagiaires.has(stagiaire.id_stagiaire)}
                      onChange={() => handleCheckboxChange(stagiaire.id_stagiaire)}
                    />
                  </td>
                  <td className="px-6 py-4">{stagiaire.nom_stagiaire || 'N/A'}</td>
                  <td className="px-6 py-4">{stagiaire.prenom_stagiaire || 'N/A'}</td>
                  <td className="px-6 py-4">{stagiaire.email_stagiaire || 'N/A'}</td>
                  <td className="px-6 py-4">{stagiaire.telephone_stagiaire || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={handleSave} className="btn-primary">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantModal;
