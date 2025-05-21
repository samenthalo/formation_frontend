import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddParticipantModal = ({ allStagiaires, selectedStagiaires, onClose, onAdd, formation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [newlyAddedStagiaires, setNewlyAddedStagiaires] = useState(new Set());

  const filteredStagiaires = allStagiaires.filter(stagiaire =>
    (stagiaire.nom_stagiaire || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stagiaire.prenom_stagiaire || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStagiaires.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStagiaires.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage, endPage;

    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);
      if (currentPage <= halfMaxPagesToShow) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + halfMaxPagesToShow >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - halfMaxPagesToShow;
        endPage = currentPage + halfMaxPagesToShow;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  const handleCheckboxChange = (stagiaireId) => {
    onAdd(stagiaireId);
    setNewlyAddedStagiaires(prevNewlyAdded => {
      const newSet = new Set(prevNewlyAdded);
      if (selectedStagiaires.has(stagiaireId)) {
        newSet.delete(stagiaireId);
      } else {
        newSet.add(stagiaireId);
      }
      return newSet;
    });
  };

const sendEventToChronologie = async (typeEvenement, description, participants = []) => {
    if (!formation.id_session) {
      toast.error('ID de la session manquant');
      return;
    }

    const date = new Date();
    const dateEvenement = date.toISOString().replace('T', ' ').replace(/\..*$/, ''); // Format YYYY-MM-DD HH:MM:SS

    let detailedDescription = description;
    if (participants.length > 0) {
      detailedDescription += ': ' + participants.map(p => `${p.nom_stagiaire} ${p.prenom_stagiaire} (${p.email_stagiaire})`).join(', ');
    }

    const chronologieData = {
      idSession: formation.id_session,
      dateEvenement: dateEvenement,
      typeEvenement: typeEvenement,
      description: detailedDescription
    };

    console.log('Données envoyées à l\'API:', chronologieData); // Log des données envoyées

    try {
      const response = await axios.post('http://localhost:8000/chronologie/', chronologieData);
      if (response.status === 200) {
        console.log('Événement enregistré dans la chronologie avec succès.');
      } else {
        console.error('Erreur lors de l\'enregistrement de l\'événement dans la chronologie.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'événement dans la chronologie:', error.response ? error.response.data : error.message);
    }
  };


  const handleSaveAdditions = async () => {
    try {
      const addedStagiaires = Array.from(newlyAddedStagiaires);
      if (addedStagiaires.length > 0) {
        const addedStagiairesData = addedStagiaires.map(id => ({
          id: id,
          id_session: formation.id_session
        }));
        await axios.post('http://localhost:8000/inscriptions', addedStagiairesData);
        toast.success(`${addedStagiaires.length} participant(s) ajouté(s) avec succès.`);

        // Récupérer les détails des stagiaires ajoutés
        const addedParticipants = allStagiaires.filter(stagiaire => addedStagiaires.includes(stagiaire.id_stagiaire));
        await sendEventToChronologie('participant_added', `Ajout de ${addedStagiaires.length} participant(s) à la session`, addedParticipants);

        onClose();
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout des participants.');
      console.error('Erreur lors de l\'ajout des participants:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-3/4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Ajouter des participants</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            Fermer
          </button>
        </div>

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
              {currentItems.map(stagiaire => (
                <tr key={stagiaire.id_stagiaire} className="hover:bg-gray-100">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStagiaires.has(stagiaire.id_stagiaire)}
                      onChange={() => handleCheckboxChange(stagiaire.id_stagiaire)}
                      disabled={selectedStagiaires.has(stagiaire.id_stagiaire)}
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

        <div className="mt-4 flex justify-between items-center">
          <div>
            Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredStagiaires.length)} sur {filteredStagiaires.length} participants
          </div>
          <div className="flex">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 mx-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Précédent
            </button>
            {getPageNumbers().map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1 mx-1 rounded ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 mx-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={handleSaveAdditions} className="btn-primary">
            Enregistrer l'ajout
          </button>
        </div>
      </div>
    </div>
  );
};

const ParticipantModal = ({ formation, onClose, onSave, statut }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allStagiaires, setAllStagiaires] = useState([]);
  const [selectedStagiaires, setSelectedStagiaires] = useState(new Set());
  const [initialSelectedStagiaires, setInitialSelectedStagiaires] = useState(new Set());
  const [error, setError] = useState(null);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);

  const isOpcoValidated = statut === 'validé OPCO';

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

  const sendEventToChronologie = async (typeEvenement, description, participants = []) => {
    if (!formation.id_session) {
      toast.error('ID de la session manquant');
      return;
    }

    // Format de date attendu par le serveur pour un champ datetime
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const dateEvenement = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; // Format YYYY-MM-DD HH:MM:SS

    let detailedDescription = description;
    if (participants.length > 0) {
      detailedDescription += ': ' + participants.map(p => `${p.nom_stagiaire} ${p.prenom_stagiaire} (${p.email_stagiaire})`).join(', ');
    }

    const chronologieData = {
      idSession: formation.id_session,
      dateEvenement: dateEvenement,
      typeEvenement: typeEvenement,
      description: detailedDescription
    };

    console.log('Données envoyées à l\'API:', chronologieData); // Log des données envoyées

    try {
      const response = await axios.post('http://localhost:8000/chronologie/', chronologieData);
      if (response.status === 200) {
        console.log('Événement enregistré dans la chronologie avec succès.');
      } else {
        console.error('Erreur lors de l\'enregistrement de l\'événement dans la chronologie.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'événement dans la chronologie:', error.response ? error.response.data : error.message);
    }
  };


  const handleSave = async () => {
    if (!formation.id_session) {
      setError('L\'ID de la session est indéfini.');
      toast.error('L\'ID de la session est indéfini.');
      return;
    }

    const removedStagiaires = Array.from(initialSelectedStagiaires).filter(id => !selectedStagiaires.has(id));

    try {
      if (removedStagiaires.length > 0) {
        await axios.delete('http://localhost:8000/inscriptions', {
          data: {
            ids: removedStagiaires,
            id_session: formation.id_session
          }
        });

        const removedParticipants = allStagiaires.filter(stagiaire => removedStagiaires.includes(stagiaire.id_stagiaire));
        await sendEventToChronologie('participant_removed', `Suppression de ${removedStagiaires.length} participant(s) de la session`, removedParticipants);
        toast.success(`${removedStagiaires.length} participant(s) supprimé(s) avec succès.`);
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

  const handleRemoveParticipant = async (stagiaireId) => {
    try {
      // Suppression du participant
      await axios.delete('http://localhost:8000/inscriptions', {
        data: {
          ids: [stagiaireId],
          id_session: formation.id_session
        }
      });

      // Récupérer les détails du participant supprimé
      const removedParticipants = allStagiaires.filter(stagiaire => stagiaire.id_stagiaire === stagiaireId);

      // Envoyer l'événement à la chronologie
      await sendEventToChronologie('participant_removed', `Suppression d'un participant de la session`, removedParticipants);

      toast.success('Participant supprimé avec succès.');

      // Mettre à jour la liste des participants sélectionnés
      setSelectedStagiaires(prevSelected => {
        const newSelected = new Set(prevSelected);
        newSelected.delete(stagiaireId);
        return newSelected;
      });
    } catch (error) {
      setError('Erreur lors de la suppression du participant.');
      toast.error('Erreur lors de la suppression du participant.');
      console.error('Erreur lors de la suppression du participant:', error);
    }
  };


  const getRegisteredParticipants = () => {
    return allStagiaires.filter(stagiaire => selectedStagiaires.has(stagiaire.id_stagiaire));
  };

  const handleAddParticipant = (stagiaireId) => {
    setSelectedStagiaires(prevSelected => {
      const newSelected = new Set(prevSelected);
      newSelected.add(stagiaireId);
      return newSelected;
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-3/4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Participants de la formation: {formation.titre}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            Fermer
          </button>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Participants inscrits ({getRegisteredParticipants().length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getRegisteredParticipants().map(stagiaire => (
                  <tr key={stagiaire.id_stagiaire} className="hover:bg-gray-100">
                    <td className="px-6 py-4">{stagiaire.nom_stagiaire || 'N/A'}</td>
                    <td className="px-6 py-4">{stagiaire.prenom_stagiaire || 'N/A'}</td>
                    <td className="px-6 py-4">{stagiaire.email_stagiaire || 'N/A'}</td>
                    <td className="px-6 py-4">{stagiaire.telephone_stagiaire || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRemoveParticipant(stagiaire.id_stagiaire)}
                        className={`text-red-500 hover:text-red-700 ${isOpcoValidated ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isOpcoValidated}
                      >
                        Retirer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={() => setShowAddParticipantModal(true)}
            className={`flex items-center btn-primary ${isOpcoValidated ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isOpcoValidated}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un participant
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={handleSave} className="btn-primary">
            Enregistrer les modifications
          </button>
        </div>
      </div>

      {showAddParticipantModal && (
        <AddParticipantModal
          allStagiaires={allStagiaires}
          selectedStagiaires={selectedStagiaires}
          onClose={() => setShowAddParticipantModal(false)}
          onAdd={handleAddParticipant}
          formation={formation}
        />
      )}

      <ToastContainer />
    </div>
  );
};

export default ParticipantModal;
