import React, { useEffect } from 'react';

interface TraineeFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  availableSessions: any[];
  initialSessions: any[]; // Ajouté pour les sessions initiales
}

const TraineeForm: React.FC<TraineeFormProps> = ({ formData, setFormData, availableSessions, initialSessions }) => {
  useEffect(() => {
    // Mettre à jour formData.sessions avec les sessions initiales
    setFormData(prev => ({
      ...prev,
      sessions: initialSessions || [] // Assurez-vous que sessions est un tableau
    }));
  }, [initialSessions, setFormData]);

  const handleSessionToggle = (session: any) => {
    setFormData(prev => {
      const isSessionChecked = (prev.sessions || []).some((s: any) => s.id_session === session.id_session);
      const updatedSessions = isSessionChecked
        ? prev.sessions.filter((s: any) => s.id_session !== session.id_session)  // Supprimer si déjà coché
        : [...(prev.sessions || []), session];  // Ajouter si non coché

      return {
        ...prev,
        sessions: updatedSessions
      };
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Champ caché pour l'ID */}
      <input
        type="hidden"
        value={formData.id_stagiaire}
        onChange={(e) => setFormData({ ...formData, id_stagiaire: e.target.value })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prénom
          </label>
          <input
            type="text"
            value={formData.prenom_stagiaire}
            onChange={(e) => setFormData({ ...formData, prenom_stagiaire: e.target.value })}
            className="input-field border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom
          </label>
          <input
            type="text"
            value={formData.nom_stagiaire}
            onChange={(e) => setFormData({ ...formData, nom_stagiaire: e.target.value })}
            className="input-field border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email_stagiaire}
          onChange={(e) => setFormData({ ...formData, email_stagiaire: e.target.value })}
          className="input-field border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone
        </label>
        <input
          type="tel"
          value={formData.telephone_stagiaire}
          onChange={(e) => setFormData({ ...formData, telephone_stagiaire: e.target.value })}
          className="input-field border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Entreprise
        </label>
        <input
          type="text"
          value={formData.entreprise_stagiaire}
          onChange={(e) => setFormData({ ...formData, entreprise_stagiaire: e.target.value })}
          className="input-field border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Nom de l'entreprise"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fonction
        </label>
        <input
          type="text"
          value={formData.fonction_stagiaire}
          onChange={(e) => setFormData({ ...formData, fonction_stagiaire: e.target.value })}
          className="input-field border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sessions
        </label>
        <div className="space-y-2">
          {availableSessions.map((session, index) => (
            <label key={session.id_session || index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={(formData.sessions || []).some((s: any) => s.id_session === session.id_session)}
                onChange={() => handleSessionToggle(session)}
                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{session.titre}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TraineeForm;
