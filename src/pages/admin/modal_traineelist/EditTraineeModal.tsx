import React, { useEffect } from 'react';
import axios from 'axios';
import { X, CheckSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import TraineeForm from './TraineeForm';

interface EditTraineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onSubmit: (e: React.FormEvent) => void;
  availableSessions: any[];
  traineeId: number; // Ajouté pour l'ID du stagiaire
}

const EditTraineeModal: React.FC<EditTraineeModalProps> = ({ isOpen, onClose, formData, setFormData, onSubmit, availableSessions, traineeId }) => {
  useEffect(() => {
    if (isOpen && traineeId) {
      // Charger les sessions associées au stagiaire depuis la table inscription
      const fetchTraineeSessions = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/inscriptions`);
          const traineeSessions = response.data.filter((inscription: any) => inscription.stagiaire.id_stagiaire === traineeId);
          setFormData(prev => ({
            ...prev,
            sessions: traineeSessions.map((inscription: any) => inscription.session) // Mettre à jour formData avec les sessions récupérées
          }));
        } catch (error) {
          console.error("Erreur lors du chargement des sessions du stagiaire :", error);
          toast.error("Erreur lors du chargement des sessions du stagiaire");
        }
      };

      fetchTraineeSessions();
    }
  }, [isOpen, traineeId, setFormData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Vérification de l'ID dans formData avant de soumettre
    if (!formData.id_stagiaire) {
      toast.error("L'ID du stagiaire est manquant");
      return;
    }
  
    // Création d'un objet FormData avec les données à envoyer
    const formDataToSend = new FormData();
    formDataToSend.append('nom_stagiaire', formData.nom_stagiaire);
    formDataToSend.append('prenom_stagiaire', formData.prenom_stagiaire);
    formDataToSend.append('telephone_stagiaire', formData.telephone_stagiaire);
    formDataToSend.append('email_stagiaire', formData.email_stagiaire);
    formDataToSend.append('entreprise_stagiaire', formData.entreprise_stagiaire);
    formDataToSend.append('fonction_stagiaire', formData.fonction_stagiaire);
  
    // Ajouter les IDs des sessions
    if (formData.sessions && Array.isArray(formData.sessions) && formData.sessions.length > 0) {
      formData.sessions.forEach((session: any) => {
        formDataToSend.append('id_sessions[]', session.id_session);
      });
    }
  
    // Log des données envoyées
    console.log("Données envoyées :");
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }
  
    try {
      // Assurer que l'ID est bien dans l'URL
      const response = await axios.post(
        `http://localhost:8000/stagiaires/update/${formData.id_stagiaire}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success(response.data.message || 'Stagiaire mis à jour avec succès');
      onClose(); // Fermer la modale après soumission
    } catch (error) {
      console.error("Erreur lors de la modification du stagiaire :", error);
      toast.error("Erreur lors de la modification du stagiaire");
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Modifier le stagiaire</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <TraineeForm
            formData={formData}
            setFormData={setFormData}
            availableSessions={availableSessions}
            initialSessions={formData.sessions} // Passer les sessions initiales
          />
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-dark"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-primary-dark"
            >
              <CheckSquare className="h-5 w-5" />
              <span>Enregistrer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTraineeModal;
