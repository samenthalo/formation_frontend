import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Search, Filter, X, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface Student {
  id: number;
  name: string;
  email: string;
  attendance: {
    morning: {
      status: 'present' | 'absent' | 'late' | null;
      time?: string;
      note?: string;
    };
    afternoon: {
      status: 'present' | 'absent' | 'late' | null;
      time?: string;
      note?: string;
    };
  };
}

interface Session {
  id: number;
  title: string;
  date: string;
  time: {
    morning: {
      start: string;
      end: string;
    };
    afternoon: {
      start: string;
      end: string;
    };
  };
  location: string;
  totalStudents: number;
  description: string;
  prerequisites: string[];
  objectives: string[];
  materials: string[];
  students: Student[];
}

const SessionManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{id: number, period: 'morning' | 'afternoon'} | null>(null);
  const [isLateModalOpen, setIsLateModalOpen] = useState(false);
  const [lateTime, setLateTime] = useState('');
  const [lateNote, setLateNote] = useState('');

  // État local pour les sessions
  const [sessionsData, setSessionsData] = useState<Session[]>([
    {
      id: 1,
      title: "React Avancé - Hooks",
      date: "2024-03-20",
      time: {
        morning: {
          start: "09:00",
          end: "12:00"
        },
        afternoon: {
          start: "14:00",
          end: "17:00"
        }
      },
      location: "Salle 302",
      totalStudents: 15,
      description: "Introduction aux React Hooks et leurs cas d'utilisation",
      prerequisites: ["Bases de React", "JavaScript ES6+"],
      objectives: [
        "Comprendre le concept des Hooks",
        "Maîtriser useState et useEffect",
        "Créer des hooks personnalisés"
      ],
      materials: [
        "Support de cours PDF",
        "Exercices pratiques",
        "Projet de mise en situation"
      ],
      students: [
        {
          id: 1,
          name: "Marie Martin",
          email: "marie.martin@email.com",
          attendance: {
            morning: { status: null },
            afternoon: { status: null }
          }
        },
        {
          id: 2,
          name: "Jean Dupont",
          email: "jean.dupont@email.com",
          attendance: {
            morning: { status: null },
            afternoon: { status: null }
          }
        },
        {
          id: 3,
          name: "Sophie Bernard",
          email: "sophie.bernard@email.com",
          attendance: {
            morning: { status: null },
            afternoon: { status: null }
          }
        }
      ]
    },
    {
      id: 2,
      title: "JavaScript ES6+",
      date: "2024-03-21",
      time: {
        morning: {
          start: "09:00",
          end: "12:00"
        },
        afternoon: {
          start: "14:00",
          end: "17:00"
        }
      },
      location: "Salle 201",
      totalStudents: 18,
      description: "Les nouveautés de JavaScript ES6+ et les bonnes pratiques",
      prerequisites: ["Bases de JavaScript", "Programmation orientée objet"],
      objectives: [
        "Maîtriser les nouvelles fonctionnalités ES6+",
        "Utiliser les promesses et async/await",
        "Optimiser son code JavaScript"
      ],
      materials: [
        "Slides de présentation",
        "Exercices corrigés",
        "Documentation en ligne"
      ],
      students: [
        {
          id: 4,
          name: "Pierre Durand",
          email: "pierre.durand@email.com",
          attendance: {
            morning: { status: null },
            afternoon: { status: null }
          }
        },
        {
          id: 5,
          name: "Julie Lambert",
          email: "julie.lambert@email.com",
          attendance: {
            morning: { status: null },
            afternoon: { status: null }
          }
        }
      ]
    }
  ]);

  const handleViewDetails = (sessionId: number) => {
    setSelectedSession(sessionId);
    setIsDetailsModalOpen(true);
  };

  const handleAttendance = (sessionId: number) => {
    setSelectedSession(sessionId);
    setIsAttendanceModalOpen(true);
  };

  const getSession = (sessionId: number) => {
    return sessionsData.find(s => s.id === sessionId);
  };

  const handleLateAttendance = (sessionId: number, studentId: number, period: 'morning' | 'afternoon') => {
    setSelectedStudent({ id: studentId, period });
    setLateTime('');
    setLateNote('');
    setIsLateModalOpen(true);
  };

  const confirmLateAttendance = () => {
    if (selectedSession && selectedStudent) {
      updateAttendance(
        selectedSession,
        selectedStudent.id,
        selectedStudent.period,
        'late',
        lateTime,
        lateNote
      );
      setIsLateModalOpen(false);
      setSelectedStudent(null);
      setLateTime('');
      setLateNote('');
    }
  };

  const updateAttendance = (
    sessionId: number,
    studentId: number,
    period: 'morning' | 'afternoon',
    status: 'present' | 'absent' | 'late',
    time?: string,
    note?: string
  ) => {
    setSessionsData(prevSessions => 
      prevSessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            students: session.students.map(student => {
              if (student.id === studentId) {
                return {
                  ...student,
                  attendance: {
                    ...student.attendance,
                    [period]: {
                      status,
                      time,
                      note
                    }
                  }
                };
              }
              return student;
            })
          };
        }
        return session;
      })
    );
  };

  const getAttendanceStatusColor = (status: 'present' | 'absent' | 'late' | null) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-600';
      case 'absent':
        return 'bg-red-100 text-red-600';
      case 'late':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des sessions</h1>
        <button className="btn-primary">
          Nouvelle session
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
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
          <div className="w-48">
            <input
              type="date"
              className="input-field w-full"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <button className="btn-secondary flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Sessions de formation</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {sessionsData.map((session) => (
            <div key={session.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">{session.title}</h3>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-5 w-5" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-5 w-5" />
                      <span>{session.time.morning.start} - {session.time.afternoon.end}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span>{session.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="h-5 w-5" />
                      <span>{session.totalStudents} participants</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleAttendance(session.id)}
                    className="btn-secondary"
                  >
                    Présences
                  </button>
                  <button 
                    onClick={() => handleViewDetails(session.id)}
                    className="btn-primary"
                  >
                    Voir les détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Details Modal */}
      {isDetailsModalOpen && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  Détails de la session
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {getSession(selectedSession)?.title}
                </p>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="h-5 w-5" />
                      <span>{getSession(selectedSession)?.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="h-5 w-5" />
                      <span>
                        {getSession(selectedSession)?.time.morning.start} - {getSession(selectedSession)?.time.afternoon.end}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span>{getSession(selectedSession)?.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="h-5 w-5" />
                      <span>{getSession(selectedSession)?.totalStudents} participants</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-gray-600">
                    {getSession(selectedSession)?.description}
                  </p>
                </div>

                {/* Prérequis */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Prérequis</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {getSession(selectedSession)?.prerequisites.map((prerequisite, index) => (
                      <li key={index}>{prerequisite}</li>
                    ))}
                  </ul>
                </div>

                {/* Objectifs */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Objectifs</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {getSession(selectedSession)?.objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>

                {/* Matériel pédagogique */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Matériel pédagogique</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {getSession(selectedSession)?.materials.map((material, index) => (
                      <li key={index}>{material}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="btn-primary"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Feuille de présence</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {getSession(selectedSession)?.title} - {getSession(selectedSession)?.date}
                </p>
              </div>
              <button
                onClick={() => setIsAttendanceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stagiaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matin ({getSession(selectedSession)?.time.morning.start})
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Après-midi ({getSession(selectedSession)?.time.afternoon.start})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getSession(selectedSession)?.students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {student.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => updateAttendance(selectedSession, student.id, 'morning', 'present')}
                              className={`p-2 rounded-full transition-colors ${
                                student.attendance.morning.status === 'present'
                                  ? 'bg-green-100 text-green-600'
                                  : 'hover:bg-green-100 text-gray-400 hover:text-green-600'
                              }`}
                              title="Présent"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleLateAttendance(selectedSession, student.id, 'morning')}
                              className={`p-2 rounded-full transition-colors ${
                                student.attendance.morning.status === 'late'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'hover:bg-yellow-100 text-gray-400 hover:text-yellow-600'
                              }`}
                              title="En retard"
                            >
                              <AlertTriangle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => updateAttendance(selectedSession, student.id, 'morning', 'absent')}
                              className={`p-2 rounded-full transition-colors ${
                                student.attendance.morning.status === 'absent'
                                  ? 'bg-red-100 text-red-600'
                                  : 'hover:bg-red-100 text-gray-400 hover:text-red-600'
                              }`}
                              title="Absent"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
                          {student.attendance.morning.status === 'late' && (
                            <div className="text-xs text-center mt-1 text-yellow-600">
                              Arrivé à {student.attendance.morning.time}
                              {student.attendance.morning.note && (
                                <span className="block">{student.attendance.morning.note}</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => updateAttendance(selectedSession, student.id, 'afternoon', 'present')}
                              className={`p-2 rounded-full transition-colors ${
                                student.attendance.afternoon.status === 'present'
                                  ? 'bg-green-100 text-green-600'
                                  : 'hover:bg-green-100 text-gray-400 hover:text-green-600'
                              }`}
                              title="Présent"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleLateAttendance(selectedSession, student.id, 'afternoon')}
                              className={`p-2 rounded-full transition-colors ${
                                student.attendance.afternoon.status === 'late'
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'hover:bg-yellow-100 text-gray-400 hover:text-yellow-600'
                              }`}
                              title="En retard"
                            >
                              <AlertTriangle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => updateAttendance(selectedSession, student.id, 'afternoon', 'absent')}
                              className={`p-2 rounded-full transition-colors ${
                                student.attendance.afternoon.status === 'absent'
                                  ? 'bg-red-100 text-red-600'
                                  : 'hover:bg-red-100 text-gray-400 hover:text-red-600'
                              }`}
                              title="Absent"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
                          {student.attendance.afternoon.status === 'late' && (
                            <div className="text-xs text-center mt-1 text-yellow-600">
                              Arrivé à {student.attendance.afternoon.time}
                              {student.attendance.afternoon.note && (
                                <span className="block">{student.attendance.afternoon.note}</span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setIsAttendanceModalOpen(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // Sauvegarder les présences
                  setIsAttendanceModalOpen(false);
                }}
                className="btn-primary"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Late Attendance Modal */}
      {isLateModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Enregistrer un retard</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure d'arrivée
                </label>
                <input
                  type="time"
                  value={lateTime}
                  onChange={(e) => setLateTime(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (optionnel)
                </label>
                <textarea
                  value={lateNote}
                  onChange={(e) => setLateNote(e.target.value)}
                  className="input-field h-24 resize-none"
                  placeholder="Raison du retard..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setIsLateModalOpen(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={confirmLateAttendance}
                className="btn-primary"
                disabled={!lateTime}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManager;