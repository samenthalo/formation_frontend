import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Question {
  id: number;
  text: string;
  type: 'rating' | 'text' | 'multiple' | 'single';
  options?: string[];
  required: boolean;
}

interface Formation {
  id_formation: number;
  titre: string;
}

const SurveyCreator = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<number | null>(null);

  useEffect(() => {
    // Fetch formations from the backend
    fetch('http://localhost:8000/formations')
      .then(response => response.json())
      .then(data => {
        setFormations(data);
        console.log('Formations récupérées:', data);
        // Vérifiez que chaque formation a un id_formation valide
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

  const saveSurvey = async () => {
    if (!selectedFormation) {
      console.log('Aucune formation sélectionnée');
      toast.error('Veuillez sélectionner une formation');
      return;
    }

    console.log('Formation sélectionnée:', selectedFormation);

    const surveyData = {
      titre: title,
      description: description,
      tauxReussite: 70, // Example value
      type: 'questionnaire',
      id_formation: selectedFormation, // Assurez-vous que cela est inclus
      questions: questions.map(question => ({
        contenu: question.text,
        type: question.type,
        reponses: question.options ? question.options.map(option => ({
          libelle: option,
          correct: false, // Example value
          note: 0 // Example value
        })) : []
      }))
    };

    console.log('Données du questionnaire à envoyer:', surveyData); // Log des données à envoyer

    try {
      const response = await fetch('http://localhost:8000/questionnaire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData),
      });

      const responseData = await response.json();
      console.log('Réponse du serveur:', responseData); // Log de la réponse du serveur

      if (response.ok) {
        toast.success('Questionnaire enregistré avec succès');
      } else {
        toast.error('Échec de l\'enregistrement du questionnaire');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du questionnaire:', error);
      toast.error('Erreur lors de l\'enregistrement du questionnaire');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Créer un Questionnaire</h1>
        <button onClick={saveSurvey} className="btn-primary flex items-center space-x-2">
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
                    onChange={(e) => updateQuestion(question.id, 'type', e.target.value as 'rating' | 'text' | 'multiple' | 'single')}
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
      <ToastContainer />
    </div>
  );
};

export default SurveyCreator;
