import React from 'react';
import { Formation } from '../../types/database';

interface TimelineProps {
  selectedSession: Formation | null;
}

const Timeline: React.FC<TimelineProps> = ({ selectedSession }) => {
  if (!selectedSession) {
    return <div>Aucune session sélectionnée.</div>;
  }

  // Exemple d'événements fictifs pour l'historique de la session
  const historyEvents = [
    { date: '2024-01-01', description: 'Session créée' },
    { date: '2024-01-10', description: 'Premier participant inscrit' },
    { date: '2024-02-01', description: 'Formateur assigné' },
    { date: '2024-03-01', description: 'Lieu de la session confirmé' },
    { date: '2024-04-01', description: 'Session commencée' },
  ];

  return (
    <div className="timeline-container p-6">
      <div className="timeline-item mb-8">
        <div className="timeline-content bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">{selectedSession.title}</h3>
          <p className="mb-4">{selectedSession.description}</p>
          <p className="mb-2">
            <strong>Dates :</strong> {new Date(selectedSession.startDate).toLocaleDateString()} -{' '}
            {new Date(selectedSession.endDate).toLocaleDateString()}
          </p>
          <p className="mb-2">
            <strong>Lieu :</strong> {selectedSession.location}
          </p>
          <p className="mb-2">
            <strong>Mode :</strong> {selectedSession.mode}
          </p>
          <p className="mb-2">
            <strong>Formateurs :</strong>{' '}
            {selectedSession.instructors.map((instructor) => instructor.first_name).join(', ')}
          </p>
          <p className="mb-4">
            <strong>Participants :</strong>{' '}
            {selectedSession.enrolledCount} / {selectedSession.maxParticipants}
          </p>
          <div>
            <strong className="block mb-2">Historique :</strong>
            <ul className="space-y-2">
              <li>Créé le {new Date(selectedSession.created_at).toLocaleDateString()}</li>
              <li>Mis à jour le {new Date(selectedSession.updated_at).toLocaleDateString()}</li>
              {historyEvents.map((event, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="text-gray-500">•</span>
                  <span>{event.description} le {new Date(event.date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
