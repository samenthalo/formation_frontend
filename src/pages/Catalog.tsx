import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Clock, BookOpen, Users, Monitor, Home, X, Accessibility, Edit, Calendar, Target, Globe, Book, CheckCircle, FileText, List, Plus, Trash, ChevronLeft, ChevronRight } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import api from '../services/api';
import type { Formation } from '../types/database';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DetailsModal from './admin/modal_catalog/DetailsModal';
import EditModal from './admin/modal_catalog/EditModal';
import AddModal from './admin/modal_catalog/AddModal';

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [expandedFormationId, setExpandedFormationId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [programme, setProgramme] = useState('');
  const [detailsKey, setDetailsKey] = useState(0);
  const modalRef = useRef(null);
  const contentToExportRef = useRef(null);

  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const formationsPerPage = 27;

  useEffect(() => {
    const fetchFormationsAndSessions = async () => {
      try {
        const formationsResponse = await api.get('/formations');
        if (!Array.isArray(formationsResponse.data)) {
          setFormations([]);
          return;
        }

        setFormations(formationsResponse.data);

        const sessionPromises = formationsResponse.data.map(async (formation: any) => {
          const sessionsResponse = await api.get(`/sessionformation/formation/${formation.id_formation}`);
          return { formationId: formation.id_formation, sessions: sessionsResponse.data };
        });

        const sessionsData = await Promise.all(sessionPromises);

        const updatedFormations = formationsResponse.data.map((formation: any) => {
          const associatedSessions = sessionsData.find((sessionData: any) => sessionData.formationId === formation.id_formation);
          return { ...formation, sessions: associatedSessions ? associatedSessions.sessions : [] };
        });

        setFormations(updatedFormations);

      } catch (error) {
        toast.error('Erreur lors du chargement des formations.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormationsAndSessions();
  }, []);

  useEffect(() => {
    if (selectedFormation) {
      setProgramme(selectedFormation.programme || '');
    }
  }, [selectedFormation]);

  const createFormation = async (newFormation: any) => {
    try {
      const response = await api.post('/formations/', newFormation);
      setFormations((prevFormations) => [...prevFormations, response.data]);
      toast.success('Formation créée avec succès!');
    } catch (error) {
      toast.error('Erreur lors de la création de la formation.');
    }
  };

  const durations = [
    { id: 'all', name: 'Toutes les durées' },
    { id: '0-4', name: '0-4 heures' },
    { id: '5-8', name: '5-8 heures' },
    { id: '9-12', name: '9-12 heures' },
    { id: '13+', name: '13 heures et plus' }
  ];

  const categories = [
    { id: 'all', name: 'Toutes les catégories' },
    { id: 'administrateur', name: 'Administrateur' },
    { id: 'utilisateur', name: 'Utilisateur' },
  ];

  const getDurationCategory = (duration: string): string => {
    const hours = parseInt(duration);
    if (hours <= 7) return 'short';
    if (hours <= 21) return 'medium';
    return 'long';
  };

  const filteredFormations = Array.isArray(formations) ? formations.filter(formation => {
    if (!formation) return false;
    const matchesSearch = formation.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          formation.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const formationDuration = parseInt(formation.duree_heures, 10);
    let matchesDuration = true;
    if (selectedDuration !== 'all') {
      const [min, max] = selectedDuration.split('-').map(Number);
      if (selectedDuration === '13+') {
        matchesDuration = formationDuration >= 13;
      } else {
        matchesDuration = formationDuration >= min && formationDuration <= max;
      }
    }

    const matchesCategory = selectedCategory === 'all' ||
                            formation.categorie === selectedCategory;

    return matchesSearch && matchesDuration && matchesCategory;
  }) : [];

  // Logique de pagination
  const indexOfLastFormation = currentPage * formationsPerPage;
  const indexOfFirstFormation = indexOfLastFormation - formationsPerPage;
  const currentFormations = filteredFormations.slice(indexOfFirstFormation, indexOfLastFormation);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredFormations.length / formationsPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput, 10);
    if (!isNaN(pageNumber)) {
      paginate(pageNumber);
    }
  };

  const handleOpenDetails = (formation: Formation) => {
    setSelectedFormation(formation);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedFormation(null);
  };

  const handleDownloadPDF = () => {
    if (contentToExportRef.current) {
      const opt = {
        margin: 1,
        filename: `${selectedFormation?.titre}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().from(contentToExportRef.current).set(opt).save();
    }
  };

  const handleEditFormation = (formation: Formation) => {
    setSelectedFormation(formation);
    setProgramme(formation.programme || '');
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setFile(null);
    setProgramme(''); // Réinitialiser le programme
  };

  const handleSaveEdit = async (updatedFormation: Formation) => {
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('titre', updatedFormation.titre);
      formData.append('description', updatedFormation.description);
      formData.append('prix_unitaire_ht', updatedFormation.prix_unitaire_ht.toString());
      formData.append('nb_participants_max', updatedFormation.nb_participants_max.toString());
      formData.append('est_active', updatedFormation.est_active.toString());
      formData.append('type_formation', updatedFormation.type_formation);
      formData.append('duree_heures', updatedFormation.duree_heures.toString());
      formData.append('categorie', updatedFormation.categorie);
      formData.append('programme', programme);
      formData.append('multi_jour', updatedFormation.multi_jour.toString());
      formData.append('cible', updatedFormation.cible);
      formData.append('moyens_pedagogiques', updatedFormation.moyens_pedagogiques);
      formData.append('pre_requis', updatedFormation.pre_requis);
      formData.append('delai_acces', updatedFormation.delai_acces);
      formData.append('supports_pedagogiques', updatedFormation.supports_pedagogiques);
      formData.append('methodes_evaluation', updatedFormation.methodes_evaluation);
      formData.append('accessible', updatedFormation.accessible.toString());
      formData.append('taux_tva', updatedFormation.taux_tva.toString());

      if (file) {
        formData.append('welcomeBooklet', file);
      }

      const response = await api.post(`/formations/${updatedFormation.id_formation}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormations(formations.map(f =>
        f.id_formation === updatedFormation.id_formation
          ? { ...f, programme: programme }
          : f
      ));
      setIsEditModalOpen(false);
      toast.success('Formation mise à jour avec succès!');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la formation.');
    }
  };

  const handleAddFormation = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAdd = () => {
    setIsAddModalOpen(false);
    setFile(null);
    setProgramme(''); // Réinitialiser le programme
  };

  const handleSaveAdd = async (newFormation: Formation) => {
    try {
      const formData = new FormData();
      formData.append('titre', newFormation.titre);
      formData.append('description', newFormation.description);
      formData.append('prix_unitaire_ht', newFormation.prix_unitaire_ht.toString());
      formData.append('nb_participants_max', newFormation.nb_participants_max.toString());
      formData.append('est_active', newFormation.est_active.toString());
      formData.append('type_formation', newFormation.type_formation);
      formData.append('duree_heures', newFormation.duree_heures.toString());
      formData.append('categorie', newFormation.categorie);
      formData.append('programme', programme);
      formData.append('multi_jour', newFormation.multi_jour.toString());
      formData.append('cible', newFormation.cible);
      formData.append('moyens_pedagogiques', newFormation.moyens_pedagogiques);
      formData.append('pre_requis', newFormation.pre_requis);
      formData.append('delai_acces', newFormation.delai_acces);
      formData.append('supports_pedagogiques', newFormation.supports_pedagogiques);
      formData.append('methodes_evaluation', newFormation.methodes_evaluation);
      formData.append('accessible', newFormation.accessible.toString());
      formData.append('taux_tva', newFormation.taux_tva.toString());

      if (file) {
        formData.append('welcomeBooklet', file);
      }

      const response = await api.post('/formations/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormations(prevFormations => [...prevFormations, response.data]);
      setIsAddModalOpen(false);
      setFile(null);
      setProgramme(''); // Réinitialiser le programme
      setDetailsKey(prevKey => prevKey + 1); // Forcer la mise à jour de l'interface utilisateur
      toast.success('Formation ajoutée avec succès!');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la formation.');
    }
  };

  const handleDeleteFormation = async (formationId) => {
    const confirmDelete = window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?');
    if (!confirmDelete) return;

    try {
      await api.delete(`/formations/${formationId}`);
      setFormations(prevFormations => prevFormations.filter(f => f.id_formation !== formationId));
      setIsDetailsModalOpen(false);
      toast.success('Formation supprimée avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la suppression de la formation.');
    }
  };

  const calculatePrices = (price: number, vatRate: number) => {
    if (price == null || vatRate == null) {
      return { priceHT: 0, priceTTC: 0 };
    }
    const priceHT = price / (1 + vatRate / 100);
    const priceTTC = price;
    return { priceHT, priceTTC };
  };

  const toggleSessions = (formationId: string) => {
    setExpandedFormationId(prevId => (prevId === formationId ? null : formationId));
  };

  const redirectToSessions = () => {
    window.location.href = 'http://localhost:5173/admin/formations';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <ToastContainer />
      <style>{`
        .tooltip {
          position: relative;
          cursor: pointer;
        }

        .tooltip .tooltiptext {
          visibility: hidden;
          width: 120px;
          background-color: #555;
          color: #fff;
          text-align: center;
          border-radius: 6px;
          padding: 5px;
          position: absolute;
          z-index: 1;
          bottom: 150%;
          left: 50%;
          margin-left: -60px;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .tooltip .tooltiptext::after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: #555 transparent transparent transparent;
        }

        .tooltip:hover .tooltiptext {
          visibility: visible;
          opacity: 1;
        }

        .delete-button {
          color: white;
        }

        .icon-text {
          display: flex;
          align-items: center;
        }

        .icon-text span {
          margin-left: 8px;
        }

        .quill-container {
          border: none;
        }

        .quill-container .ql-editor {
          padding: 0;
        }

        .program-container {
          height: calc(100vh - 400px);
          overflow-y: auto;
        }

        .full-height-editor {
          height: calc(100vh - 300px);
          overflow-y: auto;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .ql-align-center {
          text-align: center;
        }

        .ql-align-right {
          text-align: right;
        }

        .ql-align-justify {
          text-align: justify;
        }

      `}</style>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Catalogue des Formations</h1>
        <div className="flex space-x-2">
          <button onClick={handleAddFormation} className="btn-primary flex items-center space-x-1">
            <Plus className="h-4 w-4" />
            <span>Ajouter une formation</span>
          </button>
          <button onClick={redirectToSessions} className="btn-secondary flex items-center space-x-1">
            <List className="h-4 w-4" />
            <span>Voir les sessions</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher une formation..."
                className="pl-8 input-field w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              className="input-field w-full"
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
            >
              {durations.map(duration => (
                <option key={duration.id} value={duration.id}>
                  {duration.name}
                </option>
              ))}
            </select>

            <select
              className="input-field w-full"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentFormations.map((formation, index) => {
          if (!formation) return null;

          const { priceHT, priceTTC } = calculatePrices(formation.prix_unitaire_ht, formation.taux_tva);

          return (
            <div key={formation.id_formation ?? `formation-${index}`} className="formation-card bg-white shadow-lg rounded-lg">
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold mb-1">{formation.titre}</h2>
                    <div className="flex items-center text-gray-600 mb-1 tooltip">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{formation.duree_heures} heures</span>
                      <span className="tooltiptext">Durée de la formation</span>
                    </div>
                  </div>
                  <div className="p-1 bg-primary bg-opacity-10 rounded-lg tooltip">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="tooltiptext">Détails de la formation</span>
                  </div>
                </div>

                <div className="prose prose-sm">
                  <p className="text-gray-600 line-clamp-3 mb-2">{formation.description}</p>
                </div>

                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center text-gray-600 tooltip">
                    {formation.type_formation === 'intra' ? (
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-2" />
                        <span>Formation intra-entreprise</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Monitor className="h-4 w-4 mr-2" />
                        <span>Formation distancielle</span>
                      </div>
                    )}
                    <span className="tooltiptext">Type de formation</span>
                  </div>
                  <div className="flex items-center text-gray-600 tooltip">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Max Participants: {formation.nb_participants_max}</span>
                    <span className="tooltiptext">Nombre maximum de participants</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center text-gray-600 tooltip">
                    <Accessibility className="h-4 w-4 mr-2" />
                    <span>{formation.accessible ? 'Accessible' : 'Non accessible'}</span>
                    <span className="tooltiptext">Accessibilité de la formation</span>
                  </div>
                  <div className="text-gray-600 flex flex-col items-end">
                    <span>€ {priceHT != null ? priceHT.toFixed(2) : 'N/A'} (HT)</span>
                    <span>€ {priceTTC != null ? priceTTC.toFixed(2) : 'N/A'} (TTC)</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center text-gray-600 tooltip">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formation.multi_jour ? 'Formation sur plusieurs jours' : 'Formation sur une journée'}</span>
                    <span className="tooltiptext">Formation sur plusieurs jours</span>
                  </div>
                </div>

                <div className="flex items-center text-gray-600 mb-1 tooltip">
                  <Target className="h-4 w-4 mr-2" />
                  <span>{formation.cible}</span>
                  <span className="tooltiptext">Cible de la formation</span>
                </div>

                <div className="flex items-center text-gray-600 mb-1 tooltip">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>{formation.moyens_pedagogiques}</span>
                  <span className="tooltiptext">Moyens pédagogiques</span>
                </div>

                <div className="flex items-center text-gray-600 mb-1 tooltip">
                  <Book className="h-4 w-4 mr-2" />
                  <span>{formation.pre_requis}</span>
                  <span className="tooltiptext">Prérequis</span>
                </div>

                <div className="flex items-center text-gray-600 mb-1 tooltip">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>{formation.delai_acces}</span>
                  <span className="tooltiptext">Délai d'accès</span>
                </div>

                <div className="flex items-center text-gray-600 mb-1 tooltip">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>{formation.supports_pedagogiques}</span>
                  <span className="tooltiptext">Supports pédagogiques</span>
                </div>

                <div className="flex items-center text-gray-600 mb-1 tooltip">
                  <List className="h-4 w-4 mr-2" />
                  <span>{formation.methodes_evaluation}</span>
                  <span className="tooltiptext">Méthodes d'évaluation</span>
                </div>

                <div className="flex items-center text-gray-600 mb-1 tooltip">
                  <FileText className="h-4 w-4 mr-2" />
                  <a
                    href={`http://localhost:8000/uploads/${formation.welcomeBooklet}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Télécharger le livret d'accueil
                  </a>
                  <span className="tooltiptext">Livret d'accueil</span>
                </div>

                <button
                  onClick={() => handleOpenDetails(formation)}
                  className="block text-center mt-1 text-blue-500 hover:underline"
                >
                  Plus de détails
                </button>
                <button
                  onClick={() => handleDeleteFormation(formation.id_formation)}
                  className="block text-center mt-1 text-red-500 hover:underline"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => toggleSessions(formation.id_formation)}
                  className="block text-center mt-1 text-green-500 hover:underline"
                >
                  {expandedFormationId === formation.id_formation ? 'Masquer les sessions' : 'Voir les sessions'}
                </button>

                {expandedFormationId === formation.id_formation && (
                  <div className="mt-2">
                    <h3 className="text-lg font-semibold mb-1 text-blue-500">Sessions disponibles :</h3>
                    {formation.sessions && formation.sessions.length > 0 ? (
                      <ul>
                        {formation.sessions.map((session, index) => (
                          <li key={session.id ?? `session-${index}`} className="mb-2">
                            <strong>Titre:</strong> {session.titre}<br />
                            <strong>Lieu:</strong> {session.lieu || 'Non spécifié'}<br />
                            <strong>Nombre d'heures:</strong> {session.nb_heures}<br />
                            <strong>Statut:</strong> {session.statut || 'Non spécifié'}<br />
                            <strong>Nombre d'inscrits:</strong> {session.nb_inscrits}<br />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Aucune session disponible.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentFormations.length === 0 && (
        <div className="text-center py-8">
          <BookOpen className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Aucune formation trouvée
          </h3>
          <p className="text-gray-600">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      )}

      {/* Contrôles de pagination modernisés */}
      <div className="flex justify-between items-center p-4 bg-white border-t border-gray-200">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="ml-2">Précédent</span>
        </button>
        <form onSubmit={handlePageInputSubmit} className="flex items-center space-x-2">
          <span>Aller à la page</span>
          <input
            type="number"
            value={pageInput}
            onChange={handlePageInputChange}
            className="border border-gray-300 rounded-md px-3 py-2 w-16 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center">
            <span>Aller</span>
          </button>
        </form>
        <span className="text-gray-700">
          Page {currentPage} de {Math.ceil(filteredFormations.length / formationsPerPage)}
        </span>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === Math.ceil(filteredFormations.length / formationsPerPage)}
          className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          <span className="mr-2">Suivant</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <DetailsModal
        selectedFormation={selectedFormation}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        onEdit={handleEditFormation}
        onDelete={handleDeleteFormation}
        onDownloadPDF={handleDownloadPDF}
      />

      <EditModal
        selectedFormation={selectedFormation}
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
        programme={programme}
        setProgramme={setProgramme}
        file={file}
        setFile={setFile}
      />

      <AddModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAdd}
        onSave={handleSaveAdd}
        programme={programme}
        setProgramme={setProgramme}
        file={file}
        setFile={setFile}
      />
    </div>
  );
};

export default Catalog;
