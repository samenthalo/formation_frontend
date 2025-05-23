import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Plus, Trash2, X, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  // État pour la pagination de la liste des questionnaires
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const surveysPerPage = 15;

  // État pour la pagination des questions dans le modal
  const [currentQuestionPage, setCurrentQuestionPage] = useState(1);
  const [questionPageInput, setQuestionPageInput] = useState('');
  const questionsPerPage = editMode ? 6 : 10;

  // Fonction utilitaire pour tronquer le texte
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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
    setFormData({
      titre: survey.titre,
      description: survey.description,
      responseRate: survey.responseRate,
      type: 'survey',
      id_formation: survey.id_formation || '',
      questions: survey.questions,
    });
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

  const deleteQuestion = (questionIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(questionIndex, 1);
    setFormData(prevState => ({
      ...prevState,
      questions: updatedQuestions,
    }));
  };

  const deleteAnswer = (questionIndex, answerIndex) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].reponses.splice(answerIndex, 1);
    setFormData(prevState => ({
      ...prevState,
      questions: updatedQuestions,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting the following data:', {
        titre: formData.titre,
        description: formData.description,
        tauxReussite: formData.responseRate,
        type: 'questionnaire',
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

      // Vérification des champs obligatoires
      if (!formData.titre || !formData.description || !formData.id_formation) {
        toast.error('Tous les champs sont requis');
        return;
      }

      // Vérification de la présence de questions
      if (formData.questions.length === 0) {
        toast.error('Le questionnaire doit contenir au moins une question');
        return;
      }

      // Vérification de la présence de réponses pour chaque question, sauf pour les types "note" et "reponse_libre"
      for (const question of formData.questions) {
        if (question.type !== 'note' && question.type !== 'reponse_libre' && question.reponses.length === 0) {
          toast.error('Chaque question doit contenir au moins une réponse');
          return;
        }
      }

      const response = await axios.post(`http://localhost:8000/questionnaire/${selectedSurvey.id}`, {
        titre: formData.titre,
        description: formData.description,
        tauxReussite: formData.responseRate,
        type: 'questionnaire',
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
        toast.success('Questionnaire mis à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du questionnaire :', error.response ? error.response.data : error.message);
      toast.error('Erreur lors de la mise à jour du questionnaire');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:8000/questionnaire/${id}`);
      if (response.data) {
        const updatedSurveysResponse = await axios.get('http://localhost:8000/questionnaire');
        setSurveys(updatedSurveysResponse.data);
        toast.success('Questionnaire supprimé avec succès');
      }
    } catch (error) {
      console.error('Error deleting survey:', error);
      toast.error('Erreur lors de la suppression du questionnaire');
    }
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'choix_unique':
        return 'Choix unique';
      case 'choix_multiple':
        return 'Choix multiple';
      case 'note':
        return 'Note (1-5)';
      case 'reponse_libre':
        return 'Réponse libre';
      default:
        return 'Type inconnu';
    }
  };

  // Logique de pagination pour la liste des questionnaires
  const indexOfLastSurvey = currentPage * surveysPerPage;
  const indexOfFirstSurvey = indexOfLastSurvey - surveysPerPage;
  const currentSurveys = filteredSurveys.slice(indexOfFirstSurvey, indexOfLastSurvey);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(filteredSurveys.length / surveysPerPage)) {
      setCurrentPage(pageNumber);
    }
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput, 10);
    if (!isNaN(pageNumber)) {
      paginate(pageNumber);
    }
  };

  // Logique de pagination pour les questions dans le modal
  const indexOfLastQuestion = currentQuestionPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = formData.questions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const paginateQuestions = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= Math.ceil(formData.questions.length / questionsPerPage)) {
      setCurrentQuestionPage(pageNumber);
    }
  };

  const handleQuestionPageInputChange = (e) => {
    setQuestionPageInput(e.target.value);
  };

  const handleQuestionPageInputSubmit = (e) => {
    e.preventDefault();
    const pageNumber = parseInt(questionPageInput, 10);
    if (!isNaN(pageNumber)) {
      paginateQuestions(pageNumber);
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
              {currentSurveys.map((survey) => {
                const formation = formations.find(f => f.id_formation === survey.id_formation);
                const formationTitle = formation ? formation.titre : 'Inconnu';

                return (
                  <tr key={survey.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{survey.titre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{truncateText(survey.description, 50)}</div>
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
          {/* Contrôles de pagination modernisés */}
          <div className="flex justify-between items-center p-4 bg-white border-t border-gray-200">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-2">Précédent</span>
            </button>
            <form onSubmit={handlePageInputSubmit} className="flex items-center space-x-2">
              <span>Aller à la page</span>
              <input
                type="number"
                value={pageInput}
                onChange={handlePageInputChange}
                className="border border-gray-300 rounded-md px-3 py-2 w-16 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center">
                <span>Aller</span>
              </button>
            </form>
            <span className="text-gray-700">
              Page {currentPage} de {Math.ceil(filteredSurveys.length / surveysPerPage)}
            </span>
            <span className="text-gray-700">
              {indexOfFirstSurvey + 1} - {Math.min(indexOfLastSurvey, filteredSurveys.length)} sur {filteredSurveys.length} lignes
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredSurveys.length / surveysPerPage)}
              className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              <span className="mr-2">Suivant</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {modalIsOpen && selectedSurvey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-7xl h-[90vh] flex flex-col relative overflow-x-hidden">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex-grow overflow-y-auto overflow-x-hidden">
              {editMode ? (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-xl font-bold mb-4">Modifier le Questionnaire</h2>
                  <div className="flex flex-wrap -mx-2 mb-4">
                    <div className="w-full md:w-1/2 px-2">
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
                    <div className="w-full md:w-1/2 px-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentQuestions.map((question, questionIndex) => (
                      <div key={questionIndex} className="mb-4 p-4 border rounded-lg shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor={`question-${questionIndex}`}>
                            Question {indexOfFirstQuestion + questionIndex + 1}
                          </label>
                          <button
                            type="button"
                            onClick={() => deleteQuestion(indexOfFirstQuestion + questionIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="mb-2">
                          <input
                            type="text"
                            id={`question-${questionIndex}`}
                            name="contenu"
                            value={question.contenu}
                            onChange={(e) => handleQuestionChange(indexOfFirstQuestion + questionIndex, e)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>
                        <div className="mb-2">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`type-${questionIndex}`}>
                            Type de Question
                          </label>
                          <select
                            id={`type-${questionIndex}`}
                            name="type"
                            value={question.type}
                            onChange={(e) => handleQuestionChange(indexOfFirstQuestion + questionIndex, e)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          >
                            <option value="choix_unique">Choix unique</option>
                            <option value="choix_multiple">Choix multiple</option>
                            <option value="note">Note (1-5)</option>
                            <option value="reponse_libre">Réponse libre</option>
                          </select>
                        </div>
                        {question.type !== 'note' && question.type !== 'reponse_libre' && (
                          <>
                            <h4 className="font-medium mt-2">Réponses:</h4>
                            {question.reponses.map((reponse, answerIndex) => (
                              <div key={answerIndex} className="mb-2 flex items-center">
                                <input
                                  type="text"
                                  name="libelle"
                                  value={reponse.libelle}
                                  onChange={(e) => handleAnswerChange(indexOfFirstQuestion + questionIndex, answerIndex, e)}
                                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                                <button
                                  type="button"
                                  onClick={() => deleteAnswer(indexOfFirstQuestion + questionIndex, answerIndex)}
                                  className="text-red-500 hover:text-red-700 ml-2"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            ))}
                            <button type="button" onClick={() => addAnswer(indexOfFirstQuestion + questionIndex)} className="mt-2 flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                              <Plus className="h-4 w-4 mr-2" />
                              <span>Ajouter une réponse</span>
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </form>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-4">{selectedSurvey.titre}</h2>
                  <p className="mb-4">{selectedSurvey.description}</p>
                  {selectedSurvey.questions.map((question, index) => (
                    <div key={index} className="mb-4 p-4 border rounded-lg shadow-sm">
                      <p className="font-bold text-lg">{question.contenu}</p>
                      <p className="text-sm text-gray-500">Type: {getQuestionTypeLabel(question.type)}</p>
                      {question.type !== 'note' && question.type !== 'reponse_libre' && (
                        <>
                          <h4 className="font-medium mt-2">Réponses:</h4>
                          <ul className="list-disc pl-5">
                            {question.reponses.map((reponse, idx) => (
                              <li key={idx} className="text-gray-700">
                                {reponse.libelle}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
            {editMode && (
              <div className="flex space-x-4 mt-4 justify-end p-4 bg-white border-t border-gray-200 sticky bottom-0">
                <button type="button" onClick={addQuestion} className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Ajouter une question</span>
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="flex items-center justify-center bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  <span>Enregistrer</span>
                </button>
              </div>
            )}
            {/* Contrôles de pagination pour les questions dans le modal */}
            <div className="flex justify-between items-center p-4 bg-white border-t border-gray-200 sticky bottom-0">
              <button
                onClick={() => paginateQuestions(currentQuestionPage - 1)}
                disabled={currentQuestionPage === 1}
                className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="ml-2">Précédent</span>
              </button>
              <form onSubmit={handleQuestionPageInputSubmit} className="flex items-center space-x-2">
                <span>Aller à la page</span>
                <input
                  type="number"
                  value={questionPageInput}
                  onChange={handleQuestionPageInputChange}
                  className="border border-gray-300 rounded-md px-3 py-2 w-16 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center">
                  <span>Aller</span>
                </button>
              </form>
              <span className="text-gray-700">
                Page {currentQuestionPage} de {Math.ceil(formData.questions.length / questionsPerPage)}
              </span>
              <span className="text-gray-700">
                {indexOfFirstQuestion + 1} - {Math.min(indexOfLastQuestion, formData.questions.length)} sur {formData.questions.length} lignes
              </span>
              <button
                onClick={() => paginateQuestions(currentQuestionPage + 1)}
                disabled={currentQuestionPage === Math.ceil(formData.questions.length / questionsPerPage)}
                className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                <span className="mr-2">Suivant</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default SurveyList;
