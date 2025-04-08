import React, { useState } from 'react';
import { Users, BookOpen, ClipboardCheck, Mail, AlertCircle, FileCheck, X, Calendar, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "convention",
      message: "3 conventions en attente de signature",
      date: "Il y a 2 heures",
      icon: FileCheck,
      status: 'pending',
      details: [
        {
          student: "Marie Martin",
          formation: "Formation React Avancé",
          date: "15 mars 2024",
          type: "Convention de formation"
        },
        {
          student: "Jean Dupont",
          formation: "JavaScript Moderne",
          date: "16 mars 2024",
          type: "Convention de stage"
        },
        {
          student: "Sophie Bernard",
          formation: "Node.js Fondamentaux",
          date: "17 mars 2024",
          type: "Convention de formation"
        }
      ]
    },
    {
      id: 2,
      type: "email",
      message: "5 relances de questionnaire à envoyer",
      date: "Il y a 3 heures",
      icon: Mail,
      status: 'pending',
      details: [
        {
          student: "Pierre Durand",
          formation: "Formation React Avancé",
          questionnaire: "Évaluation finale",
          deadline: "18 mars 2024"
        },
        {
          student: "Julie Lambert",
          formation: "JavaScript Moderne",
          questionnaire: "Quiz intermédiaire",
          deadline: "19 mars 2024"
        },
        {
          student: "Thomas Martin",
          formation: "Node.js Fondamentaux",
          questionnaire: "Évaluation initiale",
          deadline: "20 mars 2024"
        }
      ]
    },
    {
      id: 3,
      type: "alert",
      message: "2 évaluations non complétées",
      date: "Il y a 1 jour",
      icon: AlertCircle,
      status: 'pending',
      details: [
        {
          student: "Lucas Dubois",
          formation: "Formation React Avancé",
          evaluation: "Quiz React Hooks",
          deadline: "15 mars 2024",
          progress: "2/15 questions"
        },
        {
          student: "Emma Bernard",
          formation: "JavaScript ES6+",
          evaluation: "Test final ES6",
          deadline: "16 mars 2024",
          progress: "5/20 questions"
        }
      ]
    }
  ]);

  const [selectedNotification, setSelectedNotification] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const stats = [
    {
      title: "Stagiaires actifs",
      value: "24",
      icon: Users,
      change: "+12%",
      positive: true
    },
    {
      title: "Formations en cours",
      value: "8",
      icon: BookOpen,
      change: "+3",
      positive: true
    },
    {
      title: "Quiz en attente",
      value: "15",
      icon: ClipboardCheck,
      change: "-2",
      positive: false
    }
  ];

  const handleAction = (notificationId: number) => {
    setSelectedNotification(notificationId);
    setIsModalOpen(true);
  };

  const handleViewDetails = (notificationId: number) => {
    setSelectedNotification(notificationId);
    setIsDetailsModalOpen(true);
  };

  const confirmAction = () => {
    if (selectedNotification) {
      setNotifications(notifications.map(notif => 
        notif.id === selectedNotification 
          ? { ...notif, status: 'completed' as const }
          : notif
      ));
      setIsModalOpen(false);
      setSelectedNotification(null);
    }
  };

  const getNotification = (id: number) => {
    return notifications.find(n => n.id === id);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
        <button className="btn-primary flex items-center space-x-2">
          <Mail className="h-4 w-4" />
          <span>Envoyer les relances</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${
                stat.positive ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.positive ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
            <div className={`mt-4 text-sm ${
              stat.positive ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change} depuis le mois dernier
            </div>
          </div>
        ))}
      </div>

      {/* Actions requises */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Actions requises</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {notifications.map((notif) => (
            <div key={notif.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-full bg-primary bg-opacity-10">
                    <notif.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{notif.message}</p>
                    <p className="text-sm text-gray-600">{notif.date}</p>
                    {/* Aperçu des détails */}
                    <div className="mt-2 space-y-1">
                      {notif.details.slice(0, 2).map((detail, index) => (
                        <div key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                          <span>•</span>
                          <span>{detail.student} - {detail.formation}</span>
                        </div>
                      ))}
                      {notif.details.length > 2 && (
                        <button
                          onClick={() => handleViewDetails(notif.id)}
                          className="text-sm text-primary hover:text-primary/90"
                        >
                          Voir {notif.details.length - 2} de plus...
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {notif.status === 'pending' ? (
                  <button 
                    onClick={() => handleAction(notif.id)}
                    className="btn-secondary text-sm"
                  >
                    Traiter
                  </button>
                ) : (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Traité
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau des dernières activités */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Dernières activités</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stagiaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Jean Dupont</div>
                  <div className="text-sm text-gray-500">jean.dupont@email.com</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Inscription formation React</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Aujourd'hui 14:30</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Complété
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Marie Martin</div>
                  <div className="text-sm text-gray-500">marie.martin@email.com</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Évaluation JavaScript</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">Hier 16:45</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    En attente
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmation */}
      {isModalOpen && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Confirmation</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700">
                Êtes-vous sûr de vouloir traiter cette action ?
              </p>
              <p className="text-gray-600 mt-2">
                {getNotification(selectedNotification)?.message}
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={confirmAction}
                className="btn-primary"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {isDetailsModalOpen && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Détails de l'action</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {getNotification(selectedNotification)?.message}
                </p>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {getNotification(selectedNotification)?.details.map((detail, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{detail.student}</p>
                        <p className="text-sm text-gray-600">{detail.formation}</p>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{'deadline' in detail ? detail.deadline : detail.date}</span>
                      </div>
                    </div>
                    {'questionnaire' in detail && (
                      <p className="text-sm text-gray-600 mt-2">
                        Questionnaire : {detail.questionnaire}
                      </p>
                    )}
                    {'evaluation' in detail && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Évaluation : {detail.evaluation}
                        </p>
                        <p className="text-sm text-gray-600">
                          Progression : {detail.progress}
                        </p>
                      </div>
                    )}
                    {'type' in detail && (
                      <p className="text-sm text-gray-600 mt-2">
                        Type : {detail.type}
                      </p>
                    )}
                  </div>
                ))}
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

export default AdminDashboard;