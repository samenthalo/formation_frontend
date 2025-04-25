import React from 'react';
import { Formation } from '../../types/database';

interface TimelineProps {
  selectedSession: Formation | null;
}

const Timeline: React.FC<TimelineProps> = ({ selectedSession }) => {
  if (!selectedSession) {
    return <div>Aucune session sélectionnée.</div>;
  }

  console.log('selectedSession:', selectedSession); // Ajoutez ce log pour inspecter les données

  const {
    titre,
    description,
    lieu,
    mode,
    nb_inscrits,
    id_formateur,
    // Ajoutez d'autres propriétés si nécessaire
  } = selectedSession;

  // Vous devrez peut-être ajouter des propriétés manquantes ou les calculer
  const startDate = selectedSession.startDate || new Date(); // Exemple de valeur par défaut
  const endDate = selectedSession.endDate || new Date(); // Exemple de valeur par défaut
  const instructors = selectedSession.instructors || [{ first_name: 'Formateur inconnu' }]; // Exemple de valeur par défaut
  const maxParticipants = selectedSession.maxParticipants || 10; // Exemple de valeur par défaut

  if (!titre || !description || !startDate || !endDate || !lieu || !mode || !instructors || nb_inscrits === undefined || maxParticipants === undefined) {
    return <div>Données de la session incomplètes.</div>;
  }

  // Événements fictifs basés sur le document fourni
  const historyEvents = [
    { date: '2024-01-01', description: 'Création de la formation' },
    { date: '2024-01-05', description: 'Demande de la liste des stagiaires' },
    { date: '2024-01-10', description: 'Convention envoyée' },
    { date: '2024-01-15', description: 'Positionnement des participants' },
    { date: '2024-02-01', description: 'Formation en cours' },
    { date: '2024-02-10', description: 'Envoi du Quizz' },
    { date: '2024-02-12', description: 'Envoi de la feuille de présence' },
    { date: '2024-02-15', description: 'Envoi de l\'enquête de satisfaction' },
    { date: '2024-02-20', description: 'Envoi de l\'attestation' },
    { date: '2024-03-01', description: 'Envoi du questionnaire à froid' },
    { date: '2024-03-10', description: 'Envoi du questionnaire OPCO' },
  ];

  return (
    <div className="timeline-container p-6">
      <div className="timeline-item mb-8">
        <div className="timeline-content bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">
            {titre}
          </h3>
          <p className="mb-4">{description}</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <strong>Dates :</strong> {new Date(startDate).toLocaleDateString()} -{' '}
              {new Date(endDate).toLocaleDateString()}
            </div>
            <div>
              <strong>Lieu :</strong> {lieu}
            </div>
            <div>
              <strong>Mode :</strong> {mode}
            </div>
            <div>
              <strong>Formateurs :</strong>{' '}
              {instructors.map((instructor) => instructor.first_name).join(', ')}
            </div>
            <div>
              <strong>Participants :</strong>{' '}
              {nb_inscrits} / {maxParticipants}
            </div>
          </div>
          <div>
            <strong className="block mb-2">Chronologie :</strong>
            <div className="relative border-l border-gray-300">
              {historyEvents.map((event, index) => (
                <div key={index} className="flex items-center mb-4">
                  <div
                    className="z-10 w-8 h-8 bg-blue-500 border-4 border-blue-200 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ left: '-2rem' }}
                  >
                    {index + 1}
                  </div>
                  <div className="ml-8">
                    <p className="text-gray-700">{event.description}</p>
                    <p className="text-gray-500 text-sm">{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
