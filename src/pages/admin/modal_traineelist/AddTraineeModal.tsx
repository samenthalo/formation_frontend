import React from 'react';
import axios from 'axios';
import { X, CheckSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import TraineeForm from './TraineeForm';

interface AddTraineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  availableSessions: any[];
  onSubmit: (newTrainee: any) => void; // Ajout d'une prop pour gérer la soumission
}

const AddTraineeModal: React.FC<AddTraineeModalProps> = ({ isOpen, onClose, formData, setFormData, availableSessions, onSubmit }) => {
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Données du formulaire avant envoi :', formData); // Log des données du formulaire

    const formDataToSend = new FormData();
    formDataToSend.append('nom_stagiaire', formData.nom_stagiaire);
    formDataToSend.append('prenom_stagiaire', formData.prenom_stagiaire);
    formDataToSend.append('telephone_stagiaire', formData.telephone_stagiaire);
    formDataToSend.append('email_stagiaire', formData.email_stagiaire);
    formDataToSend.append('entreprise_stagiaire', formData.entreprise_stagiaire);
    formDataToSend.append('fonction_stagiaire', formData.fonction_stagiaire);
    formDataToSend.append('id_session', formData.sessions[0].id_session); // Assuming you want the first session's ID

    // Log each key-value pair in FormData
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
    }

    try {
      const response = await axios.post('http://localhost:8000/stagiaires', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Réponse du serveur:', response.data); // Log de la réponse du serveur

      // Appeler la fonction onSubmit avec les données du nouveau stagiaire
      onSubmit(response.data);

      toast.success(response.data.message);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du stagiaire:', error); // Log de l'erreur
      toast.error('Erreur lors de l\'ajout du stagiaire');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Ajouter un stagiaire</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <TraineeForm formData={formData} setFormData={setFormData} availableSessions={availableSessions} />
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-dark"
            >
              Annuler
            </button>
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-primary-dark">
              <CheckSquare className="h-5 w-5" />
              <span>Ajouter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTraineeModal;
