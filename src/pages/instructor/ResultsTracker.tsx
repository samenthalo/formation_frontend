import React, { useState } from 'react';
import { Search, Filter, BarChart2, TrendingUp, Award, AlertCircle, X, CheckCircle, XCircle, Clock } from 'lucide-react';

const ResultsTracker = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<number | null>(null);

  const results = [
    {
      id: 1,
      student: "Marie Martin",
      course: "React Avancé",
      quizTitle: "React Hooks",
      score: 85,
      completedAt: "2024-03-15",
      timeSpent: "25 minutes",
      status: "completed",
      details: {
        totalQuestions: 15,
        correctAnswers: 13,
        wrongAnswers: 2,
        questions: [
          {
            id: 1,
            question: "Quel hook permet de gérer l'état local dans un composant fonctionnel ?",
            correctAnswer: "useState",
            studentAnswer: "useState",
            isCorrect: true,
            timeSpent: "45 secondes"
          },
          {
            id: 2,
            question: "À quoi sert le hook useEffect ?",
            correctAnswer: "Gérer les effets de bord dans les composants",
            studentAnswer: "Créer des états locaux",
            isCorrect: false,
            timeSpent: "60 secondes"
          },
          {
            id: 3,
            question: "Quand le hook useEffect est-il exécuté ?",
            correctAnswer: ["Au montage du composant", "À chaque rendu du composant"],
            studentAnswer: ["Au montage du composant"],
            isCorrect: false,
            timeSpent: "90 secondes"
          }
        ]
      }
    },
    {
      id: 2,
      student: "Jean Dupont",
      course: "JavaScript ES6+",
      quizTitle: "Promises & Async/Await",
      score: 92,
      completedAt: "2024-03-14",
      timeSpent: "28 minutes",
      status: "completed",
      details: {
        totalQuestions: 20,
        correctAnswers: 18,
        wrongAnswers: 2,
        questions: [
          {
            id: 1,
            question: "Quelle est la différence entre Promise.all() et Promise.race() ?",
            correctAnswer: "Promise.all attend que toutes les promesses soient résolues, Promise.race retourne la première promesse résolue",
            studentAnswer: "Promise.all attend que toutes les promesses soient résolues, Promise.race retourne la première promesse résolue",
            isCorrect: true,
            timeSpent: "75 secondes"
          }
        ]
      }
    }
  ];

  const courses = [
    { id: 'all', name: 'Toutes les formations' },
    { id: 'react', name: 'React Avancé' },
    { id: 'javascript', name: 'JavaScript ES6+' }
  ];

  const handleViewDetails = (resultId: number) => {
    setSelectedResult(resultId);
    setIsDetailsModalOpen(true);
  };

  const getResult = (resultId: number) => {
    return results.find(r => r.id === resultId);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Suivi des résultats</h1>
        <button className="btn-primary flex items-center space-x-2">
          <BarChart2 className="h-4 w-4" />
          <span>Exporter les statistiques</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Moyenne générale</p>
              <p className="text-3xl font-bold mt-2">87%</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-green-600">
            +5% depuis le dernier mois
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Quiz complétés</p>
              <p className="text-3xl font-bold mt-2">45</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-blue-600">
            12 cette semaine
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">En attente d'évaluation</p>
              <p className="text-3xl font-bold mt-2">8</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-yellow-600">
            À traiter rapidement
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
                placeholder="Rechercher un stagiaire..."
                className="pl-10 input-field w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-64">
            <select
              className="input-field w-full"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name}
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

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Résultats des évaluations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stagiaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quiz
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temps
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result) => (
                <tr key={result.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {result.student}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{result.course}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{result.quizTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">
                      {result.score}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{result.completedAt}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{result.timeSpent}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button 
                      onClick={() => handleViewDetails(result.id)}
                      className="text-primary hover:text-primary-dark"
                    >
                      Voir détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {isDetailsModalOpen && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  Détails du quiz
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {getResult(selectedResult)?.quizTitle} - {getResult(selectedResult)?.student}
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
              {/* Quiz Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Score</p>
                      <p className="text-2xl font-bold text-green-700">
                        {getResult(selectedResult)?.score}%
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Bonnes réponses</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {getResult(selectedResult)?.details.correctAnswers}/{getResult(selectedResult)?.details.totalQuestions}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600">Mauvaises réponses</p>
                      <p className="text-2xl font-bold text-red-700">
                        {getResult(selectedResult)?.details.wrongAnswers}
                      </p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600">Temps total</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {getResult(selectedResult)?.timeSpent}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Questions Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Détail des questions</h3>
                {getResult(selectedResult)?.details.questions.map((question, index) => (
                  <div key={question.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            question.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {question.isCorrect ? 'Correcte' : 'Incorrecte'}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-900">{question.question}</p>
                        
                        <div className="mt-4 space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Réponse correcte :</p>
                            <p className="text-sm text-green-600">
                              {Array.isArray(question.correctAnswer) 
                                ? question.correctAnswer.join(', ') 
                                : question.correctAnswer}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Réponse du stagiaire :</p>
                            <p className={`text-sm ${question.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                              {Array.isArray(question.studentAnswer) 
                                ? question.studentAnswer.join(', ') 
                                : question.studentAnswer}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {question.timeSpent}
                      </div>
                    </div>
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

export default ResultsTracker;