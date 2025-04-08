import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  type: 'rating' | 'text' | 'multiple' | 'single';
  options?: string[];
  required: boolean;
}

const SurveyCreator = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      text: '',
      type: 'rating',
      required: true,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: number, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Créer un Questionnaire</h1>
        <button className="btn-primary flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Enregistrer le questionnaire</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre du questionnaire
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="Entrez le titre du questionnaire"
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
            placeholder="Décrivez l'objectif du questionnaire"
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

              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de réponse
                  </label>
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                    className="input-field"
                  >
                    <option value="rating">Note (1-5)</option>
                    <option value="text">Réponse libre</option>
                    <option value="multiple">Choix multiple</option>
                    <option value="single">Choix unique</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                    className="h-4 w-4 text-primary rounded border-gray-300"
                  />
                  <label className="text-sm text-gray-700">
                    Obligatoire
                  </label>
                </div>
              </div>

              {(question.type === 'multiple' || question.type === 'single') && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Options de réponse
                  </label>
                  {question.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(question.options || [])];
                          newOptions[optionIndex] = e.target.value;
                          updateQuestion(question.id, 'options', newOptions);
                        }}
                        className="input-field"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <button
                        onClick={() => {
                          const newOptions = question.options?.filter((_, i) => i !== optionIndex);
                          updateQuestion(question.id, 'options', newOptions);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
                      updateQuestion(question.id, 'options', newOptions);
                    }}
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

export default SurveyCreator;