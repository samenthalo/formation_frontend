import React, { useState } from 'react';
import { Users, BookOpen, ClipboardCheck, Calendar, Bell, MessageSquare, X, MapPin, Clock } from 'lucide-react';

const InstructorDashboard = () => {
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const stats = [
    {
      title: "Stagiaires actifs",
      value: "18",
      icon: Users,
      change: "+2 cette semaine",
      positive: true
    },
    {
      title: "Sessions à venir",
      value: "5",
      icon: Calendar,
      change: "Cette semaine",
      positive: true
    },
    {
      title: "Quiz en attente",
      value: "12",
      icon: ClipboardCheck,
      change: "À évaluer",
      positive: false
    }
  ];

  const upcomingSessions = [
    {
      id: 1,
      title: "React Avancé - Hooks",
      date: "Aujourd'hui, 14:00",
      location: "Salle 302",
      attendees: 12,
      duration: "3 heures",
      instructor: "Sophie Bernard",
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
      ]
    },
    {
      id: 2,
      title: "JavaScript ES6+",
      date: "Demain, 09:30",
      location: "Salle 201",
      attendees: 15,
      duration: "3 heures",
      instructor: "Marc Dubois",
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
      ]
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "quiz",
      title: "Quiz React Hooks complété",
      student: "Marie Martin",
      date: "Il y a 2 heures",
      score: 85
    },
    {
      id: 2,
      type: "attendance",
      title: "Session JavaScript ES6",
      student: "Jean Dupont",
      date: "Il y a 3 heures",
      status: "Présent"
    }
  ];

  const handleViewDetails = (sessionId: number) => {
    setSelectedSession(sessionId);
    setIsDetailsModalOpen(true);
  };

  const getSession = (sessionId: number) => {
    return upcomingSessions.find(s => s.id === sessionId);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de bord formateur</h1>
        <div className="flex space-x-4">
          <button className="btn-secondary flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Envoyer feedback</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${
                stat.positive ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.positive ? 'text-green-600' : 'text-yellow-600'
                }`} />
              </div>
            </div>
            <div className={`mt-4 text-sm ${
              stat.positive ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Sessions à venir</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingSessions.map((session) => (
            <div key={session.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{session.title}</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{session.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{session.attendees} participants</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleViewDetails(session.id)}
                  className="btn-primary text-sm"
                >
                  Détails
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Activités récentes</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  activity.type === 'quiz' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {activity.type === 'quiz' ? (
                    <ClipboardCheck className={`h-5 w-5 ${
                      activity.type === 'quiz' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  ) : (
                    <Users className={`h-5 w-5 ${
                      activity.type === 'quiz' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  )}
                </div>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.student}</p>
                  <p className="text-sm text-gray-500">{activity.date}</p>
                </div>
              </div>
              {'score' in activity ? (
                <div className="text-lg font-semibold text-green-600">
                  {activity.score}%
                </div>
              ) : (
                <span className="px-2 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                  {activity.status}
                </span>
              )}
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
                      <span>{getSession(selectedSession)?.duration}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span>{getSession(selectedSession)?.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="h-5 w-5" />
                      <span>{getSession(selectedSession)?.attendees} participants</span>
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
    </div>
  );
};

export default InstructorDashboard;