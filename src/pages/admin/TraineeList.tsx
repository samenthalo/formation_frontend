import React, { useState } from 'react';
import { Search, Filter, Plus, Mail, Phone, Building, X, CheckSquare, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface Session {
  id: string;
  title: string;
  date: string;
  description: string;
}

interface Company {
  id: string;
  name: string;
}

interface Trainee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  function: string | null;
  company: Company;
  sessions: Session[];
}

interface TraineeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  function: string;
  company_name: string;
  sessions: Session[];
}

const TraineeList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState('all');
  const [trainees, setTrainees] = useState<Trainee[]>([
    {
      id: uuidv4(),
      first_name: 'Alice',
      last_name: 'Dupont',
      email: 'alice.dupont@example.com',
      phone: '0612345678',
      function: 'Développeur Frontend',
      company: { id: uuidv4(), name: 'TechCorp' },
      sessions: [
        { id: '1', title: 'Formation React Avancé', date: '2023-10-01', description: 'Cours avancé sur React' }
      ]
    },
    {
      id: uuidv4(),
      first_name: 'Bob',
      last_name: 'Martin',
      email: 'bob.martin@example.com',
      phone: '0687654321',
      function: 'Chef de projet',
      company: { id: uuidv4(), name: 'Digital Solutions' },
      sessions: [
        { id: '2', title: 'JavaScript Moderne', date: '2023-10-05', description: 'Introduction à JavaScript moderne' }
      ]
    },
    {
      id: uuidv4(),
      first_name: 'Charlie',
      last_name: 'Brown',
      email: 'charlie.brown@example.com',
      phone: null,
      function: 'Analyste de données',
      company: { id: uuidv4(), name: 'Data Insights' },
      sessions: [
        { id: '3', title: 'Node.js Fondamentaux', date: '2023-10-10', description: 'Introduction à Node.js' }
      ]
    }
  ]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [editFormData, setEditFormData] = useState<TraineeFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    function: '',
    company_name: '',
    sessions: []
  });
  const [addFormData, setAddFormData] = useState<TraineeFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    function: '',
    company_name: '',
    sessions: []
  });

  const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);

  const availableSessions = [
    { id: '1', title: 'Formation React Avancé', date: '2023-10-01', description: 'Cours avancé sur React' },
    { id: '2', title: 'JavaScript Moderne', date: '2023-10-05', description: 'Introduction à JavaScript moderne' },
    { id: '3', title: 'Node.js Fondamentaux', date: '2023-10-10', description: 'Introduction à Node.js' }
  ];

  const sessions = [
    { id: 'all', name: 'Toutes les sessions' },
    { id: '1', name: 'Formation React Avancé' },
    { id: '2', name: 'JavaScript Moderne' },
    { id: '3', name: 'Node.js Fondamentaux' }
  ];

  const handleEdit = (trainee: Trainee) => {
    setSelectedTrainee(trainee);
    setEditFormData({
      first_name: trainee.first_name,
      last_name: trainee.last_name,
      email: trainee.email,
      phone: trainee.phone || '',
      function: trainee.function || '',
      company_name: trainee.company.name,
      sessions: trainee.sessions
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainee) return;

    const updatedTrainee: Trainee = {
      ...selectedTrainee,
      first_name: editFormData.first_name,
      last_name: editFormData.last_name,
      email: editFormData.email,
      phone: editFormData.phone,
      function: editFormData.function,
      company: {
        id: selectedTrainee.company.id,
        name: editFormData.company_name
      },
      sessions: editFormData.sessions
    };

    setTrainees(trainees.map(t => t.id === selectedTrainee.id ? updatedTrainee : t));
    setIsEditModalOpen(false);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTrainee: Trainee = {
      id: uuidv4(),
      first_name: addFormData.first_name,
      last_name: addFormData.last_name,
      email: addFormData.email,
      phone: addFormData.phone,
      function: addFormData.function,
      company: {
        id: uuidv4(),
        name: addFormData.company_name
      },
      sessions: addFormData.sessions
    };

    setTrainees([...trainees, newTrainee]);
    setIsAddModalOpen(false);
    setAddFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      function: '',
      company_name: '',
      sessions: []
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce stagiaire ?')) {
      setTrainees(trainees.filter(t => t.id !== id));
    }
  };

  const handleSessionToggle = (session: Session, isEdit: boolean) => {
    const updateFormData = isEdit ? setEditFormData : setAddFormData;
    updateFormData(prev => {
      const sessions = prev.sessions;
      if (sessions.some(s => s.id === session.id)) {
        return {
          ...prev,
          sessions: sessions.filter(s => s.id !== session.id)
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
                id: uuidv4(),
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                phone: row.phone || null,
                function: row.function || null,
                company: {
                  id: uuidv4(),
                  name: row.company_name
                },
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

          // Assurez-vous que les colonnes sont dans le bon ordre
          const headerRow = jsonData[0] as string[];
          const firstNameIndex = headerRow.indexOf('first_name');
          const lastNameIndex = headerRow.indexOf('last_name');
          const emailIndex = headerRow.indexOf('email');
          const phoneIndex = headerRow.indexOf('phone');
          const functionIndex = headerRow.indexOf('function');
          const companyNameIndex = headerRow.indexOf('company_name');
          const sessionsIndex = headerRow.indexOf('sessions');

          parsedData = jsonData.slice(1).map((row: any) => ({
            id: uuidv4(),
            first_name: row[firstNameIndex],
            last_name: row[lastNameIndex],
            email: row[emailIndex],
            phone: row[phoneIndex] || null,
            function: row[functionIndex] || null,
            company: {
              id: uuidv4(),
              name: row[companyNameIndex]
            },
            sessions: row[sessionsIndex] ? JSON.parse(row[sessionsIndex]) : []
          }));

          checkForDuplicatesAndUpdate(parsedData);
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const checkForDuplicatesAndUpdate = (newTrainees: Trainee[]) => {
    const existingEmails = trainees.map(trainee => trainee.email);
    const duplicateEmails = newTrainees.filter(trainee => existingEmails.includes(trainee.email));

    if (duplicateEmails.length > 0) {
      alert(`Les emails suivants existent déjà : ${duplicateEmails.map(trainee => trainee.email).join(', ')}`);
      // Filtrer les nouveaux stagiaires pour enlever les doublons
      const uniqueTrainees = newTrainees.filter(trainee => !existingEmails.includes(trainee.email));
      setTrainees([...trainees, ...uniqueTrainees]);
    } else {
      setTrainees([...trainees, ...newTrainees]);
    }
  };

  const handleTraineeToggle = (traineeId: string) => {
    setSelectedTrainees(prev =>
      prev.includes(traineeId) ? prev.filter(id => id !== traineeId) : [...prev, traineeId]
    );
  };

  const handleAddTraineesToSession = (sessionId: string) => {
    const updatedTrainees = trainees.map(trainee =>
      selectedTrainees.includes(trainee.id)
        ? { ...trainee, sessions: [...trainee.sessions, availableSessions.find(s => s.id === sessionId)!] }
        : trainee
    );
    setTrainees(updatedTrainees);
    setSelectedTrainees([]);
  };

  const filteredTrainees = trainees.filter(trainee => {
    const matchesSearch = trainee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainee.company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSession = selectedSession === 'all' ||
                          trainee.sessions.some(s => s.title.toLowerCase().includes(selectedSession.toLowerCase()));
    return matchesSearch && matchesSession;
  });

  const renderForm = (formData: TraineeFormData, setFormData: React.Dispatch<React.SetStateAction<TraineeFormData>>, isEdit: boolean) => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="input-field border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className="input-field border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="input-field border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="input-field border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Entreprise
        </label>
        <input
          type="text"
          value={formData.company_name}
          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          className="input-field border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Nom de l'entreprise"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fonction
        </label>
        <input
          type="text"
          value={formData.function}
          onChange={(e) => setFormData({ ...formData, function: e.target.value })}
          className="input-field border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sessions
        </label>
        <div className="space-y-2">
          {availableSessions.map(session => (
            <label key={session.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.sessions.some(s => s.id === session.id)}
                onChange={() => handleSessionToggle(session, isEdit)}
                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{session.title}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
  
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
                  <option key={session.id} value={session.id}>
                    {session.title}
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
                    <option key={session.id} value={session.id}>
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
                      checked={selectedTrainees.length === filteredTrainees.length}
                      onChange={(e) =>
                        setSelectedTrainees(e.target.checked ? filteredTrainees.map(t => t.id) : [])
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
                {filteredTrainees.map((trainee) => (
                  <tr
                    key={trainee.id}
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
                        checked={selectedTrainees.includes(trainee.id)}
                        onChange={() => handleTraineeToggle(trainee.id)}
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {trainee.first_name} {trainee.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{trainee.email}</span>
                        </div>
                        {trainee.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{trainee.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <div className="text-sm text-gray-900">{trainee.company.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{trainee.function}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {trainee.sessions.map((session, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs font-medium bg-primary bg-opacity-10 text-primary rounded-full"
                          >
                            {session.title}
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
                          handleDelete(trainee.id);
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
          </div>
        </div>
  
        {/* Modal d'ajout */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Ajouter un stagiaire</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleAddSubmit}>
                {renderForm(addFormData, setAddFormData, false)}
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-dark"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-primary-dark">
                    <CheckSquare className="h-5 w-5" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {/* Modal de modification */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Modifier le stagiaire</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                {renderForm(editFormData, setEditFormData, true)}
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-dark"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-primary-dark">
                    <CheckSquare className="h-5 w-5" />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
  
        {/* Modal de détails */}
        {isDetailsModalOpen && selectedTrainee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Détails du stagiaire</h2>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-primary bg-opacity-10 rounded-full">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedTrainee.first_name} {selectedTrainee.last_name}
                    </h3>
                    <p className="text-gray-600">{selectedTrainee.email}</p>
                  </div>
                </div>
  
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Contact</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail className="h-5 w-5" />
                        <span>{selectedTrainee.email}</span>
                      </div>
                      {selectedTrainee.phone && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="h-5 w-5" />
                          <span>{selectedTrainee.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Entreprise</h4>
                    <div className="flex items-center space-x-2">
                      <Building className="h-5 w-4 text-gray-400" />
                      <div className="text-sm text-gray-900">{selectedTrainee.company.name}</div>
                    </div>
                  </div>
  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Fonction</h4>
                    <div className="text-sm text-gray-900">{selectedTrainee.function}</div>
                  </div>
  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Sessions</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTrainee.sessions.map((session, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm"
                        >
                          {session.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-dark"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    handleEdit(selectedTrainee);
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default TraineeList;
  
