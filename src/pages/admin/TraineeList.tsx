import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Mail, Phone, Building, ChevronLeft, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import AddTraineeModal from './modal_traineelist/AddTraineeModal';
import EditTraineeModal from './modal_traineelist/EditTraineeModal';
import TraineeDetailsModal from './modal_traineelist/TraineeDetailsModal';
import TraineeForm from './modal_traineelist/TraineeForm';

interface Session {
  id: string;
  titre: string;
  date: string;
  description: string;
}

interface Trainee {
  id_stagiaire: number;
  nom_stagiaire: string;
  prenom_stagiaire: string;
  telephone_stagiaire: string | null;
  email_stagiaire: string;
  entreprise_stagiaire?: string;
  fonction_stagiaire?: string;
  sessions?: Session[];
}

interface TraineeFormData {
  prenom_stagiaire: string;
  nom_stagiaire: string;
  email_stagiaire: string;
  telephone_stagiaire: string;
  entreprise_stagiaire: string;
  fonction_stagiaire: string;
  sessions: Session[];
}

const TraineeList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState('all');
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);
  const [sessions, setSessions] = useState<{ id: string; name: string }[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [editFormData, setEditFormData] = useState<TraineeFormData>({
    prenom_stagiaire: '',
    nom_stagiaire: '',
    email_stagiaire: '',
    telephone_stagiaire: '',
    entreprise_stagiaire: '',
    fonction_stagiaire: '',
    sessions: []
  });
  const [addFormData, setAddFormData] = useState<TraineeFormData>({
    prenom_stagiaire: '',
    nom_stagiaire: '',
    email_stagiaire: '',
    telephone_stagiaire: '',
    entreprise_stagiaire: '',
    fonction_stagiaire: '',
    sessions: []
  });

  const [selectedTrainees, setSelectedTrainees] = useState<number[]>([]);

  // État pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const traineesPerPage = 25;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [traineesResponse, sessionsResponse, inscriptionsResponse] = await Promise.all([
          fetch('http://localhost:8000/stagiaires'),
          fetch('http://localhost:8000/sessionformation'),
          fetch('http://localhost:8000/inscriptions')
        ]);

        if (!traineesResponse.ok) throw new Error('Failed to fetch trainees');
        if (!sessionsResponse.ok) throw new Error('Failed to fetch sessions');
        if (!inscriptionsResponse.ok) throw new Error('Failed to fetch inscriptions');

        const traineesData = await traineesResponse.json();
        const sessionsData = await sessionsResponse.json();
        const inscriptionsData = await inscriptionsResponse.json();

        setAvailableSessions(sessionsData);
        setSessions([{ id: 'all', name: 'Toutes les sessions' }, ...sessionsData.map(session => ({ id: session.id_session, name: session.titre }))]);

        const updatedTrainees = traineesData.map(trainee => {
          const traineeSessions = inscriptionsData
            .filter(inscription => inscription.stagiaire.id_stagiaire === trainee.id_stagiaire)
            .map(inscription => ({
              id: inscription.session.id_session,
              titre: inscription.session.nom_session,
              date: '', // Add date if available
              description: '' // Add description if available
            }));

          return {
            ...trainee,
            sessions: traineeSessions
          };
        });

        setTrainees(updatedTrainees);
      } catch (error) {
        toast.error('Erreur lors de la récupération des données');
      }
    };

    fetchData();
  }, []);

  const handleEdit = (trainee: Trainee) => {
    setSelectedTrainee(trainee);
    setEditFormData({
      id_stagiaire: trainee.id_stagiaire, // Ajouter l'ID ici
      prenom_stagiaire: trainee.prenom_stagiaire,
      nom_stagiaire: trainee.nom_stagiaire,
      email_stagiaire: trainee.email_stagiaire,
      telephone_stagiaire: trainee.telephone_stagiaire || '',
      entreprise_stagiaire: trainee.entreprise_stagiaire || '',
      fonction_stagiaire: trainee.fonction_stagiaire || '',
      sessions: trainee.sessions || [],
    });

    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainee) return;

    const updatedTrainee: Trainee = {
      ...selectedTrainee,
      prenom_stagiaire: editFormData.prenom_stagiaire,
      nom_stagiaire: editFormData.nom_stagiaire,
      email_stagiaire: editFormData.email_stagiaire,
      telephone_stagiaire: editFormData.telephone_stagiaire,
      entreprise_stagiaire: editFormData.entreprise_stagiaire,
      fonction_stagiaire: editFormData.fonction_stagiaire,
      sessions: editFormData.sessions
    };

    try {
      await fetch(`http://localhost:8000/stagiaires/updates/${selectedTrainee.id_stagiaire}`, {
        method: 'POST', // Utiliser POST au lieu de PUT
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTrainee)
      });
      setTrainees(trainees.map(t => t.id_stagiaire === selectedTrainee.id_stagiaire ? updatedTrainee : t));
      setIsEditModalOpen(false);
      toast.success('Stagiaire mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du stagiaire');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('nom_stagiaire', addFormData.nom_stagiaire);
    formDataToSend.append('prenom_stagiaire', addFormData.prenom_stagiaire);
    formDataToSend.append('telephone_stagiaire', addFormData.telephone_stagiaire);
    formDataToSend.append('email_stagiaire', addFormData.email_stagiaire);
    formDataToSend.append('entreprise_stagiaire', addFormData.entreprise_stagiaire);
    formDataToSend.append('fonction_stagiaire', addFormData.fonction_stagiaire);
    formDataToSend.append('id_session', JSON.stringify(addFormData.sessions)); // Assuming sessions are passed here

    try {
      const response = await fetch('http://localhost:8000/stagiaires', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const newTrainee = await response.json();

        // Update the state with the new trainee
        setTrainees(prevTrainees => [...prevTrainees, newTrainee]);
        setIsAddModalOpen(false);
        setAddFormData({
          prenom_stagiaire: '',
          nom_stagiaire: '',
          email_stagiaire: '',
          telephone_stagiaire: '',
          entreprise_stagiaire: '',
          fonction_stagiaire: '',
          sessions: [],
        });
        toast.success('Stagiaire ajouté avec succès');
      } else {
        throw new Error('Failed to add trainee');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du stagiaire');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce stagiaire ?')) {
      try {
        await fetch(`http://localhost:8000/stagiaires/${id}`, {
          method: 'DELETE'
        });
        setTrainees(trainees.filter(t => t.id_stagiaire !== id));
        toast.success('Stagiaire supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression du stagiaire');
      }
    }
  };

  const handleSessionToggle = (session: Session, isEdit: boolean) => {
    const updateFormData = isEdit ? setEditFormData : setAddFormData;
    updateFormData(prev => {
      const sessions = prev.sessions;
      if (sessions.some(s => s.id === session.id_session)) {
        return {
          ...prev,
          sessions: sessions.filter(s => s.id !== session.id_session)
        };
      } else {
        return {
          ...prev,
          sessions: [...sessions, session]
        };
      }
    });
  };

  const handleViewDetails = (trainee: Trainee) => {
    setSelectedTrainee(trainee);
    setIsDetailsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target?.result;
      if (typeof binaryStr === 'string') {
        let parsedData: Trainee[] = [];
        if (file.name.endsWith('.csv')) {
          Papa.parse(binaryStr, {
            header: true,
            complete: (results) => {
              parsedData = results.data.map((row: any) => ({
                id_stagiaire: uuidv4(),
                prenom_stagiaire: row.prenom_stagiaire,
                nom_stagiaire: row.nom_stagiaire,
                email_stagiaire: row.email_stagiaire,
                telephone_stagiaire: row.telephone_stagiaire || null,
                entreprise_stagiaire: row.entreprise_stagiaire || null,
                fonction_stagiaire: row.fonction_stagiaire || null,
                sessions: row.sessions ? JSON.parse(row.sessions) : []
              }));
              checkForDuplicatesAndUpdate(parsedData);
            }
          });
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(binaryStr, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const headerRow = jsonData[0] as string[];
          const prenomIndex = headerRow.indexOf('prenom_stagiaire');
          const nomIndex = headerRow.indexOf('nom_stagiaire');
          const emailIndex = headerRow.indexOf('email_stagiaire');
          const telephoneIndex = headerRow.indexOf('telephone_stagiaire');
          const entrepriseIndex = headerRow.indexOf('entreprise_stagiaire');
          const fonctionIndex = headerRow.indexOf('fonction_stagiaire');
          const sessionsIndex = headerRow.indexOf('sessions');

          parsedData = jsonData.slice(1).map((row: any) => ({
            id_stagiaire: uuidv4(),
            prenom_stagiaire: row[prenomIndex],
            nom_stagiaire: row[nomIndex],
            email_stagiaire: row[emailIndex],
            telephone_stagiaire: row[telephoneIndex] || null,
            entreprise_stagiaire: row[entrepriseIndex] || null,
            fonction_stagiaire: row[fonctionIndex] || null,
            sessions: row[sessionsIndex] ? JSON.parse(row[sessionsIndex]) : []
          }));

          checkForDuplicatesAndUpdate(parsedData);
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const checkForDuplicatesAndUpdate = (newTrainees: Trainee[]) => {
    const existingEmails = trainees.map(trainee => trainee.email_stagiaire);
    const duplicateEmails = newTrainees.filter(trainee => existingEmails.includes(trainee.email_stagiaire));

    if (duplicateEmails.length > 0) {
      alert(`Les emails suivants existent déjà : ${duplicateEmails.map(trainee => trainee.email_stagiaire).join(', ')}`);
      const uniqueTrainees = newTrainees.filter(trainee => !existingEmails.includes(trainee.email_stagiaire));
      setTrainees([...trainees, ...uniqueTrainees]);
      toast.success(`${uniqueTrainees.length} stagiaires ajoutés avec succès`);
    } else {
      setTrainees([...trainees, ...newTrainees]);
      toast.success(`${newTrainees.length} stagiaires ajoutés avec succès`);
    }
  };

  const handleTraineeToggle = (traineeId: number) => {
    setSelectedTrainees(prev =>
      prev.includes(traineeId) ? prev.filter(id => id !== traineeId) : [...prev, traineeId]
    );
  };

  const handleAddTraineesToSession = (sessionId: string) => {
    const updatedTrainees = trainees.map(trainee =>
      selectedTrainees.includes(trainee.id_stagiaire)
        ? { ...trainee, sessions: [...trainee.sessions || [], availableSessions.find(s => s.id === sessionId)!] }
        : trainee
    );
    setTrainees(updatedTrainees);
    setSelectedTrainees([]);
    toast.success('Stagiaires ajoutés à la session avec succès');
  };

  const filteredTrainees = trainees
    .filter(trainee => {
      const matchesSearch = trainee.prenom_stagiaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trainee.nom_stagiaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trainee.email_stagiaire.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSession = selectedSession === 'all' ||
                            (trainee.sessions || []).some(s => s.titre.toLowerCase().includes(selectedSession.toLowerCase()));
      return matchesSearch && matchesSession;
    })
    .sort((a, b) => a.nom_stagiaire.localeCompare(b.nom_stagiaire)); // Tri alphabétique par nom

  // Logique de pagination
  const indexOfLastTrainee = currentPage * traineesPerPage;
  const indexOfFirstTrainee = indexOfLastTrainee - traineesPerPage;
  const currentTrainees = filteredTrainees.slice(indexOfFirstTrainee, indexOfLastTrainee);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredTrainees.length / traineesPerPage)) {
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

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Liste des Stagiaires</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un stagiaire</span>
          </button>
          <label className="bg-secondary text-white px-4 py-2 rounded-md flex items-center space-x-2 cursor-pointer hover:bg-secondary-dark">
            <Plus className="h-4 w-4" />
            <span>Importer</span>
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          {selectedTrainees.length > 0 && (
            <select
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              onChange={(e) => handleAddTraineesToSession(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Ajouter à une session</option>
              {availableSessions.map(session => (
                <option key={session.id_session} value={session.id_session}>
                  {session.titre}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher un stagiaire..."
                  className="pl-10 border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-64">
              <select
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
              >
                {sessions.map(session => (
                  <option key={session.id_session} value={session.id_session}>
                    {session.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="bg-secondary text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-secondary-dark">
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedTrainees.length === currentTrainees.length}
                    onChange={(e) =>
                      setSelectedTrainees(e.target.checked ? currentTrainees.map(t => t.id_stagiaire) : [])
                    }
                    className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stagiaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fonction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTrainees.map((trainee) => (
                <tr
                  key={trainee.id_stagiaire} // Utilisez une clé unique ici
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={(e) => {
                    if (!e.target.closest('input[type="checkbox"]')) {
                      handleViewDetails(trainee);
                    }
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedTrainees.includes(trainee.id_stagiaire)}
                      onChange={() => handleTraineeToggle(trainee.id_stagiaire)}
                      className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {trainee.prenom_stagiaire} {trainee.nom_stagiaire}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{trainee.email_stagiaire}</span>
                      </div>
                      {trainee.telephone_stagiaire && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{trainee.telephone_stagiaire}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <div className="text-sm text-gray-900">{trainee.entreprise_stagiaire}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{trainee.fonction_stagiaire}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {(trainee.sessions || []).map((session, index) => (
                        <span
                          key={`${trainee.id_stagiaire}-${session.id_session || index}`}
                          className="px-2 py-1 text-xs font-medium bg-primary bg-opacity-10 text-primary rounded-full"
                        >
                          {session.titre}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(trainee);
                      }}
                      className="text-primary hover:text-primary-dark mr-3"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(trainee.id_stagiaire);
                      }}
                      className="text-red-600 hover:text-red-800 mr-3"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              Page {currentPage} de {Math.ceil(filteredTrainees.length / traineesPerPage)}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredTrainees.length / traineesPerPage)}
              className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              <span className="mr-2">Suivant</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddTraineeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          formData={addFormData}
          setFormData={setAddFormData}
          onSubmit={handleAddSubmit}
          availableSessions={availableSessions}
        />
      )}

      {isEditModalOpen && (
        <EditTraineeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          formData={editFormData}
          setFormData={setEditFormData}
          onSubmit={handleEditSubmit}
          availableSessions={availableSessions}
          traineeId={selectedTrainee?.id_stagiaire} // Pass traineeId to EditTraineeModal
        />
      )}

      {isDetailsModalOpen && selectedTrainee && (
        <TraineeDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          trainee={selectedTrainee}
          onEdit={() => handleEdit(selectedTrainee)}
        />
      )}
    </div>
  );
};

export default TraineeList;
