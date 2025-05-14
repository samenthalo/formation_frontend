import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Plus, Mail, Phone, X, CheckSquare, BookOpen, User, Trash, ChevronLeft, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Creneau {
  jour: string;
  heure_debut: string;
  heure_fin: string;
}

interface Session {
  id_session: string;
  titre: string;
  description?: string;
  lieu?: string;
  nb_heures?: number;
  nb_inscrits?: number;
  creneaux: Creneau[];
}

interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  specialties: string;
  bio: string | null;
  is_active: boolean;
  sessions: Session[];
  linkedin: string;
  cv_path: string | null;
}

const InstructorList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialties: '',
    bio: '',
    sessions: [] as Session[],
    linkedin: '',
    cv_path: null as string | null
  });

  // État pour la pagination des instructeurs
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const instructorsPerPage = 25;

  // État pour la pagination des sessions
  const [currentSessionPage, setCurrentSessionPage] = useState(1);
  const sessionsPerPage = 10;

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await axios.get('http://localhost:8000/formateur');
        const data = response.data.map(instructor => ({
          id: instructor.id_formateur,
          first_name: instructor.prenom,
          last_name: instructor.nom,
          email: instructor.email,
          phone: instructor.telephone,
          specialties: instructor.specialites || '',
          bio: instructor.bio,
          is_active: instructor.est_actif,
          sessions: instructor.sessions || [],
          linkedin: instructor.linkedin || '',
          cv_path: instructor.cv ? `http://localhost:8000/uploads/${instructor.cv}` : null,
        }));
        setInstructors(data);
        setFilteredInstructors(data); // Initialisez également les instructeurs filtrés

        // Extraire les spécialités uniques et les normaliser
        const uniqueSpecialties = Array.from(new Set(data.flatMap(instructor => instructor.specialties.split(',').map(specialty => specialty.trim().toLowerCase()))));
        setSpecialties(uniqueSpecialties);
      } catch (error) {
        console.error('Erreur lors de la récupération des formateurs:', error);
        toast.error('Erreur lors de la récupération des formateurs');
      }
    };

    fetchInstructors();
  }, []);

  useEffect(() => {
    // Filtrer les instructeurs en fonction du terme de recherche et de la spécialité sélectionnée
    const filtered = instructors.filter(instructor => {
      const matchesSearch = instructor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            instructor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            instructor.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'all' || instructor.specialties.split(',').map(specialty => specialty.trim().toLowerCase()).includes(selectedSpecialty.toLowerCase());
      return matchesSearch && matchesSpecialty;
    });
    setFilteredInstructors(filtered);
  }, [searchTerm, selectedSpecialty, instructors]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, cv_path: URL.createObjectURL(file) }));
    } else {
      toast.error('Veuillez sélectionner un fichier PDF');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, cv_path: null }));
  };

  const handleAdd = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      specialties: '',
      bio: '',
      sessions: [],
      linkedin: '',
      cv_path: null
    });
    setSelectedFile(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setFormData({
      first_name: instructor.first_name,
      last_name: instructor.last_name,
      email: instructor.email,
      phone: instructor.phone || '',
      specialties: instructor.specialties,
      bio: instructor.bio || '',
      sessions: instructor.sessions,
      linkedin: instructor.linkedin,
      cv_path: instructor.cv_path
    });
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(`http://localhost:8000/formateur/${id}`);
      if (response.status === 200) {
        setInstructors(prevInstructors => prevInstructors.filter(instructor => instructor.id !== id));
        toast.success('Formateur supprimé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du formateur:', error);
      toast.error('Erreur lors de la suppression du formateur');
    }
  };

  const handleViewDetails = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setCurrentSessionPage(1); // Réinitialiser la page des sessions lors de l'ouverture des détails
    setIsDetailsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('nom', formData.last_name);
    data.append('prenom', formData.first_name);
    data.append('email', formData.email);
    data.append('telephone', formData.phone);
    data.append('specialites', formData.specialties);
    data.append('bio', formData.bio);
    data.append('linkedin', formData.linkedin);
    if (selectedFile) {
      data.append('cv', selectedFile);
    }

    try {
      const response = await axios.post('http://localhost:8000/formateur', data);
      const newInstructor = {
        id: response.data.formateur.id_formateur,
        first_name: response.data.formateur.prenom,
        last_name: response.data.formateur.nom,
        email: response.data.formateur.email,
        phone: response.data.formateur.telephone,
        specialties: response.data.formateur.specialites,
        bio: response.data.formateur.bio,
        is_active: response.data.formateur.est_actif,
        sessions: [],
        linkedin: response.data.formateur.linkedin,
        cv_path: response.data.formateur.cv_path ? `http://localhost:8000/uploads/${response.data.formateur.cv_path}` : null
      };
      setInstructors(prevInstructors => [...prevInstructors, newInstructor]);
      setFilteredInstructors(prevInstructors => [...prevInstructors, newInstructor]); // Mettre à jour filteredInstructors
      setIsAddModalOpen(false);
      toast.success('Formateur ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      toast.error('Erreur lors de la soumission du formulaire');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstructor) return;

    const data = new FormData();
    data.append('nom', formData.last_name);
    data.append('prenom', formData.first_name);
    data.append('email', formData.email);
    data.append('telephone', formData.phone);
    data.append('specialites', formData.specialties);
    data.append('bio', formData.bio);
    data.append('linkedin', formData.linkedin); // Ajoutez cette ligne
    if (selectedFile) {
      data.append('cv', selectedFile);
    }

    try {
      const response = await axios.post(`http://localhost:8000/formateur/${selectedInstructor.id}`, data);
      const updatedInstructor = {
        id: response.data.formateur.id_formateur,
        first_name: response.data.formateur.prenom,
        last_name: response.data.formateur.nom,
        email: response.data.formateur.email,
        phone: response.data.formateur.telephone,
        specialties: response.data.formateur.specialites,
        bio: response.data.formateur.bio,
        is_active: response.data.formateur.est_actif,
        sessions: [],
        linkedin: response.data.formateur.linkedin,
        cv_path: response.data.formateur.cv_path ? `http://localhost:8000/uploads/${response.data.formateur.cv_path}` : null
      };
      setInstructors(prevInstructors =>
        prevInstructors.map(instructor =>
          instructor.id === selectedInstructor.id ? updatedInstructor : instructor
        )
      );
      setIsEditModalOpen(false);
      toast.success('Formateur mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du formateur:', error);
      toast.error('Erreur lors de la mise à jour du formateur');
    }
  };

  const renderForm = (onSubmit: (e: React.FormEvent) => void, isEdit: boolean) => (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="input-field"
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
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input-field"
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
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Spécialités
          </label>
          <input
            type="text"
            value={formData.specialties}
            onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
            className="input-field"
            placeholder="Séparées par des virgules"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="input-field h-24 resize-none"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn
          </label>
          <input
            type="url"
            value={formData.linkedin}
            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            className="input-field"
            placeholder="Lien vers le profil LinkedIn"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CV (PDF)
          </label>
          {formData.cv_path ? (
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">{formData.cv_path.split('/').pop()}</span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-700"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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

      <div className="md:col-span-3 flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={() => isEdit ? setIsEditModalOpen(false) : setIsAddModalOpen(false)}
          className="btn-secondary"
        >
          Annuler
        </button>
        <button type="submit" className="btn-primary flex items-center space-x-2">
          <CheckSquare className="h-5 w-5" />
          <span>{isEdit ? 'Enregistrer' : 'Ajouter'}</span>
        </button>
      </div>
    </form>
  );

  // Logique de pagination des instructeurs
  const indexOfLastInstructor = currentPage * instructorsPerPage;
  const indexOfFirstInstructor = indexOfLastInstructor - instructorsPerPage;
  const currentInstructors = filteredInstructors.slice(indexOfFirstInstructor, indexOfLastInstructor);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredInstructors.length / instructorsPerPage)) {
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

  // Logique de pagination des sessions
  const indexOfLastSession = currentSessionPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = selectedInstructor?.sessions.slice(indexOfFirstSession, indexOfLastSession) || [];

  const paginateSessions = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil((selectedInstructor?.sessions.length || 0) / sessionsPerPage)) {
      setCurrentSessionPage(pageNumber);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Liste des Formateurs</h1>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter un formateur</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher un formateur..."
                  className="pl-10 input-field w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-64">
              <select
                className="input-field w-full"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                <option value="all">Toutes les spécialités</option>
                {specialties.map((specialty, index) => (
                  <option key={index} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
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
                  Formateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spécialités
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentInstructors.map((instructor) => (
                <tr
                  key={instructor.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewDetails(instructor)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {instructor.first_name} {instructor.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{instructor.email}</span>
                      </div>
                      {instructor.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{instructor.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {instructor.specialties && typeof instructor.specialties === 'string'
                        ? instructor.specialties.split(',').map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs font-medium bg-primary bg-opacity-10 text-primary rounded-full"
                            >
                              {specialty.trim()}
                            </span>
                          ))
                        : null}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {instructor.bio}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(instructor);
                      }}
                      className="text-primary hover:text-primary-dark mr-3"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(instructor.id);
                      }}
                      className="text-red-500 hover:text-red-700"
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
              Page {currentPage} de {Math.ceil(filteredInstructors.length / instructorsPerPage)}
            </span>
            <span className="text-gray-700">
              {indexOfFirstInstructor + 1} - {Math.min(indexOfLastInstructor, filteredInstructors.length)} sur {filteredInstructors.length} lignes
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredInstructors.length / instructorsPerPage)}
              className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              <span className="mr-2">Suivant</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'ajout */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Ajouter un formateur</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {renderForm(handleSubmit, false)}
          </div>
        </div>
      )}

      {/* Modal de modification */}
      {isEditModalOpen && selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Modifier le formateur</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {renderForm(handleUpdate, true)}
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {isDetailsModalOpen && selectedInstructor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Détails du formateur</h2>
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
                  <h3 className="text-xl font-semibold">
                    {selectedInstructor.first_name} {selectedInstructor.last_name}
                  </h3>
                  <p className="text-gray-600">{selectedInstructor.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="h-5 w-5" />
                      <span>{selectedInstructor.email}</span>
                    </div>
                    {selectedInstructor.phone && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="h-5 w-5" />
                        <span>{selectedInstructor.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Spécialités</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInstructor.specialties && typeof selectedInstructor.specialties === 'string'
                      ? selectedInstructor.specialties.split(',').map((specialty, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm"
                          >
                            {specialty.trim()}
                          </span>
                        ))
                      : null}
                  </div>
                </div>

                {selectedInstructor.bio && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Biographie</h4>
                    <p className="text-gray-600">{selectedInstructor.bio}</p>
                  </div>
                )}

                {selectedInstructor.linkedin && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">LinkedIn</h4>
                    <a href={selectedInstructor.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {selectedInstructor.linkedin}
                    </a>
                  </div>
                )}

                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">CV</h4>
                  {selectedInstructor.cv_path ? (
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600">{selectedInstructor.cv_path.split('/').pop()}</span>
                      <a
                        href={selectedInstructor.cv_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark"
                      >
                        Télécharger
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-600">Aucun CV disponible</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Historique des sessions</h4>
                  {currentSessions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentSessions.map((session) => (
                        <div key={session.id_session} className="border border-gray-200 p-3 rounded-lg shadow-sm bg-white">
                          <h5 className="text-base font-semibold text-gray-900">{session.titre}</h5>
                          {session.description && <p className="text-gray-600 mt-1 text-sm">{session.description}</p>}
                          {session.lieu && <p className="text-gray-700 mt-1 text-sm">Lieu: {session.lieu}</p>}
                          {session.nb_heures && <p className="text-gray-700 mt-1 text-sm">Durée: {session.nb_heures} heures</p>}
                          {session.nb_inscrits && <p className="text-gray-700 mt-1 text-sm">Nombre d'inscrits: {session.nb_inscrits}</p>}
                          <h6 className="text-sm font-semibold mt-2 text-gray-800">Créneaux</h6>
                          <div className="space-y-1 mt-1">
                            {session.creneaux.map((creneau, index) => (
                              <div key={index} className="flex justify-between bg-gray-100 p-1 rounded text-xs">
                                <span className="text-gray-700">{creneau.jour}</span>
                                <span className="text-gray-700">{creneau.heure_debut} - {creneau.heure_fin}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Aucune session disponible.</p>
                  )}
                  {/* Contrôles de pagination pour les sessions */}
                  <div className="flex justify-between items-center p-4 bg-white border-t border-gray-200">
                    <button
                      onClick={() => paginateSessions(currentSessionPage - 1)}
                      disabled={currentSessionPage === 1}
                      className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                      <span className="ml-2">Précédent</span>
                    </button>
                    <span className="text-gray-700">
                      Page {currentSessionPage} de {Math.ceil((selectedInstructor?.sessions.length || 0) / sessionsPerPage)}
                    </span>
                    <span className="text-gray-700">
                      {indexOfFirstSession + 1} - {Math.min(indexOfLastSession, selectedInstructor?.sessions.length || 0)} sur {selectedInstructor?.sessions.length || 0} lignes
                    </span>
                    <button
                      onClick={() => paginateSessions(currentSessionPage + 1)}
                      disabled={currentSessionPage === Math.ceil((selectedInstructor?.sessions.length || 0) / sessionsPerPage)}
                      className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                    >
                      <span className="mr-2">Suivant</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="btn-secondary"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleEdit(selectedInstructor);
                }}
                className="btn-primary"
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

export default InstructorList;
