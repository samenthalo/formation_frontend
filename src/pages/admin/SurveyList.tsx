import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const SurveyList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormation, setSelectedFormation] = useState('all');
  const [surveys, setSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    responseRate: '',
    type: 'survey',
    id_formation: '',
    questions: [],
  });
  const [formations, setFormations] = useState([]);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await axios.get('http://localhost:8000/questionnaire');
        if (Array.isArray(response.data)) {
          setSurveys(response.data);
        } else {
          console.error('Expected an array but got:', response.data);
          setSurveys([]);
        }
      } catch (error) {
        console.error('Error fetching surveys:', error);
        setSurveys([]);
      }
    };

    const fetchFormations = async () => {
      try {
        const response = await axios.get('http://localhost:8000/formations');
        if (Array.isArray(response.data)) {
          console.log('Formations data:', response.data);
          setFormations(response.data);
        } else {
          console.error('Expected an array but got:', response.data);
          setFormations([]);
        }
      } catch (error) {
        console.error('Error fetching formations:', error);
        setFormations([]);
      }
    };

    fetchSurveys();
    fetchFormations();
  }, []);

  const filteredSurveys = Array.isArray(surveys)
    ? surveys.filter(survey => {
        const matchesSearch = survey.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             survey.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFormation = selectedFormation === 'all' || survey.id_formation === selectedFormation;
        return matchesSearch && matchesFormation;
      })
    : [];

  const openDetailsModal = (survey) => {
    setSelectedSurvey(survey);
    setEditMode(false);
    setModalIsOpen(true);
  };

  const openEditModal = (survey) => {
    console.log('Selected survey data for editing:', survey);

    setSelectedSurvey(survey);
    setFormData({
      titre: survey.titre,
      description: survey.description,
      responseRate: survey.responseRate,
      type: 'survey',
      id_formation: survey.id_formation || '',
      questions: survey.questions,
    });

    console.log('Updated form data:', {
      titre: survey.titre,
      description: survey.description,
      responseRate: survey.responseRate,
      type: 'survey',
      id_formation: survey.id_formation || '',
      questions: survey.questions,
    });

    setEditMode(true);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleQuestionChange = (index, e) => {
    const { name, value } = e.target;
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][name] = value;
    setFormData(prevState => ({
      ...prevState,
      questions: updatedQuestions,
    }));
  };

  const handleAnswerChange = (questionIndex, answerIndex, e) => {
    const { name, value, type, checked } = e.target;
    const updatedQuestions = [...formData.questions];
    if (type === 'checkbox') {
      updatedQuestions[questionIndex].reponses[answerIndex].correct = checked;
    } else {
      updatedQuestions[questionIndex].reponses[answerIndex][name] = value;
    }
    setFormData(prevState => ({
      ...prevState,
      questions: updatedQuestions,
    }));
  };

  const addQuestion = () => {
    setFormData(prevState => ({
      ...prevState,
      questions: [...prevState.questions, { contenu: '', type: '', reponses: [] }]
    }));
  };

  const addAnswer = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].reponses.push({ libelle: '', correct: false, note: 0 });
    setFormData(prevState => ({
      ...prevState,
      questions: updatedQuestions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting the following data:', {
        titre: formData.titre,
        description: formData.description,
        responseRate: formData.responseRate,
        type: formData.type,
        id_formation: formData.id_formation,
        questions: formData.questions.map(question => ({
          contenu: question.contenu,
          type: question.type || 'default_type',
          reponses: question.reponses.map(reponse => ({
            libelle: reponse.libelle,
            correct: reponse.correct,
            note: reponse.note
          }))
        }))
      });

      if (!formData.titre || !formData.description || !formData.id_formation) {
        console.error('All fields are required');
        return;
      }

      const response = await axios.post(`http://localhost:8000/questionnaire/${selectedSurvey.id}`, {
        titre: formData.titre,
        description: formData.description,
        responseRate: formData.responseRate,
        type: formData.type,
        id_formation: formData.id_formation,
        questions: formData.questions.map(question => ({
          contenu: question.contenu,
          type: question.type || 'default_type',
          reponses: question.reponses.map(reponse => ({
            libelle: reponse.libelle,
            correct: reponse.correct,
            note: reponse.note
          }))
        }))
      });

      if (response.data) {
        const updatedSurveysResponse = await axios.get('http://localhost:8000/questionnaire');
        setSurveys(updatedSurveysResponse.data);
        closeModal();
      }
    } catch (error) {
      console.error('Error updating survey:', error.response ? error.response.data : error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:8000/questionnaire/${id}`);
      if (response.data) {
        const updatedSurveysResponse = await axios.get('http://localhost:8000/questionnaire');
        setSurveys(updatedSurveysResponse.data);
      }
    } catch (error) {
      console.error('Error deleting survey:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Liste des Questionnaires</h1>
        <Link to="/admin/survey" className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Créer un questionnaire</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher un questionnaire..."
                  className="pl-10 input-field w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-64">
              <select
                className="input-field w-full"
                value={selectedFormation}
                onChange={(e) => setSelectedFormation(e.target.value)}
              >
                <option key="all" value="all">
                  Toutes les formations
                </option>
                {formations.map(formation => (
                  <option key={formation.id_formation} value={formation.id_formation}>
                    {formation.titre}
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questionnaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux de réponse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSurveys.map((survey) => {
                const formation = formations.find(f => f.id_formation === survey.id_formation);
                const formationTitle = formation ? formation.titre : 'Inconnu';

                return (
                  <tr key={survey.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{survey.titre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{survey.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formationTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {survey.responseRate}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button onClick={() => openDetailsModal(survey)} className="text-primary hover:text-primary-dark mr-3">
                        Voir détails
                      </button>
                      <button onClick={() => openEditModal(survey)} className="text-primary hover:text-primary-dark mr-3">
                        Modifier
                      </button>
                      <button onClick={() => handleDelete(survey.id)} className="text-red-600 hover:text-red-800">
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalIsOpen && selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-full overflow-y-auto relative">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            {editMode ? (
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold mb-4">Modifier le Questionnaire</h2>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="titre">
                    Titre
                  </label>
                  <input
                    type="text"
                    id="titre"
                    name="titre"
                    value={formData.titre}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="responseRate">
                    Taux de réponse
                  </label>
                  <input
                    type="number"
                    id="responseRate"
                    name="responseRate"
                    value={formData.responseRate}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="id_formation">
                    Formation
                  </label>
                  <select
                    id="id_formation"
                    name="id_formation"
                    value={formData.id_formation}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option key="default" value="">Sélectionnez une formation</option>
                    {formations.map(formation => (
                      <option key={formation.id_formation} value={formation.id_formation}>
                        {formation.titre}
                      </option>
                    ))}
                  </select>
                </div>
                <h3 className="font-bold mb-2">Questions:</h3>
                {formData.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="mb-4">
                    <div className="mb-2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`question-${questionIndex}`}>
                        Question {questionIndex + 1}
                      </label>
                      <input
                        type="text"
                        id={`question-${questionIndex}`}
                        name="contenu"
                        value={question.contenu}
                        onChange={(e) => handleQuestionChange(questionIndex, e)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <h4 className="font-bold mt-2">Réponses:</h4>
                    {question.reponses.map((reponse, answerIndex) => (
                      <div key={answerIndex} className="mb-2">
                        <input
                          type="text"
                          name="libelle"
                          value={reponse.libelle}
                          onChange={(e) => handleAnswerChange(questionIndex, answerIndex, e)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <label className="inline-flex items-center mt-2">
                          <input
                            type="checkbox"
                            name="correct"
                            checked={reponse.correct}
                            onChange={(e) => handleAnswerChange(questionIndex, answerIndex, e)}
                            className="form-checkbox"
                          />
                          <span className="ml-2">Correct</span>
                        </label>
                      </div>
                    ))}
                    <button type="button" onClick={() => addAnswer(questionIndex)} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                      Ajouter une réponse
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addQuestion} className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Ajouter une question
                </button>
                <button
                  type="submit"
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Enregistrer
                </button>
              </form>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">{selectedSurvey.titre}</h2>
                <p className="mb-4">{selectedSurvey.description}</p>
                <h3 className="font-bold mb-2">Questions:</h3>
                {selectedSurvey.questions.map((question, index) => (
                  <div key={index} className="mb-4">
                    <p className="font-medium">{question.contenu}</p>
                    <h4 className="font-bold mt-2">Réponses:</h4>
                    <ul className="list-disc pl-5">
                      {question.reponses.map((reponse, idx) => (
                        <li key={idx}>
                          {reponse.libelle} - {reponse.correct ? 'Correct' : 'Incorrect'}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyList;
