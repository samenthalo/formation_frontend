import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Formation } from '../../types/database';

interface TimelineProps {
  selectedSession: Formation | null;
}

interface HistoryEvent {
  id: number;
  idSession: number;
  dateEvenement: string;
  typeEvenement: string;
  description: string;
}

const Timeline: React.FC<TimelineProps> = ({ selectedSession }) => {
  const [sessionData, setSessionData] = useState<Formation | null>(null);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Selected Session Data in Timeline:', selectedSession); // Log the selected session data
    if (selectedSession && selectedSession.id_session) {
      const fetchSessionData = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`http://localhost:8000/chronologie/`, {
            params: { id_session: selectedSession.id_session }
          });
          console.log('Response Data:', response.data); // Log the response data
          const formattedEvents = response.data.map((item: HistoryEvent) => {
            const date = new Date(item.dateEvenement);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return {
              ...item,
              dateEvenement: `${month}/${day}/${year} ${hours}:${minutes}`
            };
          });
          setSessionData(selectedSession);
          setHistoryEvents(formattedEvents);
        } catch (err) {
          setError('Erreur lors de la récupération des données de la session.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchSessionData();
    } else {
      // Reset states if no session is selected
      setSessionData(null);
      setHistoryEvents([]);
      setLoading(false);
      setError(null);
    }
  }, [selectedSession]);

  if (loading) {
    return <div>Chargement en cours...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!sessionData) {
    return <div>Aucune session sélectionnée.</div>;
  }

  const { titre } = sessionData;

  return (
    <div className="timeline-container p-6">
      <div className="timeline-item mb-8">
        <div className="timeline-content bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">
            {titre}
          </h3>
          <div>
            <strong className="block mb-2">Chronologie :</strong>
            {historyEvents.length > 0 ? (
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 ml-4"></div>
                {historyEvents.map((event, index) => (
                  <div key={event.id} className="flex items-center mb-4 relative">
                    <div
                      className="z-10 w-8 h-8 bg-blue-500 border-4 border-blue-200 rounded-full flex items-center justify-center text-white text-sm"
                    >
                      {index + 1}
                    </div>
                    <div className="ml-4">
                      <p className="text-gray-700">{event.description}</p>
                      <p className="text-gray-500 text-sm">{event.dateEvenement}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Aucun événement enregistré dans la chronologie pour cette session.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
