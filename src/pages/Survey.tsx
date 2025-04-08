import React, { useState } from 'react';
import { FileQuestion, ArrowLeft, ArrowRight, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  type: 'rating' | 'text' | 'single' | 'multiple';
  options?: string[];
  description?: string;
}

const Survey = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{
    [key: number]: string | string[] | number;
  }>({});

  const survey = {
    title: "Questionnaire de positionnement React",
    description: "Évaluez votre niveau actuel en React pour personnaliser votre parcours de formation",
    questions: [
      {
        id: 1,
        text: "Comment évaluez-vous votre niveau global en React ?",
        type: "rating",
        description: "1 = Débutant, 5 = Expert"
      },
      {
        id: 2,
        text: "Avez-vous déjà travaillé avec les hooks React ?",
        type: "single",
        options: [
          "Jamais utilisé",
          "Connaissance basique",
          "Utilisation régulière",
          "Expert"
        ]
      },
      {
        id: 3,
        text: "Quels concepts React maîtrisez-vous ? (plusieurs réponses possibles)",
        type: "multiple",
        options: [
          "Composants",
          "Props",
          "State",
          "Lifecycle methods",
          "Context API",
          "Redux"
        ]
      },
      {
        id: 4,
        text: "Décrivez votre expérience la plus significative avec React",
        type: "text",
        description: "Mentionnez le type de projet, votre rôle et les défis rencontrés"
      },
      {
        id: 5,
        text: "Quels sont vos objectifs d'apprentissage principaux ?",
        type: "text",
        description: "Précisez les compétences que vous souhaitez développer"
      }
    ]
  };

  const handleAnswerChange = (questionId: number, value: string | string[] | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Survey submitted:', answers);
  };

  const isQuestionAnswered = (questionId: number) => {
    return answers[questionId] !== undefined;
  };

  const renderQuestion = () => {
    const question = survey.questions[currentQuestion];

    switch (question.type) {
      case 'rating':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Débutant</span>
              <span>Expert</span>
            </div>
            <div className="flex justify-between gap-3">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleAnswerChange(question.id, rating)}
                  className={`flex-1 aspect-square rounded-lg border-2 text-lg font-medium transition-all ${
                    answers[question.id] === rating
                      ? 'border-primary bg-primary bg-opacity-5 text-primary'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <textarea
            value={answers[question.id] as string || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50 resize-none"
            placeholder="Votre réponse..."
          />
        );

      case 'single':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerChange(question.id, option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[question.id] === option
                    ? 'border-primary bg-primary bg-opacity-5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case 'multiple':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const selectedAnswers = (answers[question.id] as string[]) || [];
              const isSelected = selectedAnswers.includes(option);

              return (
                <button
                  key={index}
                  onClick={() => {
                    const newAnswers = isSelected
                      ? selectedAnswers.filter(a => a !== option)
                      : [...selectedAnswers, option];
                    handleAnswerChange(question.id, newAnswers);
                  }}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary bg-opacity-5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Survey Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <FileQuestion className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{survey.title}</h1>
            <p className="text-gray-600 mt-1">{survey.description}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Question {currentQuestion + 1} sur {survey.questions.length}</span>
        </div>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 rounded-full h-2 transition-all"
            style={{ width: `${((currentQuestion + 1) / survey.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          {survey.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentQuestion === index
                  ? 'bg-purple-600 text-white'
                  : isQuestionAnswered(survey.questions[index].id)
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Current Question */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-6">
          <div className="flex items-start space-x-3">
            {survey.questions[currentQuestion].type === 'text' ? (
              <MessageSquare className="h-5 w-5 text-purple-600 mt-1" />
            ) : survey.questions[currentQuestion].type === 'multiple' ? (
              <AlertCircle className="h-5 w-5 text-purple-600 mt-1" />
            ) : (
              <CheckCircle className="h-5 w-5 text-purple-600 mt-1" />
            )}
            <div>
              <h2 className="text-lg font-medium">
                {survey.questions[currentQuestion].text}
              </h2>
              {survey.questions[currentQuestion].description && (
                <p className="text-sm text-gray-600 mt-1">
                  {survey.questions[currentQuestion].description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            {renderQuestion()}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            currentQuestion === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-purple-600 hover:bg-purple-50'
          }`}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Précédent</span>
        </button>

        {currentQuestion === survey.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Terminer le questionnaire
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(prev => Math.min(survey.questions.length - 1, prev + 1))}
            className="flex items-center space-x-2 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-colors"
          >
            <span>Suivant</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Survey;