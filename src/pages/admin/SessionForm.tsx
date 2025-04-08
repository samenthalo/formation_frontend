import React, { useState, useEffect } from 'react';
import { UserCircle, Search, Calendar, Clock, MapPin, BookOpen, CheckSquare, Building, Monitor, XCircle, PlusCircle, Trash } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface SessionFormData {
  formation_id: string;
  schedule: { date: string; start_time: string; end_time: string; instructor_id: string }[];
  location: string;
  mode: 'presentiel' | 'distanciel';
  video_link?: string;
  default_instructor_id?: string;
  responsable?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

const SessionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const formations: Formation[] = [
    { id: '1', title: 'Formation React', description: 'Apprenez à développer des applications web avec React.' },
    { id: '2', title: 'Formation JavaScript', description: 'Maîtrisez les bases du langage JavaScript.' },
    { id: '3', title: 'Formation Python', description: 'Découvrez la programmation avec Python.' }
  ];

  const instructors: Instructor[] = [
    { id: '1', first_name: 'John', last_name: 'Doe', tags: ['React', 'JavaScript'] },
    { id: '2', first_name: 'Jane', last_name: 'Smith', tags: ['Python', 'Data Science'] },
    { id: '3', first_name: 'Alice', last_name: 'Johnson', tags: ['DevOps', 'Cloud'] }
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SessionFormData>({
    formation_id: '',
    schedule: [{ date: '', start_time: '', end_time: '', instructor_id: '' }],
    location: '',
    mode: 'presentiel',
    video_link: '',
    default_instructor_id: '',
    responsable: {
      first_name: '',
      last_name: '',
      email: '',
      phone: ''
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

  useEffect(() => {
    if (id) {
      const savedSessions = JSON.parse(localStorage.getItem('sessions') || '[]');
      const sessionData = savedSessions.find((session: SessionFormData) => session.formation_id === id);

      if (sessionData) {
        setFormData(sessionData);
      }
    }

    setIsLoading(false);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasError = formData.schedule.some(
      item => new Date(`${item.date}T${item.end_time}`) < new Date(`${item.date}T${item.start_time}`)
    );

    if (hasError) {
      setError('L\'heure de fin ne peut pas être antérieure à l\'heure de début pour une même date.');
      return;
    }

    const savedSessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    if (id) {
      const updatedSessions = savedSessions.map((session: SessionFormData) =>
        session.formation_id === id ? formData : session
      );
      localStorage.setItem('sessions', JSON.stringify(updatedSessions));
    } else {
      localStorage.setItem('sessions', JSON.stringify([...savedSessions, formData]));
    }

    console.log('Session sauvegardée:', formData);
    console.log('Sessions dans localStorage:', JSON.parse(localStorage.getItem('sessions') || '[]'));
    navigate('/admin/formations');
  };

  const handleAddSchedule = () => {
    setFormData(prevData => ({
      ...prevData,
      schedule: [...prevData.schedule, { date: '', start_time: '', end_time: '', instructor_id: prevData.default_instructor_id || '' }]
    }));
  };

  const handleRemoveSchedule = (index: number) => {
    setFormData(prevData => {
      const schedule = [...prevData.schedule];
      schedule.splice(index, 1);
      return { ...prevData, schedule };
    });
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    setFormData(prevData => {
      const schedule = [...prevData.schedule];
      schedule[index] = { ...schedule[index], [field]: value };
      return { ...prevData, schedule };
    });
  };

  const handleDefaultInstructorChange = (value: string) => {
    setFormData(prevData => {
      const updatedSchedule = prevData.schedule.map(item => ({
        ...item,
        instructor_id: value
      }));
      return { ...prevData, schedule: updatedSchedule, default_instructor_id: value };
    });
  };

  const handleShowSummary = (formation: Formation) => {
    setSelectedFormation(formation);
    setShowSummary(true);
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    setSelectedFormation(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{id ? 'Modifier' : 'Nouvelle'} Session</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md">
        <div className="p-6 space-y-6">
          {/* Formation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formation
            </label>
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={formData.formation_id}
                onChange={(e) => setFormData({ ...formData, formation_id: e.target.value })}
                className="pl-10 input-field w-full"
                required
              >
                <option value="">Sélectionnez une formation</option>
                {formations.map(formation => (
                  <option key={formation.id} value={formation.id}>
                    {formation.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleShowSummary(formations.find(f => f.id === formData.formation_id)!)}
                className="absolute right-3 text-gray-400 hover:text-gray-600"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Formateur par défaut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formateur par défaut
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircle className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={formData.default_instructor_id}
                onChange={(e) => handleDefaultInstructorChange(e.target.value)}
                className="pl-10 input-field w-full"
                required
              >
                <option value="">Sélectionnez un formateur</option>
                {instructors.map(instructor => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.first_name} {instructor.last_name} ({instructor.tags.join(', ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Planning */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Planning
            </label>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Heure de début
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Heure de fin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Formateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.schedule.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="date"
                          value={item.date}
                          onChange={(e) => handleScheduleChange(index, 'date', e.target.value)}
                          className="input-field w-full"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="time"
                          value={item.start_time}
                          onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)}
                          className="input-field w-full"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="time"
                          value={item.end_time}
                          onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)}
                          className="input-field w-full"
                          required
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={item.instructor_id}
                          onChange={(e) => handleScheduleChange(index, 'instructor_id', e.target.value)}
                          className="input-field w-full"
                          required
                        >
                          <option value="">Sélectionnez un formateur</option>
                          {instructors.map(instructor => (
                            <option key={instructor.id} value={instructor.id}>
                              {instructor.first_name} {instructor.last_name} ({instructor.tags.join(', ')})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleRemoveSchedule(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={handleAddSchedule}
              className="flex items-center text-blue-500 hover:text-blue-700 mt-4"
            >
              <PlusCircle className="h-5 w-5 mr-1" />
              Ajouter une date
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg mt-4">
              <XCircle className="h-5 w-5 inline-block mr-2" />
              {error}
            </div>
          )}

          {/* Lieu et Mode */}
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="pl-10 input-field w-full"
                  placeholder="Ex: Salle 302"
                  required
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {formData.mode === 'presentiel' ? (
                    <Building className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Monitor className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value as 'presentiel' | 'distanciel' })}
                  className="pl-10 input-field w-full"
                  required
                >
                  <option value="presentiel">Présentiel</option>
                  <option value="distanciel">Distanciel</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lien de visio et Responsable de formation */}
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lien de visio
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={formData.video_link}
                  onChange={(e) => setFormData({ ...formData, video_link: e.target.value })}
                  className="pl-10 input-field w-full"
                  placeholder="Ex: https://meet.google.com/abc-defg-hij"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Responsable
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.responsable?.first_name || ''}
                    onChange={(e) => setFormData({ ...formData, responsable: { ...formData.responsable, first_name: e.target.value } })}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.responsable?.last_name || ''}
                    onChange={(e) => setFormData({ ...formData, responsable: { ...formData.responsable, last_name: e.target.value } })}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.responsable?.email || ''}
                    onChange={(e) => setFormData({ ...formData, responsable: { ...formData.responsable, email: e.target.value } })}
                    className="input-field w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.responsable?.phone || ''}
                    onChange={(e) => setFormData({ ...formData, responsable: { ...formData.responsable, phone: e.target.value } })}
                    className="input-field w-full"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/formations')}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button type="submit" className="btn-primary flex items-center space-x-2">
            <CheckSquare className="h-5 w-5" />
            <span>{id ? 'Mettre à jour' : 'Créer'} la session</span>
          </button>
        </div>
      </form>

      {/* Résumé de la formation */}
      {showSummary && selectedFormation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Résumé de la formation</h2>
              <button onClick={handleCloseSummary} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-700">{selectedFormation.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionForm;
