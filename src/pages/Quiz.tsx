import React, { useState, useEffect } from 'react';
import { Timer, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
  type: 'single' | 'multiple';
}

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string[] }>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds

  // Example quiz data
  const quiz = {
    title: "Quiz React Hooks",
    description: "Évaluez vos connaissances sur les React Hooks",
    totalQuestions: 15,
    duration: "30 minutes",
    questions: [
      {
        id: 1,
        text: "Quel hook permet de gérer l'état local dans un composant fonctionnel ?",
        type: "single",
        options: [
          "useState",
          "useEffect",
          "useContext",
          "useReducer"
        ]
      },
      {
        id: 2,
        text: "Quels hooks font partie des hooks de base de React ? (plusieurs réponses possibles)",
        type: "multiple",
        options: [
          "useState",
          "useEffect",
          "useCustomHook",
          "useContext"
        ]
      },
      {
        id: 3,
        text: "À quoi sert le hook useEffect ?",
        type: "single",
        options: [
          "Gérer les effets de bord dans les composants",
          "Créer des états locaux",
          "Gérer le contexte de l'application",
          "Optimiser les performances"
        ]
      },
      {
        id: 4,
        text: "Quand le hook useEffect est-il exécuté ? (plusieurs réponses possibles)",
        type: "multiple",
        options: [
          "Au montage du composant",
          "À chaque rendu du composant",
          "À la destruction du composant",
          "Uniquement au premier rendu"
        ]
      },
      {
        id: 5,
        text: "Quel hook permet d'accéder au contexte React ?",
        type: "single",
        options: [
          "useContext",
          "useProvider",
          "useConsumer",
          "useStore"
        ]
      }
    ]
  };

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    const question = quiz.questions[currentQuestion];
    
    if (question.type === 'single') {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: [answer]
      });
      // Automatically move to next question after selecting an answer in single choice
      if (currentQuestion < quiz.questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
        }, 300);
      }
    } else {
      const currentAnswers = selectedAnswers[questionId] || [];
      const updatedAnswers = currentAnswers.includes(answer)
        ? currentAnswers.filter(a => a !== answer)
        : [...currentAnswers, answer];
      
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: updatedAnswers
      });
    }
  };

  const isAnswerSelected = (questionId: number, answer: string) => {
    const answers = selectedAnswers[questionId] || [];
    return answers.includes(answer);
  };

  const handleSubmit = () => {
    // Handle quiz submission
    console.log('Quiz submitted:', selectedAnswers);
  };

  const isQuestionAnswered = (questionId: number) => {
    return selectedAnswers[questionId]?.length > 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Quiz Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-gray-600 mt-1">{quiz.description}</p>
          </div>
          <div className="flex items-center space-x-2 text-primary">
            <Timer className="h-5 w-5" />
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Question {currentQuestion + 1} sur {quiz.questions.length}</span>
          <span>{quiz.duration}</span>
        </div>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all"
            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                currentQuestion === index
                  ? 'bg-primary text-white'
                  : isQuestionAnswered(quiz.questions[index].id)
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
            {quiz.questions[currentQuestion].type === 'multiple' ? (
              <AlertCircle className="h-5 w-5 text-primary mt-1" />
            ) : (
              <CheckCircle className="h-5 w-5 text-primary mt-1" />
            )}
            <div>
              <h2 className="text-lg font-medium">{quiz.questions[currentQuestion].text}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {quiz.questions[currentQuestion].type === 'multiple' 
                  ? 'Sélectionnez toutes les réponses correctes'
                  : 'Sélectionnez une seule réponse'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {quiz.questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(quiz.questions[currentQuestion].id, option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isAnswerSelected(quiz.questions[currentQuestion].id, option)
                    ? 'border-primary bg-primary bg-opacity-5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
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
              : 'text-primary hover:bg-primary hover:bg-opacity-10'
          }`}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Précédent</span>
        </button>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            Terminer le quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
            className="flex items-center space-x-2 text-primary hover:bg-primary hover:bg-opacity-10 px-4 py-2 rounded-lg transition-colors"
          >
            <span>Suivant</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;