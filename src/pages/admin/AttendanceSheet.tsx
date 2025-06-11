import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jsPDF } from 'jspdf';
import logo from '../../assets/logo.png';

const formatDate = (dateString) => {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const AttendanceSheet = () => {
  const [view, setView] = useState('attendanceSheet');
  const [sessionId, setSessionId] = useState(null);
  const [formation, setFormation] = useState('');
  const [duree, setDuree] = useState('');
  const [formateur, setFormateur] = useState('');
  const [participants, setParticipants] = useState([{ nom: '', prenom: '' }]);
  const [datesSessions, setDatesSessions] = useState([{
    jour: new Date().toISOString().split('T')[0],
    heureDebut: '',
    heureFin: ''
  }]);

  const toggleView = () => {
    setView(prevView => prevView === 'attendanceSheet' ? 'documentList' : 'attendanceSheet');
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const id = queryParams.get('id_session');
    setSessionId(id);

    if (id) {
      const fetchSessionData = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/fichepresence/${id}`);
          const data = response.data;
          setFormation(data.titre || '');
          setDuree(data.duree_heures ? data.duree_heures.toString() : '');
          if (data.formateur) {
            setFormateur(`${data.formateur.prenom || ''} ${data.formateur.nom || ''}`.trim());
          }
          if (data.dates_sessions && data.dates_sessions.length > 0) {
            const formattedDates = data.dates_sessions.map(session => ({
              jour: session.jour,
              heureDebut: session.heureDebut ? session.heureDebut.substring(0, 5) : '',
              heureFin: session.heureFin ? session.heureFin.substring(0, 5) : ''
            }));
            setDatesSessions(formattedDates);
          }
          if (data.participants && data.participants.length > 0) {
            const formattedParticipants = data.participants.map(participant => ({
              nom: participant.nom || '',
              prenom: participant.prenom || ''
            }));
            setParticipants(formattedParticipants);
          }
        } catch (error) {
          console.error("Error fetching session data:", error);
        }
      };
      fetchSessionData();
    }
  }, [sessionId]);

  const handleAddParticipant = () => {
    setParticipants([...participants, { nom: '', prenom: '' }]);
  };

  const handleParticipantChange = (index, field, value) => {
    const newParticipants = [...participants];
    newParticipants[index][field] = value;
    setParticipants(newParticipants);
  };

  const handleAddDateSession = () => {
    setDatesSessions([...datesSessions, {
      jour: new Date().toISOString().split('T')[0],
      heureDebut: '',
      heureFin: ''
    }]);
  };

  const handleDateSessionChange = (index, field, value) => {
    const newDatesSessions = [...datesSessions];
    newDatesSessions[index][field] = value;
    setDatesSessions(newDatesSessions);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const logoWidth = 38;
    const logoHeight = 22;
    doc.addImage(logo, 'PNG', 170, 5, logoWidth, logoHeight);

    doc.setFontSize(18);
    doc.setTextColor(46, 125, 208);
    doc.text("Feuille de présence", 105, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.setFont(undefined, 'bold');
    doc.text("Formation: ", 20, 30);
    doc.setFont(undefined, 'normal');
    doc.text(`${formation}`, 45, 30);

    doc.setFont(undefined, 'bold');
    doc.text("Temps passé: ", 20, 37);
    doc.setFont(undefined, 'normal');
    doc.text(`${duree}`, 50, 37);

    doc.setFont(undefined, 'bold');
    doc.text("Formateur: ", 20, 44);
    doc.setFont(undefined, 'normal');
    doc.text(`${formateur}`, 45, 44);

    doc.setFont(undefined, 'bold');
    doc.text("Dates: ", 20, 51);
    doc.setFont(undefined, 'normal');
    const datesText = datesSessions.map(session => formatDate(session.jour)).join(', ');
    doc.text(datesText, 35, 51);
    let yOffset = 60;

    datesSessions.forEach((session) => {
      const dateText = `Pour le ${formatDate(session.jour)}, Début: ${session.heureDebut}, Fin: ${session.heureFin}`;
      doc.text(dateText, 20, yOffset);
      yOffset += 5;

      doc.setFillColor(217, 234, 211);
      doc.rect(10, yOffset, 190, 8, 'F');
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("Nom", 20, yOffset + 5);
      doc.text("Prénom", 60, yOffset + 5);
      doc.text("Emargement", 120, yOffset + 5);
      doc.text("Emargement formateur", 160, yOffset + 5);
      yOffset += 13;

      participants.forEach((participant, participantIndex) => {
        const rowY = yOffset + participantIndex * 10;
        doc.text(`${participant.nom}`, 20, rowY);
        doc.text(`${participant.prenom}`, 60, rowY);
        doc.text("", 120, rowY);

        if (participantIndex === participants.length - 1) {
          doc.text("", 160, rowY);
          doc.line(150, rowY + 2, 200, rowY + 2);
        }

        doc.line(10, rowY + 2, 150, rowY + 2);
      });

      const finalY = yOffset + (participants.length - 0.7) * 10;

      doc.line(50, yOffset - 5, 50, finalY);
      doc.line(110, yOffset - 5, 110, finalY);
      doc.line(150, yOffset - 5, 150, finalY);

      yOffset += participants.length * 10 + 10;
    });

    // Générer le nom du fichier
    const date = new Date();
    const formattedDate = formatDate(date.toISOString());
    const fileName = `Feuille de présence - ${formateur} - ${formattedDate.replace(/\s+/g, '_')}.pdf`;

    return { doc, fileName };
  };

  const uploadDataToBackend = async (pdfBlob, fileName) => {
    try {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('file', pdfBlob, fileName);

      const response = await axios.post('http://localhost:8000/fichepresence/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Data uploaded successfully:", response.data);
    } catch (error) {
      console.error("Error uploading data:", error.response ? error.response.data : error.message);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { doc, fileName } = generatePDF();
    const pdfBlob = doc.output('blob');

    try {
      await uploadDataToBackend(pdfBlob, fileName);
      toast.success('Fiche de présence générée et envoyée avec succès !');
    } catch (error) {
      console.error("Error uploading data:", error);
      toast.error('Erreur lors de l\'envoi de la fiche de présence.');
    }

    // Create a local download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <ToastContainer />
      {view === 'attendanceSheet' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Fiche de Présence</h1>
            <button
              type="button"
              onClick={toggleView}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
            >
              Voir les fiches existantes
            </button>
          </div>
          <AttendanceForm
            formation={formation}
            setFormation={setFormation}
            duree={duree}
            setDuree={setDuree}
            formateur={formateur}
            setFormateur={setFormateur}
            participants={participants}
            setParticipants={setParticipants}
            datesSessions={datesSessions}
            setDatesSessions={setDatesSessions}
            handleAddParticipant={handleAddParticipant}
            handleParticipantChange={handleParticipantChange}
            handleAddDateSession={handleAddDateSession}
            handleDateSessionChange={handleDateSessionChange}
            handleSubmit={handleSubmit}
          />
        </>
      ) : (
        <DocumentList toggleView={toggleView} />
      )}
    </div>
  );
};

const AttendanceForm = ({
  formation, setFormation, duree, setDuree, formateur, setFormateur,
  participants, setParticipants, datesSessions, setDatesSessions,
  handleAddParticipant, handleParticipantChange, handleAddDateSession,
  handleDateSessionChange, handleSubmit
}) => (
  <form onSubmit={handleSubmit} className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la formation</label>
      <input
        type="text"
        value={formation}
        onChange={(e) => setFormation(e.target.value)}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
      <input
        type="text"
        value={duree}
        onChange={(e) => setDuree(e.target.value)}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Nom du formateur</label>
      <input
        type="text"
        value={formateur}
        onChange={(e) => setFormateur(e.target.value)}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        required
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Créneaux</label>
      {datesSessions.map((session, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={session.jour}
              onChange={(e) => handleDateSessionChange(index, 'jour', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heure de début</label>
            <input
              type="time"
              value={session.heureDebut}
              onChange={(e) => handleDateSessionChange(index, 'heureDebut', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heure de fin</label>
            <input
              type="time"
              value={session.heureFin}
              onChange={(e) => handleDateSessionChange(index, 'heureFin', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn-secondary mt-2"
        onClick={handleAddDateSession}
      >
        Ajouter un créneau
      </button>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
      {participants.map((participant, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={participant.nom}
              onChange={(e) => handleParticipantChange(index, 'nom', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              value={participant.prenom}
              onChange={(e) => handleParticipantChange(index, 'prenom', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn-secondary mt-2"
        onClick={handleAddParticipant}
      >
        Ajouter un participant
      </button>
    </div>

    <button
      type="submit"
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5ea8f2] hover:bg-[#4a90d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ea8f2]"
    >
      Générer PDF
    </button>
  </form>
);

const DocumentList = ({ toggleView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/fichepresence/all');
        if (response.status !== 200) {
          throw new Error('Network response was not ok');
        }
        const data = response.data;

        const transformedData = data.map((item) => {
          const cheminFichier = item.chemin_fichier || 'unknown.pdf';
          const fileExtension = cheminFichier.split('.').pop() || 'pdf';
          const fileName = cheminFichier.split('/').pop() || 'unknown.pdf';

          const dateGeneration = item.date_generation || '2023-01-01 00:00:00';
          const date = new Date(dateGeneration);

          if (isNaN(date.getTime())) {
            return {
              id: item.id,
              idSession: item.id_session,
              title: fileName,
              description: item.titreSession || `Document ${item.id}`,
              type: fileExtension.toUpperCase(),
              date: new Date('2023-01-01').toLocaleDateString('fr-FR'),
              cheminFichier: cheminFichier,
            };
          }

          return {
            id: item.id,
            idSession: item.id_session,
            title: fileName,
            description: item.titreSession || `Document ${item.id}`,
            type: fileExtension.toUpperCase(),
            date: date.toLocaleDateString('fr-FR'),
            cheminFichier: cheminFichier,
          };
        });

        setDocuments(transformedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:8000/fichepresence/${id}`);

      if (response.status !== 200) {
        throw new Error('Failed to delete the document');
      }

      setDocuments(documents.filter(document => document.id !== id));

      toast.success('Document supprimé avec succès !');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erreur lors de la suppression du document.');
    }
  };

  const filteredDocuments = documents.filter(document =>
    document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    document.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstDocument, indexOfLastDocument);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-8 p-6">
      <ToastContainer />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Liste des Fiches de Présence</h1>
        <button
          type="button"
          onClick={toggleView}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
        >
          Retour à la fiche de présence
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher une fiche de présence..."
                  className="pl-10 border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button className="bg-secondary text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-secondary-dark">
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDocuments.length > 0 ? (
                currentDocuments.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{document.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{document.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{document.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{document.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`http://localhost:8000/${document.cheminFichier}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark mr-3"
                      >
                        Télécharger
                      </a>
                      <button
                        onClick={() => handleDelete(document.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun document trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-between items-center p-4 bg-white border-t border-gray-200">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-2">Précédent</span>
            </button>
            <span className="text-gray-700">
              Page {currentPage} de {Math.ceil(filteredDocuments.length / documentsPerPage)}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredDocuments.length / documentsPerPage)}
              className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              <span className="mr-2">Suivant</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSheet;
