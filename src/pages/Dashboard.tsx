import React from 'react';
import { Users, BookOpen, ClipboardCheck, Mail, AlertCircle, FileCheck } from 'lucide-react';

const Dashboard = () => {
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

  const notifications = [
    {
      type: "convention",
      message: "3 conventions en attente de signature",
      date: "Il y a 2 heures",
      icon: FileCheck
    },
    {
      type: "email",
      message: "5 relances de questionnaire à envoyer",
      date: "Il y a 3 heures",
      icon: Mail
    },
    {
      type: "alert",
      message: "2 évaluations non complétées",
      date: "Il y a 1 jour",
      icon: AlertCircle
    }
  ];

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
          {notifications.map((notif, index) => (
            <div key={index} className="p-6 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-primary bg-opacity-10">
                  <notif.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{notif.message}</p>
                  <p className="text-sm text-gray-600">{notif.date}</p>
                </div>
              </div>
              <button className="btn-secondary text-sm">
                Traiter
              </button>
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
    </div>
  );
};

export default Dashboard;