import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Calendar, MapPin, Users, Building, Monitor } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Timeline from './modal_formationlist/Timeline';
import ActionsPopup from './modal_formationlist/ActionsPopup';
import SessionDetailsModal from './modal_formationlist/SessionDetailsModal';
import EditModal from './modal_formationlist/EditModal';
import ParticipantModal from './modal_formationlist/ParticipantModal';

const FormationList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormation, setSelectedFormation] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isActionsPopupOpen, setIsActionsPopupOpen] = useState(false);
  const [selectedFormationData, setSelectedFormationData] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [selectedSession, setSelectedSession] = useState(null);
  const [presenceSheetsSent, setPresenceSheetsSent] = useState(0);
  const [signaturesCount, setSignaturesCount] = useState(0);
  const [quizzSent, setQuizzSent] = useState(0);
  const [quizzResponses, setQuizzResponses] = useState(0);
  const [satisfactionSent, setSatisfactionSent] = useState(0);
  const [satisfactionResponses, setSatisfactionResponses] = useState(0);
  const [coldQuestionnaireSent, setColdQuestionnaireSent] = useState(0);
  const [coldQuestionnaireResponses, setColdQuestionnaireResponses] = useState(0);
  const [opcoQuestionnaireSent, setOpcoQuestionnaireSent] = useState(0);
  const [opcoQuestionnaireResponses, setOpcoQuestionnaireResponses] = useState(0);
  const [emailsSent, setEmailsSent] = useState(0);
  const [formations, setFormations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await axios.get('http://localhost:8000/sessionformation');
        console.log('Réponse du backend :', response.data);

        if (Array.isArray(response.data)) {
          setFormations(response.data);
        } else {
          setError('Les données récupérées ne sont pas au format attendu.');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des sessions:', error);
        setError('Erreur lors de la récupération des sessions.');
      }
    };

    fetchFormations();
  }, []);

  const handleEdit = (formation) => {
    setSelectedFormationData(formation);
    setIsEditModalOpen(true);
  };

  const handleParticipants = (formation) => {
    setSelectedFormationData(formation);
    setIsParticipantModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      try {
        await axios.delete(`http://localhost:8000/sessionformation/delete/${id}`);
        setFormations(formations.filter(f => f.id_session !== id));
        toast.success('Formation supprimée avec succès.');
      } catch (error) {
        console.error('Erreur lors de la suppression de la session:', error);
        toast.error('Erreur lors de la suppression de la session.');
      }
    }
  };

  const handleShowDetails = (formation) => {
    setSelectedFormationData(formation);
    setIsDetailsModalOpen(true);
  };

  const handleShowTimelineFromSession = (formation) => {
    setSelectedSession(formation);
    setViewMode('timeline');
  };

  const handleCreateSession = () => {
    navigate('/admin/formations/new', { state: { origin: 'sessions' } });
  };

  const handleViewList = () => {
    setViewMode('list');
    setSelectedSession(null);
  };

  const handleSendEmails = (formation) => {
    if (formation.responsable && formation.responsable.email) {
      console.log(`Envoi d'un email au responsable ${formation.responsable.email} pour la formation "${formation.titre}".`);
      alert(`Email envoyé au responsable : ${formation.responsable.email}`);
    } else {
      alert(`Aucun responsable défini pour la formation "${formation.titre}".`);
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Liste des Sessions</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleViewList}
            className={`btn-secondary ${viewMode === 'list' ? 'bg-primary text-white' : ''}`}
          >
            Vue Liste
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`btn-secondary ${viewMode === 'timeline' ? 'bg-primary text-white' : ''}`}
          >
            Vue Chronologie
          </button>
          <Link to="/admin/formations/new" className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Ajouter une session</span>
          </Link>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Rechercher une session..."
                    className="pl-10 input-field w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button className="btn-secondary flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filtres</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lieu / Visio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formateurs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(formations) && formations.map((formation) => (
                  <tr
                    key={formation.id_session}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleShowDetails(formation)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formation.titre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formation.nb_heures} heures
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formation.creneaux.map(creneau => (
                          <div key={creneau.id} className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {new Date(creneau.jour).toLocaleDateString()} de {creneau.heure_debut} à {creneau.heure_fin}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        {formation.mode === 'presentiel' ? (
                          <>
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{formation.lieu}</span>
                          </>
                        ) : (
                          <>
                            <Monitor className="h-4 w-4 text-gray-400" />
                            <span>{formation.lien || 'Lien non disponible'}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">
                          {formation.formateur.prenom} {formation.formateur.nom}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>
                          {formation.nb_inscrits}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        {formation.mode === 'presentiel' ? (
                          <Building className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Monitor className="h-4 w-4 text-gray-400" />
                        )}
                        <span>{formation.mode === 'presentiel' ? 'Présentiel' : 'Distanciel'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleParticipants(formation);
                        }}
                        className="text-primary hover:text-primary-dark mr-3"
                      >
                        Participants
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(formation);
                        }}
                        className="text-primary hover:text-primary-dark mr-3"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(formation.id_session);
                        }}
                        className="text-red-600 hover:text-red-800 mr-3"
                      >
                        Supprimer
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowTimelineFromSession(formation);
                        }}
                        className="text-gray-600 hover:text-gray-800 mr-3"
                      >
                        Chronologie
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFormationData(formation);
                          setIsActionsPopupOpen(true);
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        Voir toutes les actions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Timeline selectedSession={selectedSession} />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedFormationData && (
        <EditModal
          formation={selectedFormationData}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedFormationData(null);
          }}
          onSave={(updatedFormation) => {
            setFormations(prev => prev.map(f =>
              f.id_session === updatedFormation.id_session ? updatedFormation : f
            ));
            setIsEditModalOpen(false);
            setSelectedFormationData(null);
            toast.success('Formation modifiée avec succès.');
          }}
        />
      )}

      {isParticipantModalOpen && selectedFormationData && (
        <ParticipantModal
          formation={selectedFormationData}
          onClose={() => {
            setIsParticipantModalOpen(false);
            setSelectedFormationData(null);
          }}
          onSave={(selectedStagiaires) => {
            // Mettre à jour les participants de la formation avec les stagiaires sélectionnés
            const updatedFormation = {
              ...selectedFormationData,
              participants: selectedStagiaires.map(id => ({ id_inscription: id })),
            };
            setFormations(prev => prev.map(f =>
              f.id_session === updatedFormation.id_session ? updatedFormation : f
            ));
            setIsParticipantModalOpen(false);
            setSelectedFormationData(null);
          }}
        />
      )}

      {/* Session Details Modal */}
      {isDetailsModalOpen && selectedFormationData && (
        <SessionDetailsModal
          formation={selectedFormationData}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedFormationData(null);
          }}
          presenceSheetsSent={presenceSheetsSent}
          setPresenceSheetsSent={setPresenceSheetsSent}
          signaturesCount={signaturesCount}
          setSignaturesCount={setSignaturesCount}
          quizzSent={quizzSent}
          setQuizzSent={setQuizzSent}
          quizzResponses={quizzResponses}
          setQuizzResponses={setQuizzResponses}
          satisfactionSent={satisfactionSent}
          setSatisfactionSent={setSatisfactionSent}
          satisfactionResponses={satisfactionResponses}
          setSatisfactionResponses={setSatisfactionResponses}
          coldQuestionnaireSent={coldQuestionnaireSent}
          setColdQuestionnaireSent={setColdQuestionnaireSent}
          coldQuestionnaireResponses={coldQuestionnaireResponses}
          setColdQuestionnaireResponses={setColdQuestionnaireResponses}
          opcoQuestionnaireSent={opcoQuestionnaireSent}
          setOpcoQuestionnaireSent={setOpcoQuestionnaireSent}
          opcoQuestionnaireResponses={opcoQuestionnaireResponses}
          setOpcoQuestionnaireResponses={setOpcoQuestionnaireResponses}
        />
      )}

      {/* Actions Popup */}
      {isActionsPopupOpen && selectedFormationData && (
        <ActionsPopup
          onClose={() => setIsActionsPopupOpen(false)}
          formation={selectedFormationData}
          presenceSheetsSent={presenceSheetsSent}
          setPresenceSheetsSent={setPresenceSheetsSent}
          signaturesCount={signaturesCount}
          setSignaturesCount={setSignaturesCount}
          quizzSent={quizzSent}
          setQuizzSent={setQuizzSent}
          quizzResponses={quizzResponses}
          setQuizzResponses={setQuizzResponses}
          satisfactionSent={satisfactionSent}
          setSatisfactionSent={setSatisfactionSent}
          satisfactionResponses={satisfactionResponses}
          setSatisfactionResponses={setSatisfactionResponses}
          coldQuestionnaireSent={coldQuestionnaireSent}
          setColdQuestionnaireSent={setColdQuestionnaireSent}
          coldQuestionnaireResponses={coldQuestionnaireResponses}
          setColdQuestionnaireResponses={setColdQuestionnaireResponses}
          opcoQuestionnaireSent={opcoQuestionnaireSent}
          setOpcoQuestionnaireSent={setOpcoQuestionnaireSent}
          opcoQuestionnaireResponses={opcoQuestionnaireResponses}
          setOpcoQuestionnaireResponses={setOpcoQuestionnaireResponses}
          emailsSent={emailsSent}
          setEmailsSent={setEmailsSent}
        />
      )}
    </div>
  );
};

export default FormationList;
