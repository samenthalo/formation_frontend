import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Clock, BookOpen, Users, Monitor, Home, X, Accessibility, Edit, Calendar, Target, Globe, Book, CheckCircle, FileText, List, Plus, Trash } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import api from '../services/api'; // Importer l'instance Axios configurée
import type { Formation } from '../types/database';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ReactQuill from 'react-quill'; // Importer react-quill
import 'react-quill/dist/quill.snow.css'; // Importer les styles de quill

// Importer les styles supplémentaires pour les icônes et les options de l'éditeur
import 'react-quill/dist/quill.bubble.css';

interface Session {
  id: string;
  formation_id: string;
  date: string;
  instructor: string;
}

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formations, setFormations] = useState<Formation[]>([]); // Initialiser comme un tableau vide
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [expandedFormationId, setExpandedFormationId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [programme, setProgramme] = useState(''); // État pour le programme
  const [detailsKey, setDetailsKey] = useState(0); // Ajout de la clé unique pour forcer la mise à jour
  const modalRef = useRef(null);
  const contentToExportRef = useRef(null);

  useEffect(() => {
    const fetchFormationsAndSessions = async () => {
      try {
        // Récupérer les formations
        const formationsResponse = await api.get('/formations');
        if (!Array.isArray(formationsResponse.data)) {
          console.error('La réponse de l\'API des formations n\'est pas un tableau:', formationsResponse.data);
          setFormations([]); // Initialiser à un tableau vide en cas d'erreur
          return;
        }

        setFormations(formationsResponse.data);

        // Pour chaque formation, récupérer les sessions liées
        const sessionPromises = formationsResponse.data.map(async (formation: any) => {
          const sessionsResponse = await api.get(`/sessionformation/formation/${formation.id_formation}`);
          return { formationId: formation.id_formation, sessions: sessionsResponse.data };
          
        });

        // Attendre toutes les promesses pour récupérer les sessions
        const sessionsData = await Promise.all(sessionPromises);

        // Ajouter les sessions associées à chaque formation dans le state
        const updatedFormations = formationsResponse.data.map((formation: any) => {
          const associatedSessions = sessionsData.find((sessionData: any) => sessionData.formationId === formation.id_formation);
          return { ...formation, sessions: associatedSessions ? associatedSessions.sessions : [] };
        });

        setFormations(updatedFormations);

      } catch (error) {
        console.error('Erreur lors du chargement des formations et sessions:', error);
        toast.error('Erreur lors du chargement des formations.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormationsAndSessions();
  }, []); // Se lance au premier rendu du composant

  const createFormation = async (newFormation: any) => {
    try {
      // Envoie des données de la formation à l'API
      const response = await api.post('/formations/', newFormation);
      // Si la formation est créée avec succès, mettre à jour les formations dans l'état
      setFormations((prevFormations) => [...prevFormations, response.data]);
      toast.success('Formation créée avec succès!');
      console.log('Formation créée avec succès:', response.data);
    } catch (error) {
      console.error('Erreur lors de la création de la formation:', error);
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
    if (!formation) return false; // Vérifiez si la formation est définie
    const matchesSearch = formation.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          formation.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Logique de filtrage par durée
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
    setProgramme(formation.programme || ''); // Initialiser l'état du programme avec les données de la formation
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setFile(null);
  };

  const handleSaveEdit = async (updatedFormation: Formation) => {
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT'); // ← pour Symfony
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

      // Juste pour debug, tu peux supprimer après
      for (let pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }

      const response = await api.post(`/formations/${updatedFormation.id_formation}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Réponse de l\'API:', response.data);

      setFormations(formations.map(f =>
        f.id_formation === updatedFormation.id_formation
          ? { ...f, programme: programme }
          : f
      ));
      setIsEditModalOpen(false);
      toast.success('Formation mise à jour avec succès!');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la formation:', error);
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
      formData.append('programme', programme); // Utiliser l'état du programme
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
      console.error('Erreur lors de l\'ajout de la formation:', error);
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
      console.error('Erreur lors de la suppression de la formation:', error);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Configuration des modules et des formats pour ReactQuill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }], // Utiliser les tailles par défaut
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }], // Ajouter l'option d'alignement
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  }

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'color', 'background',
    'align', // Ajouter le format d'alignement
    'link', 'image', 'video'
  ]

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
          border: none; /* Supprimer la bordure par défaut */
        }

        .quill-container .ql-editor {
          padding: 0; /* Supprimer le padding par défaut */
        }

        .program-container {
          height: calc(100vh - 400px); /* Ajuster la hauteur en fonction de votre mise en page */
          overflow-y: auto; /* Ajouter une barre de défilement si nécessaire */
        }

        .full-height-editor {
          height: calc(100vh - 300px); /* Ajuster la hauteur pour prendre toute la hauteur disponible */
          overflow-y: auto; /* Ajouter une barre de défilement interne */
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }

        /* Ajoutez des styles personnalisés pour garantir que le contenu est centré */
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

      {/* Filtres */}
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

 {/* Liste des formations */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {filteredFormations.map((formation, index) => {
    if (!formation) return null;

    console.log("📦 Formation ID:", formation.id_formation ?? `formation-${index}`, "Titre:", formation.titre);

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
            <span className="tooltiptext">Délais d'accès</span>
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
                      <strong>Date de début:</strong> {new Date(session.date_debut).toLocaleDateString()}<br />
                      <strong>Date de fin:</strong> {new Date(session.date_fin).toLocaleDateString()}<br />
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

      {/* Message si aucune formation n'est trouvée */}

      {filteredFormations.length === 0 && (
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

      {/* Modal de détails de formation */}
      {isDetailsModalOpen && selectedFormation && (
  <div key={detailsKey} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-5xl p-4">
      <div className="border-b border-gray-200 flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{selectedFormation.titre}</h2>
        <button onClick={handleCloseDetails} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div ref={contentToExportRef} className="space-y-4">
        <h1 className="text-xl font-bold mb-2">{selectedFormation.titre}</h1>
        <p className="text-gray-600">
          Cette formation vous permettra de maîtriser Zoho CRM, un outil puissant pour la gestion de la relation client.
        </p>
        <div>
          <h3 className="text-lg font-semibold mb-1 text-blue-500">Programme de la formation :</h3>
          <div
            className="space-y-2 ql-editor"
            dangerouslySetInnerHTML={{ __html: selectedFormation.programme || '' }}
          />
        </div>
      </div>

      {/* Affichage des sessions liées à la formation sélectionnée, en dehors de la section exportée en PDF */}
      {selectedFormation && selectedFormation.sessions && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-1 text-blue-500">
            Sessions disponibles pour {selectedFormation.titre} :
          </h3>
          <ul>
            {selectedFormation.sessions.map((session, index) => (
              <li key={session.id ?? `session-${index}`} className="mb-2">
                <strong>Titre:</strong> {session.titre}<br />
                <strong>Date de début:</strong> {new Date(session.date_debut).toLocaleDateString()}<br />
                <strong>Date de fin:</strong> {new Date(session.date_fin).toLocaleDateString()}<br />
                <strong>Lieu:</strong> {session.lieu || 'Non spécifié'}<br />
                <strong>Nombre d'heures:</strong> {session.nb_heures}<br />
                <strong>Statut:</strong> {session.statut || 'Non spécifié'}<br />
                <strong>Nombre d'inscrits:</strong> {session.nb_inscrits}<br />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-gray-200 flex justify-between items-center pt-4">
        <button onClick={handleCloseDetails} className="btn-secondary">
          Fermer
        </button>
        <div className="flex space-x-2">
          <button onClick={() => handleEditFormation(selectedFormation)} className="btn-secondary flex items-center space-x-1">
            <Edit className="h-3 w-3" />
            <span>Modifier</span>
          </button>
          <button onClick={handleDownloadPDF} className="btn-primary">
            Télécharger en PDF
          </button>
          <button
            onClick={() => handleDeleteFormation(selectedFormation.id_formation)}
            className="btn-secondary flex items-center space-x-1 delete-button"
          >
            <Trash className="h-3 w-3" />
            <span>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Modal de modification de formation */}
      {isEditModalOpen && selectedFormation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl p-4"> {/* Augmenter la largeur maximale ici */}
            <div className="border-b border-gray-200 flex justify-between items-center mb-2"> {/* Réduire la marge inférieure */}
              <h2 className="text-lg font-semibold">Modifier la formation</h2>
              <button onClick={handleCloseEdit} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedFormation = {
                  ...selectedFormation,
                  titre: formData.get('titre') as string,
                  description: formData.get('description') as string,
                  duree_heures: parseInt(formData.get('duree_heures') as string),
                  nb_participants_max: parseInt(formData.get('nb_participants_max') as string),
                  type_formation: formData.get('type_formation') as 'intra' | 'distanciel',
                  accessible: formData.get('accessible') === 'true',
                  prix_unitaire_ht: parseFloat(formData.get('prix_unitaire_ht') as string),
                  taux_tva: parseFloat(formData.get('taux_tva') as string),
                  categorie: formData.get('categorie') as 'administrateur' | 'utilisateur',
                  programme: programme, // Utiliser l'état du programme
                  multi_jour: formData.get('multi_jour') === 'true',
                  cible: formData.get('cible') as string,
                  moyens_pedagogiques: formData.get('moyens_pedagogiques') as string,
                  pre_requis: formData.get('pre_requis') as string,
                  delai_acces: formData.get('delai_acces') as string,
                  supports_pedagogiques: formData.get('supports_pedagogiques') as string,
                  methodes_evaluation: formData.get('methodes_evaluation') as string,
                };
                handleSaveEdit(updatedFormation);
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4"> {/* Utiliser grid-cols-12 pour plus de flexibilité */}
                <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-2"> {/* Augmenter la largeur de la colonne de gauche */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Titre</label>
                    <input
                      type="text"
                      name="titre"
                      value={selectedFormation.titre}
                      className="mt-1 input-field w-full"
                      required
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, titre: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={selectedFormation.description}
                      className="mt-1 input-field w-full"
                      required
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Durée (heures)</label>
                    <input
                      type="number"
                      name="duree_heures"
                      value={selectedFormation.duree_heures}
                      className="mt-1 input-field w-full"
                      required
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, duree_heures: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre max de participants</label>
                    <input
                      type="number"
                      name="nb_participants_max"
                      value={selectedFormation.nb_participants_max}
                      className="mt-1 input-field w-full"
                      required
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, nb_participants_max: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      name="type_formation"
                      value={selectedFormation.type_formation}
                      className="mt-1 input-field w-full"
                      required
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, type_formation: e.target.value as 'intra' | 'distanciel' })}
                    >
                      <option value="intra">Intra</option>
                      <option value="distanciel">Distanciel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Accessible</label>
                    <select
                      name="accessible"
                      value={selectedFormation.accessible}
                      className="mt-1 input-field w-full"
                      required
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, accessible: e.target.value === 'true' })}
                    >
                      <option value="true">Oui</option>
                      <option value="false">Non</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
                    <input
                      type="number"
                      name="prix_unitaire_ht"
                      value={selectedFormation.prix_unitaire_ht}
                      className="mt-1 input-field w-full"
                      required
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, prix_unitaire_ht: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Taux de TVA (%)</label>
                    <input
                      type="number"
                      name="taux_tva"
                      value={selectedFormation.taux_tva}
                      className="mt-1 input-field w-full"
                      required
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, taux_tva: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                    <select
                      name="categorie"
                      value={selectedFormation.categorie}
                      className="mt-1 input-field w-full"
                      required
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, categorie: e.target.value as 'administrateur' | 'utilisateur' })}
                    >
                      <option value="administrateur">Administrateur</option>
                      <option value="utilisateur">Utilisateur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sur plusieurs jours</label>
                    <select
                      name="multi_jour"
                      value={selectedFormation.multi_jour}
                      className="mt-1 input-field w-full"
                      required
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, multi_jour: e.target.value === 'true' })}
                    >
                      <option value="true">Oui</option>
                      <option value="false">Non</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cible</label>
                    <input
                      type="text"
                      name="cible"
                      value={selectedFormation.cible}
                      className="mt-1 input-field w-full"
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, cible: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Moyens pédagogiques</label>
                    <input
                      type="text"
                      name="moyens_pedagogiques"
                      value={selectedFormation.moyens_pedagogiques}
                      className="mt-1 input-field w-full"
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, moyens_pedagogiques: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prérequis</label>
                    <input
                      type="text"
                      name="pre_requis"
                      value={selectedFormation.pre_requis}
                      className="mt-1 input-field w-full"
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, pre_requis: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Délais d'accès</label>
                    <input
                      type="text"
                      name="delai_acces"
                      value={selectedFormation.delai_acces}
                      className="mt-1 input-field w-full"
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, delai_acces: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Supports pédagogiques</label>
                    <input
                      type="text"
                      name="supports_pedagogiques"
                      value={selectedFormation.supports_pedagogiques}
                      className="mt-1 input-field w-full"
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, supports_pedagogiques: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Méthodes d'évaluation</label>
                    <input
                      type="text"
                      name="methodes_evaluation"
                      value={selectedFormation.methodes_evaluation}
                      className="mt-1 input-field w-full"
                      onChange={(e) => setSelectedFormation({ ...selectedFormation, methodes_evaluation: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Livret d'accueil (PDF)
                    </label>
                    {selectedFormation.welcomeBooklet ? (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700">{selectedFormation.welcomeBooklet}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedFormation({ ...selectedFormation, welcomeBooklet: null })}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 flex justify-center px-6 pt-2 pb-2 border-2 border-gray-300 border-dashed rounded-lg"> {/* Réduire les paddings */}
                        <div className="space-y-1 text-center">
                          <svg
                            className="mx-auto h-10 w-10 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                            >
                              <span>Téléverser un fichier</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept=".pdf"
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">ou glisser-déposer</p>
                          </div>
                          <p className="text-xs text-gray-500">PDF jusqu'à 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-6"> {/* Colonne de droite avec plus d'espace */}
                  <label className="block text-sm font-medium text-gray-700">Programme</label>
                  <ReactQuill
                    value={programme}
                    onChange={setProgramme}
                    className="mt-1 input-field w-full quill-container full-height-editor no-scrollbar"
                    modules={quillModules}
                    formats={quillFormats}
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 flex justify-end items-center pt-2"> {/* Réduire la marge supérieure */}
                <button type="submit" className="btn-primary">
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'ajout de formation */}
      {isAddModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl p-4"> {/* Augmenter la largeur maximale ici */}
      <div className="border-b border-gray-200 flex justify-between items-center mb-2"> {/* Réduire la marge inférieure */}
        <h2 className="text-lg font-semibold">Ajouter une formation</h2>
        <button onClick={handleCloseAdd} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const newFormation = {
            titre: formData.get('titre') as string,
            description: formData.get('description') as string,
            prix_unitaire_ht: parseFloat(formData.get('prix_unitaire_ht') as string),
            nb_participants_max: parseInt(formData.get('nb_participants_max') as string),
            est_active: formData.get('est_active') === 'true',
            type_formation: formData.get('type_formation') as 'intra' | 'distanciel',
            duree_heures: parseInt(formData.get('duree_heures') as string),
            categorie: formData.get('categorie') as 'administrateur' | 'utilisateur',
            programme: programme, // Utiliser l'état du programme
            multi_jour: formData.get('multi_jour') === 'true',
            cible: formData.get('cible') as string,
            moyens_pedagogiques: formData.get('moyens_pedagogiques') as string,
            pre_requis: formData.get('pre_requis') as string,
            delai_acces: formData.get('delai_acces') as string,
            supports_pedagogiques: formData.get('supports_pedagogiques') as string,
            methodes_evaluation: formData.get('methodes_evaluation') as string,
            accessible: formData.get('accessible') === 'true',
            taux_tva: parseFloat(formData.get('taux_tva') as string),
            welcomeBooklet: file ? file : null,
          };
          handleSaveAdd(newFormation);
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4"> {/* Utiliser grid-cols-12 pour plus de flexibilité */}
          <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-2"> {/* Augmenter la largeur de la colonne de gauche */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Titre</label>
              <input
                type="text"
                name="titre"
                className="mt-1 input-field w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                className="mt-1 input-field w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Durée (heures)</label>
              <input
                type="number"
                name="duree_heures"
                className="mt-1 input-field w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre max de participants</label>
              <input
                type="number"
                name="nb_participants_max"
                className="mt-1 input-field w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                name="type_formation"
                className="mt-1 input-field w-full"
                required
              >
                <option value="intra">Intra</option>
                <option value="distanciel">Distanciel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Accessible</label>
              <select
                name="accessible"
                className="mt-1 input-field w-full"
                required
              >
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
              <input
                type="number"
                name="prix_unitaire_ht"
                className="mt-1 input-field w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Taux de TVA (%)</label>
              <input
                type="number"
                name="taux_tva"
                className="mt-1 input-field w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Catégorie</label>
              <select
                name="categorie"
                className="mt-1 input-field w-full"
                required
              >
                <option value="administrateur">Administrateur</option>
                <option value="utilisateur">Utilisateur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sur plusieurs jours</label>
              <select
                name="multi_jour"
                className="mt-1 input-field w-full"
                required
              >
                <option value="true">Oui</option>
                <option value="false">Non</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cible</label>
              <input
                type="text"
                name="cible"
                className="mt-1 input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Moyens pédagogiques</label>
              <input
                type="text"
                name="moyens_pedagogiques"
                className="mt-1 input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prérequis</label>
              <input
                type="text"
                name="pre_requis"
                className="mt-1 input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Délais d'accès</label>
              <input
                type="text"
                name="delai_acces"
                className="mt-1 input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Supports pédagogiques</label>
              <input
                type="text"
                name="supports_pedagogiques"
                className="mt-1 input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Méthodes d'évaluation</label>
              <input
                type="text"
                name="methodes_evaluation"
                className="mt-1 input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Livret d'accueil (PDF)
              </label>
              {file ? (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="mt-1 flex justify-center px-6 pt-2 pb-2 border-2 border-gray-300 border-dashed rounded-lg"> {/* Réduire les paddings */}
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-10 w-10 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                      >
                        <span>Téléverser un fichier</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">ou glisser-déposer</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF jusqu'à 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-6"> {/* Colonne de droite avec plus d'espace */}
            <label className="block text-sm font-medium text-gray-700">Programme</label>
            <ReactQuill
              value={programme}
              onChange={setProgramme}
              className="mt-1 input-field w-full quill-container full-height-editor no-scrollbar"
              modules={quillModules}
              formats={quillFormats}
            />
          </div>
        </div>
        <div className="border-t border-gray-200 flex justify-end items-center pt-2"> {/* Réduire la marge supérieure */}
          <button type="submit" className="btn-primary">
            Ajouter
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
}

export default Catalog;
