import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Users, Link as LinkIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Creneau {
  date: string;
  startTime: string;
  endTime: string;
}

interface Session {
  id: string;
  title: string;
  description?: string;
  location: string;
  instructor: string;
  participants: number;
  maxParticipants: number;
  creneaux: Creneau[];
  mode: string; // Ajout du champ mode
  lien?: string; // Ajout du champ lien
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
        const response = await api.get('/sessionformation'); // Assure-toi que cette URL correspond à ta route Symfony
        const sessionsData = response.data;
        const transformedSessions = sessionsData.map(session => ({
          id: session.id_session,
          title: session.titre,
          description: session.description || undefined,
          location: session.lieu,
          instructor: session.formateur ? `${session.formateur.prenom} ${session.formateur.nom}` : 'Inconnu',
          participants: session.nb_inscrits,
          maxParticipants: session.nb_heures, // Assure-toi que ce champ est correct
          creneaux: session.creneaux.map(creneau => ({
            date: creneau.jour,
            startTime: creneau.heure_debut,
            endTime: creneau.heure_fin
          })),
          mode: session.mode, // Ajout du mode
          lien: session.lien // Ajout du lien
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

  const getCreneauxForDate = (date: number): { session: Session, creneau: Creneau }[] => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const creneauxForDate: { session: Session, creneau: Creneau }[] = [];

    sessions.forEach(session => {
      session.creneaux.forEach(creneau => {
        if (creneau.date === dateStr) {
          creneauxForDate.push({ session, creneau });
        }
      });
    });

    return creneauxForDate;
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
              <div key={`empty-${index}`} className="bg-white p-2 h-40" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const date = index + 1;
              const daysCreneaux = getCreneauxForDate(date);
              const isToday = new Date().getDate() === date &&
                            new Date().getMonth() === currentDate.getMonth() &&
                            new Date().getFullYear() === currentDate.getFullYear();

              return (
                <div
                  key={date}
                  className={`bg-white p-2 h-40 border-t ${isToday ? 'bg-blue-50' : ''}`}
                >
                  <div className="font-medium text-sm mb-1">
                    {date}
                  </div>
                  <div className="space-y-1">
                    {daysCreneaux.map(({ session, creneau }) => (
                      <button
                        key={`${session.id}-${creneau.date}`}
                        onClick={() => handleSessionClick(session)}
                        className="w-full text-left p-2 rounded border bg-blue-100 text-blue-800 border-blue-200 hover:opacity-80 transition-opacity text-xs"
                      >
                        <div className="font-medium truncate">{session.title}</div>
                        <div className="text-xs opacity-75">{creneau.startTime} - {creneau.endTime}</div>
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
                  {selectedSession.creneaux.map(creneau => (
                    <div key={creneau.date}>
                      {new Date(creneau.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  ))}
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
              {selectedSession.creneaux.map(creneau => (
                <div key={creneau.date} className="flex items-center space-x-2 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <span>{creneau.startTime} - {creneau.endTime}</span>
                </div>
              ))}
              {selectedSession.lien ? (
                <div className="flex items-center space-x-2 text-gray-600">
                  <LinkIcon className="h-5 w-5" />
                  <a href={selectedSession.lien} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                    Lien de la session
                  </a>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-5 w-5" />
                  <span>{selectedSession.location}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="h-5 w-5" />
                <span>
                  {selectedSession.participants} participants
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
