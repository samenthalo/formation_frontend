import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  ClipboardCheck, 
  Award, 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  UserPlus,
  Users
} from 'lucide-react';

const TraineeDashboard = () => {
  const navigationCards = [
    {
      title: "Inscription",
      description: "Inscrivez-vous à de nouvelles formations",
      icon: UserPlus,
      path: "/registration",
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Conventions",
      description: "Gérez vos conventions de formation",
      icon: FileText,
      path: "/conventions",
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Évaluations",
      description: "Accédez à vos quiz et évaluations",
      icon: ClipboardCheck,
      path: "/assessments",
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Présence",
      description: "Consultez votre suivi de présence",
      icon: Users,
      path: "/attendance",
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Attestations",
      description: "Téléchargez vos certificats",
      icon: Award,
      path: "/certificates",
      color: "bg-red-50 text-red-600",
    }
  ];

  const nextSession = {
    date: "20 mars 2024",
    time: "14:00 - 17:00",
    location: "Salle 302",
    course: "Formation React Avancé"
  };

  return (
    <div className="space-y-8">
      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {navigationCards.map((card, index) => (
          <Link
            key={index}
            to={card.path}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`p-3 rounded-full ${card.color}`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{card.title}</h3>
              </div>
              <p className="text-gray-600">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Prochaine session */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Prochaine session</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-primary" />
            <span>{nextSession.date}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-primary" />
            <span>{nextSession.time}</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-primary" />
            <span>{nextSession.location}</span>
          </div>
          <div className="flex items-center space-x-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>{nextSession.course}</span>
          </div>
        </div>
      </div>

      {/* Formations en cours */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Formations en cours</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Formation React Avancé",
              progress: 60,
              instructor: "Sophie Bernard"
            },
            {
              title: "JavaScript Moderne",
              progress: 30,
              instructor: "Marc Dubois"
            }
          ].map((formation, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">{formation.title}</h3>
                  <p className="text-sm text-gray-600">
                    Formateur: {formation.instructor}
                  </p>
                </div>
                <div className="p-2 rounded-full bg-primary bg-opacity-10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progression</span>
                  <span>{formation.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2"
                    style={{ width: `${formation.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TraineeDashboard;