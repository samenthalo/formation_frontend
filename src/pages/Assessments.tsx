import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle, AlertCircle, FileQuestion, BookOpen } from 'lucide-react';

const Assessments = () => {
  const quizzes = [
    {
      id: 1,
      title: 'Quiz React Hooks',
      course: 'Formation React Avancé',
      deadline: '20 mars 2024',
      duration: '30 minutes',
      questions: 15,
    },
    {
      id: 2,
      title: 'Quiz JavaScript ES6+',
      course: 'JavaScript Moderne',
      deadline: '22 mars 2024',
      duration: '45 minutes',
      questions: 20,
    },
  ];

  const surveys = [
    {
      id: 1,
      title: 'Questionnaire de positionnement React',
      course: 'Formation React Avancé',
      deadline: '18 mars 2024',
      duration: '20 minutes',
      questions: 10,
    },
    {
      id: 2,
      title: 'Évaluation des prérequis JavaScript',
      course: 'JavaScript Moderne',
      deadline: '19 mars 2024',
      duration: '25 minutes',
      questions: 12,
    },
  ];

  const completedAssessments = [
    {
      id: 3,
      title: 'Quiz Introduction React',
      course: 'Formation React Avancé',
      completedDate: '15 mars 2024',
      score: 85,
      type: 'quiz',
    },
    {
      id: 4,
      title: 'Questionnaire initial JavaScript',
      course: 'JavaScript Moderne',
      completedDate: '10 mars 2024',
      score: 92,
      type: 'survey',
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Mes Évaluations</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quiz Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Quiz à compléter</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{quiz.title}</h3>
                      <p className="text-sm text-gray-600">{quiz.course}</p>
                    </div>
                    <Link 
                      to={`/quiz/${quiz.id}`}
                      className="btn-primary text-sm"
                    >
                      Commencer
                    </Link>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {quiz.duration}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {quiz.questions} questions
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Deadline: {quiz.deadline}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Survey Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileQuestion className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold">Questionnaires de positionnement</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{survey.title}</h3>
                      <p className="text-sm text-gray-600">{survey.course}</p>
                    </div>
                    <Link 
                      to={`/survey/${survey.id}`}
                      className="btn-primary text-sm"
                    >
                      Commencer
                    </Link>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {survey.duration}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {survey.questions} questions
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Deadline: {survey.deadline}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Completed Assessments */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Évaluations complétées</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {completedAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${
                      assessment.type === 'quiz' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {assessment.type === 'quiz' ? (
                        <BookOpen className={`h-6 w-6 ${
                          assessment.type === 'quiz' ? 'text-green-600' : 'text-purple-600'
                        }`} />
                      ) : (
                        <FileQuestion className={`h-6 w-6 ${
                          assessment.type === 'quiz' ? 'text-green-600' : 'text-purple-600'
                        }`} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{assessment.title}</h3>
                      <p className="text-sm text-gray-600">{assessment.course}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {assessment.score}%
                    </div>
                    <p className="text-sm text-gray-600">
                      Complété le {assessment.completedDate}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessments;