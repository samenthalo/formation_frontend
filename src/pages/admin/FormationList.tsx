import React, { useState } from 'react';
import { Search, Filter, Plus, X, CheckSquare, Calendar, Clock, MapPin, Users, Building, Monitor } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import type { Formation, Instructor, Trainee } from '../../types/database';
import Timeline from './Timeline'; // Importer le composant Timeline

interface ParticipantModalProps {
  formation: Formation;
  onClose: () => void;
}

interface EditModalProps {
  formation: Formation;
  instructors: Instructor[];
  onClose: () => void;
  onSave: (formation: Formation) => void;
}

interface SessionDetailsModalProps {
  formation: Formation;
  onClose: () => void;
}

// Définition du composant ParticipantModal
const ParticipantModal: React.FC<ParticipantModalProps> = ({ formation, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(formation.participants);

  // Liste de participants en dur
  const allParticipants = [
    { id: '1', first_name: 'Alice', last_name: 'Dupont', phone: '0612345678', email: 'alice.dupont@email.com' },
    { id: '2', first_name: 'Bob', last_name: 'Martin', phone: '0687654321', email: 'bob.martin@email.com' },
    { id: '3', first_name: 'Charlie', last_name: 'Durand', phone: '0611223344', email: 'charlie.durand@email.com' },
    { id: '4', first_name: 'David', last_name: 'Lefevre', phone: '0655667788', email: 'david.lefevre@email.com' },
    { id: '5', first_name: 'Eve', last_name: 'Moreau', phone: '0699887766', email: 'eve.moreau@email.com' },
    { id: '6', first_name: 'Frank', last_name: 'Girard', phone: '0633221144', email: 'frank.girard@email.com' },
    { id: '7', first_name: 'Grace', last_name: 'Rousseau', phone: '0677889900', email: 'grace.rousseau@email.com' },
    { id: '8', first_name: 'Heidi', last_name: 'Fournier', phone: '0612341234', email: 'heidi.fournier@email.com' },
    { id: '9', first_name: 'Ivan', last_name: 'Lemaire', phone: '0655443322', email: 'ivan.lemaire@email.com' },
    { id: '10', first_name: 'Judy', last_name: 'Chevalier', phone: '0699887766', email: 'judy.chevalier@email.com' },
    { id: '11', first_name: 'Karl', last_name: 'Muller', phone: '0611223344', email: 'karl.muller@email.com' },
    { id: '12', first_name: 'Laura', last_name: 'Gauthier', phone: '0655667788', email: 'laura.gauthier@email.com' },
  ];

  // Filtrer les participants en fonction du terme de recherche
  const filteredParticipants = searchTerm
    ? allParticipants.filter(participant =>
        participant.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.last_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleToggleParticipant = (participantId: string) => {
    setSelectedParticipants(prev =>
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleSaveParticipants = () => {
    // Mettre à jour la formation avec les participants sélectionnés
    const updatedFormation = { ...formation, participants: selectedParticipants };
    // Vous pouvez ajouter ici une logique pour sauvegarder les modifications
    console.log('Participants mis à jour:', updatedFormation);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Gestion des Participants</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-medium">{formation.title}</h3>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher un participant..."
              className="input-field w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Participants sélectionnés:</span>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${(selectedParticipants.length / formation.maxParticipants) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-700">{selectedParticipants.length} / {formation.maxParticipants}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParticipants.map(participant => (
              <div
                key={participant.id}
                className="border p-4 rounded-lg shadow-sm flex flex-col items-start"
              >
                <div className="flex items-center w-full justify-between">
                  <h4 className="text-lg font-medium">
                    {participant.first_name} {participant.last_name}
                  </h4>
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(participant.id)}
                    onChange={() => handleToggleParticipant(participant.id)}
                    className="mr-2"
                  />
                </div>
                <p className="text-gray-600">{participant.email}</p>
                <p className="text-gray-600">{participant.phone}</p>
              </div>
            ))}
          </div>
          <button onClick={handleSaveParticipants} className="btn-primary mt-4">
            Enregistrer les participants
          </button>
        </div>
      </div>
    </div>
  );
};

// Définition du composant EditModal
const EditModal: React.FC<EditModalProps> = ({ formation, instructors, onClose, onSave }) => {
  const [editedFormation, setEditedFormation] = useState({ ...formation });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedFormation(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(editedFormation);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Modifier la Formation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input
              type="text"
              name="title"
              value={editedFormation.title}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {/* Ajoutez ici d'autres champs pour modifier la formation */}
          <button onClick={handleSave} className="btn-primary mt-4">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({ formation, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Détails de la Session</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-medium">{formation.title}</h3>
            <p className="text-gray-600">{formation.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Date de début</h4>
              <p>{new Date(formation.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Date de fin</h4>
              <p>{new Date(formation.endDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Durée</h4>
              <p>{formation.duration}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Lieu</h4>
              <p>{formation.location}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Nombre maximum de participants</h4>
              <p>{formation.maxParticipants}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Mode</h4>
              <p>{formation.mode === 'presentiel' ? 'Présentiel' : 'Distanciel'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Responsable</h4>
              <p>{formation.responsable?.first_name} {formation.responsable?.last_name}</p>
              <p>{formation.responsable?.email}</p>
              <p>{formation.responsable?.phone}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Lien de visio</h4>
              <p>{formation.video_link || 'Aucun lien de visio disponible'}</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Formateurs</h4>
            <div className="space-y-2">
              {formation.instructors.map((instructor, index) => (
                <div key={index} className="text-sm text-gray-900">
                  {instructor.first_name} {instructor.last_name}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Participants</h4>
            <p>{formation.enrolledCount} / {formation.maxParticipants}</p>
          </div>
        </div>
      </div>
    </div>
  );
};


const FormationList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormation, setSelectedFormation] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedFormationData, setSelectedFormationData] = useState<Formation | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [selectedSession, setSelectedSession] = useState<Formation | null>(null);

  // Example instructors data
  const [instructors] = useState<Instructor[]>([
    {
      id: '1',
      first_name: 'Sophie',
      last_name: 'Bernard',
      email: 'sophie.bernard@formation.com',
      phone: '0612345678',
      specialties: ['React', 'JavaScript', 'TypeScript'],
      bio: 'Experte en développement frontend avec 10 ans d\'expérience',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      first_name: 'Marc',
      last_name: 'Dubois',
      email: 'marc.dubois@formation.com',
      phone: '0687654321',
      specialties: ['Node.js', 'Express', 'MongoDB'],
      bio: 'Spécialiste backend et architecte logiciel',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  // Example trainees data
  const [trainees] = useState<Trainee[]>([
    {
      id: '1',
      first_name: 'Marie',
      last_name: 'Martin',
      email: 'marie.martin@email.com',
      phone: '0612345678',
      function: 'Développeur Frontend',
      birth_date: '1990-01-01',
      company_id: '1',
      company: {
        id: '1',
        name: 'TechCorp',
        address: null,
        phone: null,
        email: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      formations: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      first_name: 'Jean',
      last_name: 'Dupont',
      email: 'jean.dupont@email.com',
      phone: '0687654321',
      function: 'Chef de projet',
      birth_date: '1985-05-15',
      company_id: '2',
      company: {
        id: '2',
        name: 'Digital Solutions',
        address: null,
        phone: null,
        email: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      formations: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  // Example formations data
  const [formations, setFormations] = useState<Formation[]>([
    {
      id: '1',
      title: 'Formation React Avancé',
      description: 'Maîtrisez les concepts avancés de React',
      duration: '35 heures',
      maxParticipants: 12,
      startDate: '2024-04-01',
      endDate: '2024-04-05',
      location: 'Salle 302',
      status: 'upcoming',
      mode: 'presentiel',
      instructors: [instructors[0]],
      enrolledCount: 8,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      participants: ['1'],
      responsable: { id: '2', first_name: 'Marc', last_name: 'Dubois', phone: '0687654321', email: 'marc.dubois@formation.com' }
    },
    {
      id: '2',
      title: 'Introduction à Python',
      description: 'Apprenez les bases de la programmation avec Python',
      duration: '20 heures',
      maxParticipants: 15,
      startDate: '2024-05-15',
      endDate: '2024-05-20',
      location: 'Salle 101',
      status: 'upcoming',
      mode: 'distanciel',
      instructors: [instructors[1]],
      enrolledCount: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      participants: ['2'],
      responsable: { id: '2', first_name: 'Marc', last_name: 'Dubois', phone: '0687654321', email: 'marc.dubois@formation.com' }
    },
    {
      id: '3',
      title: 'Développement Mobile avec Flutter',
      description: 'Créez des applications mobiles multiplateformes',
      duration: '40 heures',
      maxParticipants: 10,
      startDate: '2024-06-10',
      endDate: '2024-06-15',
      location: 'Salle 203',
      status: 'upcoming',
      mode: 'presentiel',
      instructors: [instructors[0], instructors[1]],
      enrolledCount: 7,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      participants: ['1', '2']
    },
    {
      id: '4',
      title: 'Atelier UX/UI Design',
      description: 'Concevez des interfaces utilisateur intuitives',
      duration: '15 heures',
      maxParticipants: 8,
      startDate: '2024-07-01',
      endDate: '2024-07-03',
      location: 'Salle 304',
      status: 'upcoming',
      mode: 'distanciel',
      instructors: [instructors[1]],
      enrolledCount: 6,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      participants: ['1']
    }
  ]);

  const handleEdit = (formation: Formation) => {
    setSelectedFormationData(formation);
    setIsEditModalOpen(true);
  };

  const handleParticipants = (formation: Formation) => {
    setSelectedFormationData(formation);
    setIsParticipantModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      setFormations(formations.filter(f => f.id !== id));
    }
  };

  const handleSaveEdit = (updatedFormation: Formation) => {
    setFormations(prev => prev.map(f =>
      f.id === updatedFormation.id ? updatedFormation : f
    ));
    setIsEditModalOpen(false);
    setSelectedFormationData(null);
  };

  const handleShowDetails = (formation: Formation) => {
    setSelectedFormationData(formation);
    setIsDetailsModalOpen(true);
  };

  const handleShowTimelineFromSession = (formation: Formation) => {
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

  const handleSendEmails = (formation: Formation) => {
    // Vérifiez si un responsable est défini pour la formation
    if (formation.responsable && formation.responsable.email) {
      // Log pour simuler l'envoi d'un email au responsable
      console.log(`Envoi d'un email au responsable ${formation.responsable.email} pour la formation "${formation.title}".`);
  
      // Afficher une alerte indiquant que l'email a été envoyé au responsable
      alert(`Email envoyé au responsable : ${formation.responsable.email}`);
    } else {
      // Afficher une alerte si aucun responsable n'est défini
      alert(`Aucun responsable défini pour la formation "${formation.title}".`);
    }
  };
  
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
                    Lieu
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
                {formations.map((formation) => (
                  <tr
                    key={formation.id}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleShowDetails(formation)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formation.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formation.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>
                          Du {new Date(formation.startDate).toLocaleDateString()} au{' '}
                          {new Date(formation.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{formation.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {formation.instructors.map((instructor, index) => (
                          <div key={index} className="text-sm text-gray-900">
                            {instructor.first_name} {instructor.last_name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-900">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>
                          {formation.enrolledCount} / {formation.maxParticipants}
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
                          handleDelete(formation.id);
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
                          handleSendEmails(formation);
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        Envoyer email
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
          instructors={instructors}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedFormationData(null);
          }}
          onSave={handleSaveEdit}
        />
      )}

      {/* Participant Management Modal */}
      {isParticipantModalOpen && selectedFormationData && (
        <ParticipantModal
          formation={selectedFormationData}
          onClose={() => {
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
        />
      )}
    </div>
  );
};

export default FormationList;
