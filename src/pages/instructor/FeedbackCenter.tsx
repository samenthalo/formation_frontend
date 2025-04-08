import React, { useState } from 'react';
import { MessageSquare, Send, Search, Filter } from 'lucide-react';

const FeedbackCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newFeedback, setNewFeedback] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  const feedbacks = [
    {
      id: 1,
      student: "Marie Martin",
      course: "React Avancé",
      date: "2024-03-15",
      content: "Excellente progression sur les concepts de hooks. Continue ainsi !",
      status: "sent"
    },
    {
      id: 2,
      student: "Jean Dupont",
      course: "JavaScript ES6+",
      date: "2024-03-14",
      content: "Besoin de revoir les concepts de promises. Je suggère des exercices supplémentaires.",
      status: "draft"
    }
  ];

  const students = [
    { id: '1', name: 'Marie Martin' },
    { id: '2', name: 'Jean Dupont' },
    { id: '3', name: 'Sophie Bernard' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Centre de feedback</h1>
        <button className="btn-primary flex items-center space-x-2">
          <MessageSquare className="h-4 w-4" />
          <span>Nouveau feedback</span>
        </button>
      </div>

      {/* New Feedback Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Envoyer un feedback</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stagiaire
            </label>
            <select
              className="input-field w-full"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">Sélectionner un stagiaire</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              className="input-field w-full h-32 resize-none"
              placeholder="Écrivez votre feedback..."
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button className="btn-secondary">
              Enregistrer comme brouillon
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Envoyer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher un feedback..."
                className="pl-10 input-field w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button className="btn-secondary flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
          </button>
        </div>
      </div>

      {/* Feedback History */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Historique des feedbacks</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{feedback.student}</h3>
                    <span className="text-sm text-gray-500">• {feedback.course}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{feedback.date}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  feedback.status === 'sent'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {feedback.status === 'sent' ? 'Envoyé' : 'Brouillon'}
                </span>
              </div>
              <p className="mt-4 text-gray-700">{feedback.content}</p>
              <div className="mt-4 flex justify-end space-x-4">
                <button className="text-gray-600 hover:text-gray-900">
                  Modifier
                </button>
                <button className="text-red-600 hover:text-red-900">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackCenter;