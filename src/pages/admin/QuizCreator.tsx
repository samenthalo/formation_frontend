import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  type: 'multiple' | 'single' | 'text';
  options: string[];
}

const QuizCreator = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      text: '',
      type: 'multiple',
      options: ['Option 1'],
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: number, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const addOption = (questionId: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] }
        : q
    ));
  };

  const removeOption = (questionId: number, optionIndex: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.filter((_, index) => index !== optionIndex) }
        : q
    ));
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Créer un Quiz</h1>
        <button className="btn-primary flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Enregistrer le quiz</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre du quiz
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="Entrez le titre du quiz"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            rows={3}
            placeholder="Décrivez l'objectif du quiz"
          />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">Question {index + 1}</h3>
              <button
                onClick={() => removeQuestion(question.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                  className="input-field"
                  placeholder="Entrez votre question"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de réponse
                </label>
                <select
                  value={question.type}
                  onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                  className="input-field"
                >
                  <option value="multiple">Choix multiple</option>
                  <option value="single">Choix unique</option>
                  <option value="text">Réponse libre</option>
                </select>
              </div>

              {question.type !== 'text' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Options de réponse
                  </label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...question.options];
                          newOptions[optionIndex] = e.target.value;
                          updateQuestion(question.id, 'options', newOptions);
                        }}
                        className="input-field"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <button
                        onClick={() => removeOption(question.id, optionIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(question.id)}
                    className="btn-secondary flex items-center space-x-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter une option</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="btn-primary flex items-center space-x-2 w-full justify-center"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter une question</span>
        </button>
      </div>
    </div>
  );
};

export default QuizCreator;