import React, { useState } from 'react';
import { X, Trash, Pencil, Mail, Tag, FileText } from 'lucide-react';

interface Formation {
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
  presenceSheetsSent: number;
  setPresenceSheetsSent: React.Dispatch<React.SetStateAction<number>>;
  signaturesCount: number;
  setSignaturesCount: React.Dispatch<React.SetStateAction<number>>;
  quizzSent: number;
  setQuizzSent: React.Dispatch<React.SetStateAction<number>>;
  quizzResponses: number;
  setQuizzResponses: React.Dispatch<React.SetStateAction<number>>;
  satisfactionSent: number;
  setSatisfactionSent: React.Dispatch<React.SetStateAction<number>>;
  satisfactionResponses: number;
  setSatisfactionResponses: React.Dispatch<React.SetStateAction<number>>;
  coldQuestionnaireSent: number;
  setColdQuestionnaireSent: React.Dispatch<React.SetStateAction<number>>;
  coldQuestionnaireResponses: number;
  setColdQuestionnaireResponses: React.Dispatch<React.SetStateAction<number>>;
  opcoQuestionnaireSent: number;
  setOpcoQuestionnaireSent: React.Dispatch<React.SetStateAction<number>>;
  opcoQuestionnaireResponses: number;
  setOpcoQuestionnaireResponses: React.Dispatch<React.SetStateAction<number>>;
  emailsSent: number;
  setEmailsSent: React.Dispatch<React.SetStateAction<number>>;
}> = ({
  onClose,
  formation,
  presenceSheetsSent,
  setPresenceSheetsSent,
  signaturesCount,
  setSignaturesCount,
  quizzSent,
  setQuizzSent,
  quizzResponses,
  setQuizzResponses,
  satisfactionSent,
  setSatisfactionSent,
  satisfactionResponses,
  setSatisfactionResponses,
  coldQuestionnaireSent,
  setColdQuestionnaireSent,
  coldQuestionnaireResponses,
  setColdQuestionnaireResponses,
  opcoQuestionnaireSent,
  setOpcoQuestionnaireSent,
  opcoQuestionnaireResponses,
  setOpcoQuestionnaireResponses,
  emailsSent,
  setEmailsSent
}) => {

  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
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
    attachments: ['Programme de la formation.pdf', 'Livret d\'accueil.pdf'] // Pièces jointes préremplies
  });

  const handleSendPresenceSheet = () => {
    setPresenceSheetsSent(prev => prev + 1);
    setSignaturesCount(prev => prev + 1); // Assuming one signature per sheet
    alert('Feuille de présence envoyée');
  };

  const handleSendQuizz = () => {
    setQuizzSent(prev => prev + 1);
    alert('Quizz envoyé');
  };

  const handleSendSatisfaction = () => {
    setSatisfactionSent(prev => prev + 1);
    alert('Enquête de satisfaction envoyée');
  };

  const handleSendColdQuestionnaire = () => {
    setColdQuestionnaireSent(prev => prev + 1);
    alert('Questionnaire à froid envoyé');
  };

  const handleSendOpcoQuestionnaire = () => {
    setOpcoQuestionnaireSent(prev => prev + 1);
    alert('Questionnaire OPCO envoyé');
  };

  const handleSendEmail = () => {
    setIsEmailPreviewOpen(true);
    // Ne pas incrémenter emailsSent ici si vous n'avez pas de backend
  };

  const closeEmailPreview = () => {
    setIsEmailPreviewOpen(false);
  };

  const handleEmailSendConfirmation = () => {
    alert('Email envoyé avec succès !');
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
            </div>
          </div>
          <div>
            <button onClick={handleSendEmail} className="w-full bg-blue-400 text-white py-2 rounded-md hover:bg-blue-500 transition">
              Envoyer Email
            </button>
            <div className="text-sm text-gray-500 mt-2">
              <p>Emails envoyés : {emailsSent}</p>
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
                  onChange={(e) => setEmailDetails({ ...emailDetails, to: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"
                  placeholder="Destinataire"
                />
              </div>
              <div className="flex items-center">
                <Tag className="h-6 w-6 text-gray-500 mr-3" />
                <input
                  type="text"
                  value={emailDetails.subject}
                  onChange={(e) => setEmailDetails({ ...emailDetails, subject: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-3"
                  placeholder="Objet"
                />
              </div>
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-gray-500 mr-3" />
                <textarea
                  value={emailDetails.body}
                  onChange={(e) => setEmailDetails({ ...emailDetails, body: e.target.value })}
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
    </div>
  );
};

export default ActionsPopup;
