import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Question {
  id: number;
  contenu: string;
  type: 'choix_multiple' | 'choix_unique' | 'reponse_libre';
  options: { libelle: string; correct: boolean; note: number }[];
  obligatoire: boolean;
}

interface Formation {
  id_formation: number;
  titre: string;
}

const QuizCreator = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/formations')
      .then(response => response.json())
      .then(data => {
        setFormations(data);
        console.log('Formations récupérées:', data);
        data.forEach(formation => {
          console.log('ID de la formation:', formation.id_formation, typeof formation.id_formation);
        });
      })
      .catch(error => console.error('Erreur lors de la récupération des formations:', error));
  }, []);

  useEffect(() => {
    console.log('Valeur initiale de selectedFormation:', selectedFormation);
  }, [selectedFormation]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      contenu: '',
      type: 'choix_multiple',
      options: [{ libelle: '', correct: false, note: 0 }],
      obligatoire: true,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: number, field: keyof Question, value: any) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const toggleObligatoire = (id: number) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, obligatoire: !q.obligatoire } : q
    ));
  };

  const addOption = (questionId: number) => {
    setQuestions(questions.map(q =>
      q.id === questionId
        ? { ...q, options: [...q.options, { libelle: '', correct: false, note: 0 }] }
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

  const updateOption = (questionId: number, optionIndex: number, field: keyof Question['options'][0], value: any) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        if (field === 'correct' && q.type === 'choix_unique' && value) {
          const updatedOptions = q.options.map((option, index) => ({
            ...option,
            correct: index === optionIndex
          }));
          return { ...q, options: updatedOptions };
        } else {
          const updatedOptions = q.options.map((option, index) =>
            index === optionIndex ? { ...option, [field]: value } : option
          );
          return { ...q, options: updatedOptions };
        }
      }
      return q;
    }));
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const validateQuiz = () => {
    if (!title.trim()) {
      toast.error('Veuillez entrer un titre pour le quiz.');
      return false;
    }

    if (!description.trim()) {
      toast.error('Veuillez entrer une description pour le quiz.');
      return false;
    }

    if (!selectedFormation) {
      toast.error('Veuillez sélectionner une formation.');
      return false;
    }

    for (const question of questions) {
      if (!question.contenu.trim()) {
        toast.error('Veuillez entrer le contenu de toutes les questions.');
        return false;
      }

      if (question.type !== 'reponse_libre') {
        let hasCorrectOption = false;
        let correctOptionsCount = 0;
        for (const option of question.options) {
          if (!option.libelle.trim()) {
            toast.error('Veuillez entrer le libellé de toutes les options.');
            return false;
          }
          if (option.correct && option.note <= 0) {
            toast.error('Veuillez entrer une note valide pour les options correctes.');
            return false;
          }
          if (option.correct) {
            hasCorrectOption = true;
            correctOptionsCount++;
          }
        }
        if (!hasCorrectOption) {
          toast.error('Veuillez sélectionner au moins une option correcte pour chaque question.');
          return false;
        }
        if (question.type === 'choix_unique' && correctOptionsCount > 1) {
          toast.error('Pour les questions à choix unique, une seule option peut être correcte.');
          return false;
        }
      }
    }

    return true;
  };

  const saveQuiz = async () => {
    if (!validateQuiz()) {
      return;
    }

    if (!selectedFormation) {
      console.log('Aucune formation sélectionnée');
      toast.error('Veuillez sélectionner une formation');
      return;
    }

    console.log('Formation sélectionnée:', selectedFormation);

    const quizData = {
      titre: title,
      description: description,
      tauxReussite: 70,
      type: 'quiz',
      id_formation: selectedFormation,
      questions: questions.map(question => ({
        contenu: question.contenu,
        type: question.type,
        obligatoire: question.obligatoire,
        reponses: question.options.map(option => ({
          libelle: option.libelle,
          correct: option.correct,
          note: option.note,
        }))
      }))
    };

    try {
      const response = await fetch('http://localhost:8000/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      });

      const responseData = await response.json();
      if (response.ok) {
        toast.success('Quiz enregistré avec succès!');
      } else {
        toast.error('Échec de l\'enregistrement du quiz');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du quiz:', error);
      toast.error('Erreur lors de l\'enregistrement du quiz');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Créer un Quiz</h1>
        <button onClick={saveQuiz} className="btn-primary flex items-center space-x-2">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Formation
          </label>
          <select
            value={selectedFormation || ''}
            onChange={(e) => {
              const value = e.target.value === '' ? null : Number(e.target.value);
              console.log('Valeur sélectionnée:', value);
              setSelectedFormation(value);
            }}
            className="input-field"
          >
            <option value="">Sélectionnez une formation</option>
            {formations.map(formation => (
              <option key={formation.id_formation} value={formation.id_formation}>
                {formation.titre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">Question {index + 1}</h3>
              <div className="flex space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={question.obligatoire}
                    onChange={() => toggleObligatoire(question.id)}
                    className="h-4 w-4 text-green-500"
                  />
                  <span>Obligatoire</span>
                </label>
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={question.contenu}
                  onChange={(e) => updateQuestion(question.id, 'contenu', e.target.value)}
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
                  onChange={(e) => updateQuestion(question.id, 'type', e.target.value as 'choix_multiple' | 'choix_unique' | 'reponse_libre')}
                  className="input-field"
                >
                  <option value="choix_multiple">Choix multiple</option>
                  <option value="choix_unique">Choix unique</option>
                  <option value="reponse_libre">Réponse libre</option>
                </select>
              </div>

              {question.type !== 'reponse_libre' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Options de réponse
                  </label>
                  {question.options.map((option, optionIndex) => (
                    <div key={`${question.id}-${optionIndex}`} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option.libelle}
                        onChange={(e) => updateOption(question.id, optionIndex, 'libelle', e.target.value)}
                        className="input-field"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <label>
                        <input
                          type="checkbox"
                          checked={option.correct}
                          onChange={(e) => updateOption(question.id, optionIndex, 'correct', e.target.checked)}
                        />
                        Correct
                      </label>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500 text-sm">Note</span>
                        <input
                          type="number"
                          value={option.note}
                          onChange={(e) => updateOption(question.id, optionIndex, 'note', parseInt(e.target.value))}
                          className="input-field w-16"
                          placeholder="0"
                        />
                      </div>
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
      <ToastContainer />
    </div>
  );
};

export default QuizCreator;
