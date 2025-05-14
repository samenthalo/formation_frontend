import React, { useState, useEffect } from 'react';
import { X, Trash, Pencil, Mail, Tag, FileText } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Formation {
  id_session: string;
  enrolledCount: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  duration: string;
  location: string;
  maxParticipants: number;
  mode: string;
  instructors: { first_name: string; last_name: string }[];
  responsable?: { first_name: string; last_name: string; email: string; phone: string };
  video_link?: string;
}

const ActionsPopup: React.FC<{
  onClose: () => void;
  formation: Formation;
}> = ({ onClose, formation }) => {
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [presenceSheetsSent, setPresenceSheetsSent] = useState(0);
  const [signaturesCount, setSignaturesCount] = useState(0);
  const [quizzSent, setQuizzSent] = useState(0);
  const [quizzResponses, setQuizzResponses] = useState(0);
  const [satisfactionSent, setSatisfactionSent] = useState(0);
  const [satisfactionResponses, setSatisfactionResponses] = useState(0);
  const [coldQuestionnaireSent, setColdQuestionnaireSent] = useState(0);
  const [coldQuestionnaireResponses, setColdQuestionnaireResponses] = useState(0);
  const [opcoQuestionnaireSent, setOpcoQuestionnaireSent] = useState(0);
  const [opcoQuestionnaireResponses, setOpcoQuestionnaireResponses] = useState(0);
  const [emailsSent, setEmailsSent] = useState(0);
  const [eventDates, setEventDates] = useState<{ [key: string]: string }>({});
  const [emailDetails, setEmailDetails] = useState({
    to: 'destinataire@example.com',
    subject: `Invitation à la Formation: ${formation.title}`,
    body: `
      Bonjour,

      Nous avons le plaisir de vous inviter à notre prochaine formation intitulée ${formation.title}.

      Détails de la formation :
      - Date : ${formation.startDate} - ${formation.endDate}
      - Durée : ${formation.duration}
      - Lieu : ${formation.location}
      - Mode : ${formation.mode}

      Vous trouverez ci-joint le programme de la formation ainsi qu'un livret d'accueil.

      Cordialement,
      L'équipe de formation
    `,
    attachments: ['Programme de la formation.pdf', 'Livret d\'accueil.pdf']
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchChronologieData();
      setPresenceSheetsSent(data.filter(item => item.typeEvenement === 'Feuille de présence envoyée').length);
      setQuizzSent(data.filter(item => item.typeEvenement === 'Quiz envoyé').length);
      setSatisfactionSent(data.filter(item => item.typeEvenement === 'Enquête de satisfaction envoyée').length);
      setColdQuestionnaireSent(data.filter(item => item.typeEvenement === 'Questionnaire à froid envoyé').length);
      setOpcoQuestionnaireSent(data.filter(item => item.typeEvenement === 'Questionnaire OPCO envoyé').length);
      setEmailsSent(data.filter(item => item.typeEvenement === 'Email envoyé').length);

      // Extract the latest dates for each event type
      const dates: { [key: string]: string } = {};
      data.forEach(item => {
        if (!dates[item.typeEvenement] || new Date(item.dateEvenement) > new Date(dates[item.typeEvenement])) {
          dates[item.typeEvenement] = item.dateEvenement;
        }
      });
      setEventDates(dates);
    };
    fetchData();
  }, []);

  const fetchChronologieData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/chronologie/?id_session=${formation.id_session}`);
      if (response.ok) {
        const data = await response.json();
        return data.map(item => {
          const date = new Date(item.dateEvenement);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          return {
            ...item,
            dateEvenement: `${month}/${day}/${year}`
          };
        });
      } else {
        console.error('Error fetching chronologie data:', response.statusText);
        return [];
      }
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  const sendEventToBackend = async (typeEvenement: string) => {
    if (!formation.id_session) {
      toast.error('ID de la session manquant');
      return;
    }

    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const dateEvenement = `${day}/${month}/${year}`;

    let description;
    switch (typeEvenement) {
      case 'Feuille de présence envoyée':
        description = `Feuille de présence envoyée pour la session`;
        break;
      case 'Quiz envoyé':
        description = `Quiz envoyé pour la session`;
        break;
      case 'Enquête de satisfaction envoyée':
        description = `Enquête de satisfaction envoyée pour la session`;
        break;
      case 'Questionnaire à froid envoyé':
        description = `Questionnaire à froid envoyé pour la session`;
        break;
      case 'Questionnaire OPCO envoyé':
        description = `Questionnaire OPCO envoyé pour la session`;
        break;
      case 'Email envoyé':
        description = `Email envoyé pour la session`;
        break;
      default:
        description = `Événement inconnu pour la session`;
    }

    const chronologieData = {
      idSession: formation.id_session,
      dateEvenement: dateEvenement,
      typeEvenement: typeEvenement,
      description: description
    };

    console.log('Données envoyées à l\'API:', chronologieData);

    try {
      const response = await fetch('http://localhost:8000/chronologie/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chronologieData)
      });

      console.log('Réponse brute de l\'API:', response);

      if (response.ok) {
        const data = await response.json();
        console.log('Réponse JSON de l\'API:', data);
        toast.success(getSuccessMessage(typeEvenement));
      } else {
        const errorData = await response.json();
        console.error('Erreur de l\'API:', errorData);
        toast.error('Erreur lors de l\'enregistrement de l\'événement');
      }
    } catch (error) {
      console.error('Erreur lors de la requête:', error);
      toast.error('Erreur lors de l\'enregistrement de l\'événement');
    }
  };

  const getSuccessMessage = (typeEvenement: string) => {
    switch (typeEvenement) {
      case 'Feuille de présence envoyée':
        return 'La feuille de présence a bien été envoyée.';
      case 'Quiz envoyé':
        return 'Le quiz a bien été envoyé.';
      case 'Enquête de satisfaction envoyée':
        return 'L\'enquête de satisfaction a bien été envoyée.';
      case 'Questionnaire à froid envoyé':
        return 'Le questionnaire à froid a bien été envoyé.';
      case 'Questionnaire OPCO envoyé':
        return 'Le questionnaire OPCO a bien été envoyé.';
      case 'Email envoyé':
        return 'L\'email a bien été envoyé.';
      default:
        return 'L\'événement a bien été enregistré.';
    }
  };

  const handleSendPresenceSheet = () => {
    sendEventToBackend('Feuille de présence envoyée');
    setPresenceSheetsSent(prev => prev + 1);
    setSignaturesCount(prev => prev + 1);
  };

  const handleSendQuizz = () => {
    sendEventToBackend('Quiz envoyé');
    setQuizzSent(prev => prev + 1);
  };

  const handleSendSatisfaction = () => {
    sendEventToBackend('Enquête de satisfaction envoyée');
    setSatisfactionSent(prev => prev + 1);
  };

  const handleSendColdQuestionnaire = () => {
    sendEventToBackend('Questionnaire à froid envoyé');
    setColdQuestionnaireSent(prev => prev + 1);
  };

  const handleSendOpcoQuestionnaire = () => {
    sendEventToBackend('Questionnaire OPCO envoyé');
    setOpcoQuestionnaireSent(prev => prev + 1);
  };

  const handleSendEmail = () => {
    setIsEmailPreviewOpen(true);
  };

  const closeEmailPreview = () => {
    setIsEmailPreviewOpen(false);
  };

  const handleEmailSendConfirmation = () => {
    sendEventToBackend('Email envoyé');
    closeEmailPreview();
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setEmailDetails({ ...emailDetails, attachments: [...emailDetails.attachments, ...fileNames] });
    }
  };

  const removeAttachment = (attachment: string) => {
    setEmailDetails({
      ...emailDetails,
      attachments: emailDetails.attachments.filter(att => att !== attachment)
    });
  };

  const calculateResponseRate = (responses: number, total: number) => {
    return total ? (responses / total * 100).toFixed(2) + '%' : '0%';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Actions et Statistiques</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <button onClick={handleSendPresenceSheet} className="w-full bg-blue-400 text-white py-2 rounded-md hover:bg-blue-500 transition">
              Envoyer feuille de présence
            </button>
            <div className="text-sm text-gray-500 mt-2">
              <p>Feuilles de présence envoyées : {presenceSheetsSent}</p>
              <p>Signatures effectuées : {signaturesCount}</p>
              {eventDates['Feuille de présence envoyée'] && <p>Dernière date : {eventDates['Feuille de présence envoyée']}</p>}
            </div>
          </div>
          <div>
            <button onClick={handleSendQuizz} className="w-full bg-blue-400 text-white py-2 rounded-md hover:bg-blue-500 transition">
              Envoyer Quiz
            </button>
            <div className="text-sm text-gray-500 mt-2">
              <p>Quiz envoyés : {quizzSent}</p>
              <p>Réponses au quiz : {quizzResponses}</p>
              <p>Taux de réponse : {calculateResponseRate(quizzResponses, formation.enrolledCount)}</p>
              {eventDates['Quiz envoyé'] && <p>Dernière date : {eventDates['Quiz envoyé']}</p>}
            </div>
          </div>
          <div>
            <button onClick={handleSendSatisfaction} className="w-full bg-blue-400 text-white py-2 rounded-md hover:bg-blue-500 transition">
              Envoyer enquête de satisfaction
            </button>
            <div className="text-sm text-gray-500 mt-2">
              <p>Enquêtes de satisfaction envoyées : {satisfactionSent}</p>
              <p>Réponses à l'enquête de satisfaction : {satisfactionResponses}</p>
              <p>Taux de réponse : {calculateResponseRate(satisfactionResponses, formation.enrolledCount)}</p>
              {eventDates['Enquête de satisfaction envoyée'] && <p>Dernière date : {eventDates['Enquête de satisfaction envoyée']}</p>}
            </div>
          </div>
          <div>
            <button onClick={handleSendColdQuestionnaire} className="w-full bg-blue-400 text-white py-2 rounded-md hover:bg-blue-500 transition">
              Envoyer questionnaire à froid
            </button>
            <div className="text-sm text-gray-500 mt-2">
              <p>Questionnaires à froid envoyés : {coldQuestionnaireSent}</p>
              <p>Réponses au questionnaire à froid : {coldQuestionnaireResponses}</p>
              <p>Taux de réponse : {calculateResponseRate(coldQuestionnaireResponses, formation.enrolledCount)}</p>
              {eventDates['Questionnaire à froid envoyé'] && <p>Dernière date : {eventDates['Questionnaire à froid envoyé']}</p>}
            </div>
          </div>
          <div>
            <button onClick={handleSendOpcoQuestionnaire} className="w-full bg-blue-400 text-white py-2 rounded-md hover:bg-blue-500 transition">
              Envoyer questionnaire OPCO
            </button>
            <div className="text-sm text-gray-500 mt-2">
              <p>Questionnaires OPCO envoyés : {opcoQuestionnaireSent}</p>
              <p>Réponses au questionnaire OPCO : {opcoQuestionnaireResponses}</p>
              <p>Taux de réponse : {calculateResponseRate(opcoQuestionnaireResponses, formation.enrolledCount)}</p>
              {eventDates['Questionnaire OPCO envoyé'] && <p>Dernière date : {eventDates['Questionnaire OPCO envoyé']}</p>}
            </div>
          </div>
          <div>
            <button onClick={handleSendEmail} className="w-full bg-blue-400 text-white py-2 rounded-md hover:bg-blue-500 transition">
              Envoyer Email
            </button>
            <div className="text-sm text-gray-500 mt-2">
              <p>Emails envoyés : {emailsSent}</p>
              {eventDates['Email envoyé'] && <p>Dernière date : {eventDates['Email envoyé']}</p>}
            </div>
          </div>
        </div>
      </div>
      {isEmailPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Aperçu de l'Email</h2>
              <button onClick={closeEmailPreview} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="email-content space-y-6">
              <div className="flex items-center">
                <Mail className="h-6 w-6 text-gray-500 mr-3" />
                <input
                  type="email"
                  value={emailDetails.to}
                  onChange={(e) => {
                    setEmailDetails({ ...emailDetails, to: e.target.value });
                  }}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"
                  placeholder="Destinataire"
                />
              </div>
              <div className="flex items-center">
                <Tag className="h-6 w-6 text-gray-500 mr-3" />
                <input
                  type="text"
                  value={emailDetails.subject}
                  onChange={(e) => {
                    setEmailDetails({ ...emailDetails, subject: e.target.value });
                  }}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"
                  placeholder="Objet"
                />
              </div>
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-gray-500 mr-3" />
                <textarea
                  value={emailDetails.body}
                  onChange={(e) => {
                    setEmailDetails({ ...emailDetails, body: e.target.value });
                  }}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"
                  rows={10}
                  placeholder="Corps de l'email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mt-2">Pièces jointes :</label>
                <input
                  type="file"
                  multiple
                  onChange={handleAttachmentChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"
                />
                <ul className="mt-2 space-y-2">
                  {emailDetails.attachments.map((attachment, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-md">
                      <span>{attachment}</span>
                      <div className="flex space-x-3">
                        <button onClick={() => removeAttachment(attachment)} className="text-red-500">
                          <Trash className="h-5 w-5" />
                        </button>
                        <button className="text-blue-500">
                          <Pencil className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={handleEmailSendConfirmation}
                className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default ActionsPopup;
