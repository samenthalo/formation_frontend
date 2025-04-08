import React, { useState } from 'react';
import { Search, Filter, Plus, Mail, Phone, Building, X, CheckSquare, BookOpen, User, Trash } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Session {
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[]; 
}

interface Instructor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  specialties: string[];
  bio: string | null;
  is_active: boolean;
  sessions: Session[];
  linkedin: string;
  cv_filename: string | null; // Nouveau champ pour le nom du fichier CV
}

const InstructorList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    bio: '',
    sessions: [] as Session[],
    linkedin: '',
    cv_filename: null as string | null // Initialisation du champ CV
  });

  const [instructors, setInstructors] = useState<Instructor[]>([
    {
      id: '1',
      first_name: 'Sophie',
      last_name: 'Bernard',
      email: 'sophie.bernard@formation.com',
      phone: '0612345678',
      specialties: ['React', 'JavaScript', 'TypeScript'],
      bio: 'Experte en développement frontend avec 10 ans d\'expérience',
      is_active: true,
      sessions: [
        { id: 's1', title: 'Introduction à React', date: '2023-01-15', description: 'Session de formation sur les bases de React' },
        { id: 's2', title: 'Avancé JavaScript', date: '2023-02-20', description: 'Session de formation sur les concepts avancés de JavaScript' }
      ],
      linkedin: 'https://linkedin.com/in/sophiebernard',
      cv_filename: 'CV_Sophie_Bernard.pdf' // Exemple de nom de fichier CV
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
      sessions: [
        { id: 's3', title: 'Introduction à Node.js', date: '2023-03-10', description: 'Session de formation sur les bases de Node.js' }
      ],
      linkedin: 'https://linkedin.com/in/marcdubois',
      cv_filename: 'CV_Marc_Dubois.pdf' // Exemple de nom de fichier CV
    }
  ]);

  const specialties = [
    { id: 'all', name: 'Toutes les spécialités' },
    { id: 'react', name: 'React' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'nodejs', name: 'Node.js' },
    { id: 'express', name: 'Express' },
    { id: 'mongodb', name: 'MongoDB' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, cv_filename: file.name }));
    } else {
      alert('Veuillez sélectionner un fichier PDF');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, cv_filename: null }));
  };

  const handleAdd = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      specialties: [],
      bio: '',
      sessions: [],
      linkedin: '',
      cv_filename: null
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
      cv_filename: instructor.cv_filename
    });
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setInstructors(prevInstructors => prevInstructors.filter(instructor => instructor.id !== id));
  };

  const handleViewDetails = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setIsDetailsModalOpen(true);
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => {
      const specialties = prev.specialties;
      if (specialties.includes(specialty)) {
        return {
          ...prev,
          specialties: specialties.filter(s => s !== specialty)
        };
      } else {
        return {
          ...prev,
          specialties: [...specialties, specialty]
        };
      }
    });
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Spécialités
          </label>
          <div className="space-y-2">
            {specialties.slice(1).map(specialty => (
              <label key={specialty.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.specialties.includes(specialty.name)}
                  onChange={() => handleSpecialtyToggle(specialty.name)}
                  className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="text-sm text-gray-700">{specialty.name}</span>
              </label>
            ))}
          </div>
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
          {formData.cv_filename ? (
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">{formData.cv_filename}</span>
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
                {specialties.map(specialty => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
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
              {instructors.map((instructor) => (
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
                      {instructor.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium bg-primary bg-opacity-10 text-primary rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
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
            {renderForm(() => {}, false)}
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
            {renderForm(() => {}, true)}
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
                    {selectedInstructor.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
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
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Documents</h4>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">{selectedInstructor.cv_filename}</span>
                    <button className="text-primary hover:text-primary-dark">
                      Télécharger
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Historique des sessions</h4>
                  <div className="space-y-4">
                    {selectedInstructor.sessions.map(session => (
                      <div key={session.id} className="border p-4 rounded-lg shadow-sm">
                        <h5 className="text-lg font-semibold">{session.title}</h5>
                        <p className="text-gray-600">{session.date}</p>
                        <p className="text-gray-700">{session.description}</p>
                      </div>
                    ))}
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
