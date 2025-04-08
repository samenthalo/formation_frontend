import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

interface Session {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  instructor: string;
  participants: number;
  maxParticipants: number;
  description?: string;
}

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionsData = await api.sessions.getAll();
        const transformedSessions = sessionsData.map(session => ({
          id: session.id,
          title: session.formation.title,
          date: session.date,
          startTime: session.start_time,
          endTime: session.end_time,
          location: session.location,
          instructor: `${session.instructor.first_name} ${session.instructor.last_name}`,
          participants: session.formation.enrolled_count,
          maxParticipants: session.formation.max_participants,
          description: session.formation.description || undefined
        }));
        setSessions(transformedSessions);
      } catch (error) {
        console.error('Erreur lors du chargement des sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  // Exemple de fonction ou de composant dans la page du calendrier
const handleCreateSession = () => {
  navigate('/admin/formations/new', { state: { origin: 'calendar' } });
};

// Dans le JSX, par exemple un bouton
<button onClick={handleCreateSession}>Créer une nouvelle session</button>


  const getSessionsForDate = (date: number): Session[] => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return sessions.filter(session => session.date === dateStr);
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleEditSession = () => {
    if (selectedSession) {
      navigate(`/admin/sessions/edit/${selectedSession.id}`);
      setIsModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Calendrier des sessions</h1>
        <Link to="/admin/sessions/new" className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nouvelle session</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></div>
                <span className="text-sm text-gray-600">Formation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {dayNames.map((day) => (
              <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-white p-2 h-32" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const date = index + 1;
              const daysSessions = getSessionsForDate(date);
              const isToday = new Date().getDate() === date &&
                            new Date().getMonth() === currentDate.getMonth() &&
                            new Date().getFullYear() === currentDate.getFullYear();

              return (
                <div
                  key={date}
                  className={`bg-white p-2 h-32 border-t ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className="font-medium text-sm mb-1">
                    {date}
                  </div>
                  <div className="space-y-1">
                    {daysSessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => handleSessionClick(session)}
                        className="w-full text-left p-2 rounded border bg-blue-100 text-blue-800 border-blue-200 hover:opacity-80 transition-opacity"
                      >
                        <div className="font-medium truncate">{session.title}</div>
                        <div className="text-xs opacity-75">{session.startTime} - {session.endTime}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de détails de session */}
      {isModalOpen && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold">{selectedSession.title}</h2>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 border-blue-200">
                    Formation
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(selectedSession.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedSession.description && (
                <p className="text-gray-600">{selectedSession.description}</p>
              )}
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <span>{selectedSession.startTime} - {selectedSession.endTime}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-5 w-5" />
                <span>{selectedSession.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="h-5 w-5" />
                <span>
                  {selectedSession.participants} / {selectedSession.maxParticipants} participants
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">Formateur</p>
                <p className="font-medium">{selectedSession.instructor}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                Fermer
              </button>
              <button
                onClick={handleEditSession}
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

export default Calendar;
