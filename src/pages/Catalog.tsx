import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Clock, BookOpen, Users, Monitor, Home, X, Accessibility, Edit, Calendar, Target, Globe, Book, CheckCircle, FileText, List, Plus, Trash } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { api } from '../services/api';
import type { Formation } from '../types/database';

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
  const [formations, setFormations] = useState<Formation[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [expandedFormationId, setExpandedFormationId] = useState<string | null>(null);
  const modalRef = useRef(null);
  const contentToExportRef = useRef(null);

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const data = [
          {
            id: '1',
            title: 'Z CRM - Formation Avancée',
            description: 'Formation avancée sur Z CRM',
            duration: '14',
            max_participants: 10,
            type: 'presentiel',
            accessible: true,
            price: 500,
            vatRate: 20,
            category: 'administrateur',
            program: `
              <h3>Programme de la formation :</h3>
              <div>
                <p><strong>Jour 1: 7 heures</strong></p>
                <ul>
                  <li>
                    <strong>Introduction à Zoho CRM</strong>
                    <ul>
                      <li>Présentation de l'interface utilisateur</li>
                      <li>Terminologie et concepts clés : Leads, Contacts, Opportunités, Modules, etc.</li>
                      <li>Paramétrage des préférences utilisateurs</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Gestion des données clients</strong>
                    <ul>
                      <li>Création et gestion des Leads, Contacts, Comptes et Opportunités</li>
                      <li>Segmentation et qualification des prospects</li>
                      <li>Automatisation des tâches récurrentes</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Personnalisation et configuration</strong>
                    <ul>
                      <li>Ajout de champs personnalisés et mise en forme des vues</li>
                      <li>Filtres avancés</li>
                      <li>Modèles d'emails</li>
                      <li>Personnalisation de la page d'accueil</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Automatisation et suivi commercial</strong>
                    <ul>
                      <li>Création et gestion des workflows</li>
                      <li>Suivi des relances et rappels</li>
                      <li>Gestion des emails et synchronisation avec Zoho CRM</li>
                    </ul>
                  </li>
                </ul>
              </div>
            `,
            multi_day: true,
            target: 'Professionnels de la gestion de la relation client',
            pedagogical_means: 'Licence logicielle, connexion internet',
            prerequisites: 'Connaissance de base de Zoho CRM',
            access_delay: 'Accès immédiat après inscription',
            pedagogical_supports: 'Supports de cours, exercices pratiques',
            evaluation_methods: 'QCM, études de cas, mises en situation',
          },
        ];
        setFormations(data);

        // Exemple de sessions
        const sessionData = [
          { id: '1', formation_id: '1', date: '2024-01-15', instructor: 'Instructor A' },
          { id: '2', formation_id: '1', date: '2024-02-20', instructor: 'Instructor B' },
        ];
        setSessions(sessionData);
      } catch (error) {
        console.error('Erreur lors du chargement des formations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormations();
  }, []);

  const durations = [
    { id: 'all', name: 'Toutes les durées' },
    { id: 'short', name: 'Courte (< 1 jour)' },
    { id: 'medium', name: 'Moyenne (1-3 jours)' },
    { id: 'long', name: 'Longue (> 3 jours)' }
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

  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDuration = selectedDuration === 'all' ||
                          getDurationCategory(formation.duration) === selectedDuration;
    const matchesCategory = selectedCategory === 'all' ||
                           formation.category === selectedCategory;
    return matchesSearch && matchesDuration && matchesCategory;
  });

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
        filename: `${selectedFormation?.title}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().from(contentToExportRef.current).set(opt).save();
    }
  };

  const handleEditFormation = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveEdit = (updatedFormation: Formation) => {
    setFormations(formations.map(f => f.id === updatedFormation.id ? updatedFormation : f));
    setIsEditModalOpen(false);
  };

  const handleAddFormation = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAdd = () => {
    setIsAddModalOpen(false);
  };

  const handleSaveAdd = (newFormation: Formation) => {
    setFormations([...formations, { ...newFormation, id: (formations.length + 1).toString() }]);
    setIsAddModalOpen(false);
  };

  const handleDeleteFormation = (formationId: string) => {
    setFormations(formations.filter(f => f.id !== formationId));
    setIsDetailsModalOpen(false);
  };

  const calculatePrices = (price: number, vatRate: number) => {
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
      <style>{`
        .tooltip {
          position: relative;
          display: inline-block;
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
          bottom: 150%; /* Position the tooltip above the text */
          left: 50%;
          margin-left: -60px;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .tooltip .tooltiptext::after {
          content: "";
          position: absolute;
          top: 100%; /* At the bottom of the tooltip */
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
          <button className="btn-secondary flex items-center space-x-1">
            <Filter className="h-3 w-3" />
            <span>Filtres</span>
          </button>
        </div>
      </div>

      {/* Liste des formations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFormations.map((formation) => {
          const { priceHT, priceTTC } = calculatePrices(formation.price, formation.vatRate);
          return (
            <div key={formation.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold mb-1">{formation.title}</h2>
                    <div className="flex items-center text-gray-600 mb-1 tooltip">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formation.duration} heures</span>
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
                  <div className="text-gray-600 flex items-center tooltip">
                    {formation.type === 'presentiel' ? (
                      <div className="icon-text">
                        <Home className="h-4 w-4 mr-1" />
                        <span>Présentiel</span>
                      </div>
                    ) : (
                      <div className="icon-text">
                        <Monitor className="h-4 w-4 mr-1" />
                        <span>Distanciel</span>
                      </div>
                    )}
                    <span className="tooltiptext">Formation en présentiel</span>
                  </div>
                  <div className="text-gray-600 flex items-center tooltip">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Max Participants: {formation.max_participants}</span>
                    <span className="tooltiptext">Nombre maximum de participants</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-1">
                  <div className="text-gray-600 flex items-center tooltip">
                    <Accessibility className="h-4 w-4 mr-1" />
                    <span>{formation.accessible ? 'Accessible' : 'Non accessible'}</span>
                    <span className="tooltiptext">Accessibilité de la formation</span>
                  </div>
                  <div className="text-gray-600 flex flex-col items-end">
                    <span className="mr-1">€ {priceHT.toFixed(2)} (HT)</span>
                    <span className="mr-1">€ {priceTTC.toFixed(2)} (TTC)</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-1">
                  <div className="text-gray-600 flex items-center tooltip">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formation.multi_day ? 'Sur plusieurs jours' : 'Sur une journée'}</span>
                    <span className="tooltiptext">Formation sur plusieurs jours</span>
                  </div>
                </div>

                <div className="flex items-center text-gray-600 mb-1 tooltip">
                  <Target className="h-4 w-4 mr-1" />
                  <span>{formation.target}</span>
                  <span className="tooltiptext">Cible de la formation</span>
                </div>

                <div className="flex items-center text-gray-600 mb-1 tooltip">
                  <Globe className="h-4 w-4 mr-1" />
                  <span>{formation.pedagogical_means}</span>
                  <span className="tooltiptext">Moyens pédagogiques</span>
                </div>

                <div className="flex items-center text-gray-600 mb-1 tooltip">
                  <Book className="h-4 w-4 mr-1" />
                  <span>{formation.prerequisites}</span>
                  <span className="tooltiptext">Prérequis</span>
                </div>

                <div className="flex items-center text-gray-600 mb-1 tooltip">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>{formation.access_delay}</span>
                  <span className="tooltiptext">Délais d'accès</span>
                </div>

                <div className="flex items-center text-gray-600 mb-1 tooltip">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>{formation.pedagogical_supports}</span>
                  <span className="tooltiptext">Supports pédagogiques</span>
                </div>

                <div className="flex items-center text-gray-600 mb-1 tooltip">
                  <List className="h-4 w-4 mr-1" />
                  <span>{formation.evaluation_methods}</span>
                  <span className="tooltiptext">Méthodes d'évaluation</span>
                </div>

                <button
                  onClick={() => handleOpenDetails(formation)}
                  className="block text-center mt-1 text-blue-500 hover:underline"
                >
                  Plus de détails
                </button>
                <button
                  onClick={() => handleDeleteFormation(formation.id)}
                  className="block text-center mt-1 text-red-500 hover:underline"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => toggleSessions(formation.id)}
                  className="block text-center mt-1 text-green-500 hover:underline"
                >
                  {expandedFormationId === formation.id ? 'Masquer les sessions' : 'Voir les sessions'}
                </button>
                {expandedFormationId === formation.id && (
                  <div className="mt-2">
                    <h3 className="text-lg font-semibold mb-1 text-blue-500">Sessions disponibles :</h3>
                    <ul>
                      {sessions
                        .filter(session => session.formation_id === formation.id)
                        .map(session => (
                          <li key={session.id} className="mb-2">
                            <strong>Date:</strong> {session.date}, <strong>Instructeur:</strong> {session.instructor}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-5xl p-4">
            <div className="border-b border-gray-200 flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{selectedFormation.title}</h2>
              <button onClick={handleCloseDetails} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div ref={contentToExportRef} className="space-y-4">
              <h1 className="text-xl font-bold mb-2">{selectedFormation.title}</h1>
              <p className="text-gray-600">
                Cette formation vous permettra de maîtriser Zoho CRM, un outil puissant pour la gestion de la relation client.
              </p>
              <div>
                <h3 className="text-lg font-semibold mb-1 text-blue-500">Programme de la formation :</h3>
                <div
                  className="space-y-2"
                  dangerouslySetInnerHTML={{ __html: selectedFormation.program || '' }}
                />
              </div>

              {/* Affichage des sessions liées à la formation */}
              <div>
                <h3 className="text-lg font-semibold mb-1 text-blue-500">Sessions disponibles :</h3>
                <ul>
                  {sessions
                    .filter(session => session.formation_id === selectedFormation.id)
                    .map(session => (
                      <li key={session.id} className="mb-2">
                        <strong>Date:</strong> {session.date}, <strong>Instructeur:</strong> {session.instructor}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 flex justify-between items-center pt-4">
              <button onClick={handleCloseDetails} className="btn-secondary">
                Fermer
              </button>
              <div className="flex space-x-2">
                <button onClick={handleEditFormation} className="btn-secondary flex items-center space-x-1">
                  <Edit className="h-3 w-3" />
                  <span>Modifier</span>
                </button>
                <button onClick={handleDownloadPDF} className="btn-primary">
                  Télécharger en PDF
                </button>
                <button
                  onClick={() => handleDeleteFormation(selectedFormation.id)}
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl p-4">
            <div className="border-b border-gray-200 flex justify-between items-center mb-4">
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
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  duration: formData.get('duration') as string,
                  max_participants: parseInt(formData.get('max_participants') as string),
                  type: formData.get('type') as 'presentiel' | 'distanciel',
                  accessible: formData.get('accessible') === 'true',
                  price: parseFloat(formData.get('price') as string),
                  vatRate: parseFloat(formData.get('vatRate') as string), // Ajout du taux de TVA
                  category: formData.get('category') as 'administrateur' | 'utilisateur',
                  program: formData.get('program') as string,
                  multi_day: formData.get('multi_day') === 'true',
                  target: formData.get('target') as string,
                  pedagogical_means: formData.get('pedagogical_means') as string,
                  prerequisites: formData.get('prerequisites') as string,
                  access_delay: formData.get('access_delay') as string,
                  pedagogical_supports: formData.get('pedagogical_supports') as string,
                  evaluation_methods: formData.get('evaluation_methods') as string,
                };
                handleSaveEdit(updatedFormation);
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Titre</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={selectedFormation.title}
                    className="mt-1 input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    defaultValue={selectedFormation.description}
                    className="mt-1 input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Durée (heures)</label>
                  <input
                    type="number"
                    name="duration"
                    defaultValue={selectedFormation.duration}
                    className="mt-1 input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre max de participants</label>
                  <input
                    type="number"
                    name="max_participants"
                    defaultValue={selectedFormation.max_participants}
                    className="mt-1 input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    defaultValue={selectedFormation.type}
                    className="mt-1 input-field w-full"
                    required
                  >
                    <option value="presentiel">Présentiel</option>
                    <option value="distanciel">Distanciel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Accessible</label>
                  <select
                    name="accessible"
                    defaultValue={selectedFormation.accessible}
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
                    name="price"
                    defaultValue={selectedFormation.price}
                    className="mt-1 input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Taux de TVA (%)</label>
                  <input
                    type="number"
                    name="vatRate"
                    defaultValue={selectedFormation.vatRate}
                    className="mt-1 input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <select
                    name="category"
                    defaultValue={selectedFormation.category}
                    className="mt-1 input-field w-full"
                    required
                  >
                    <option value="administrateur">Administrateur</option>
                    <option value="utilisateur">Utilisateur</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Programme</label>
                  <textarea
                    name="program"
                    defaultValue={selectedFormation.program}
                    className="mt-1 input-field w-full"
                    rows={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sur plusieurs jours</label>
                  <select
                    name="multi_day"
                    defaultValue={selectedFormation.multi_day}
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
                    name="target"
                    defaultValue={selectedFormation.target}
                    className="mt-1 input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Moyens pédagogiques</label>
                  <input
                    type="text"
                    name="pedagogical_means"
                    defaultValue={selectedFormation.pedagogical_means}
                    className="mt-1 input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prérequis</label>
                  <input
                    type="text"
                    name="prerequisites"
                    defaultValue={selectedFormation.prerequisites}
                    className="mt-1 input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Délais d'accès</label>
                  <input
                    type="text"
                    name="access_delay"
                    defaultValue={selectedFormation.access_delay}
                    className="mt-1 input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supports pédagogiques</label>
                  <input
                    type="text"
                    name="pedagogical_supports"
                    defaultValue={selectedFormation.pedagogical_supports}
                    className="mt-1 input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Méthodes d'évaluation</label>
                  <input
                    type="text"
                    name="evaluation_methods"
                    defaultValue={selectedFormation.evaluation_methods}
                    className="mt-1 input-field w-full"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 flex justify-end items-center pt-4">
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl p-4">
            <div className="border-b border-gray-200 flex justify-between items-center mb-4">
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
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  duration: formData.get('duration') as string,
                  max_participants: parseInt(formData.get('max_participants') as string),
                  type: formData.get('type') as 'presentiel' | 'distanciel',
                  accessible: formData.get('accessible') === 'true',
                  price: parseFloat(formData.get('price') as string),
                  vatRate: parseFloat(formData.get('vatRate') as string), // Ajout du taux de TVA
                  category: formData.get('category') as 'administrateur' | 'utilisateur',
                  program: formData.get('program') as string,
                  multi_day: formData.get('multi_day') === 'true',
                  target: formData.get('target') as string,
                  pedagogical_means: formData.get('pedagogical_means') as string,
                  prerequisites: formData.get('prerequisites') as string,
                  access_delay: formData.get('access_delay') as string,
                  pedagogical_supports: formData.get('pedagogical_supports') as string,
                  evaluation_methods: formData.get('evaluation_methods') as string,
                };
                handleSaveAdd(newFormation);
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Titre</label>
                  <input
                    type="text"
                    name="title"
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
                    name="duration"
                    className="mt-1 input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre max de participants</label>
                  <input
                    type="number"
                    name="max_participants"
                    className="mt-1 input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    className="mt-1 input-field w-full"
                    required
                  >
                    <option value="presentiel">Présentiel</option>
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
                    name="price"
                    className="mt-1 input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Taux de TVA (%)</label>
                  <input
                    type="number"
                    name="vatRate"
                    className="mt-1 input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <select
                    name="category"
                    className="mt-1 input-field w-full"
                    required
                  >
                    <option value="administrateur">Administrateur</option>
                    <option value="utilisateur">Utilisateur</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Programme</label>
                  <textarea
                    name="program"
                    className="mt-1 input-field w-full"
                    rows={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sur plusieurs jours</label>
                  <select
                    name="multi_day"
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
                    name="target"
                    className="mt-1 input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Moyens pédagogiques</label>
                  <input
                    type="text"
                    name="pedagogical_means"
                    className="mt-1 input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prérequis</label>
                  <input
                    type="text"
                    name="prerequisites"
                    className="mt-1 input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Délais d'accès</label>
                  <input
                    type="text"
                    name="access_delay"
                    className="mt-1 input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supports pédagogiques</label>
                  <input
                    type="text"
                    name="pedagogical_supports"
                    className="mt-1 input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Méthodes d'évaluation</label>
                  <input
                    type="text"
                    name="evaluation_methods"
                    className="mt-1 input-field w-full"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 flex justify-end items-center pt-4">
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
};

export default Catalog;
