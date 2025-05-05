import React from 'react';
import { X, Mail, Phone, Building, User } from 'lucide-react';

interface TraineeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainee: any;
  onEdit: () => void;
}

const TraineeDetailsModal: React.FC<TraineeDetailsModalProps> = ({ isOpen, onClose, trainee, onEdit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Détails du stagiaire</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-primary bg-opacity-10 rounded-full">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {trainee.prenom_stagiaire} {trainee.nom_stagiaire}
              </h3>
              <p className="text-gray-600">{trainee.email_stagiaire}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Contact</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="h-5 w-5" />
                  <span>{trainee.email_stagiaire}</span>
                </div>
                {trainee.telephone_stagiaire && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-5 w-5" />
                    <span>{trainee.telephone_stagiaire}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Entreprise</h4>
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-4 text-gray-400" />
                <div className="text-sm text-gray-900">{trainee.entreprise_stagiaire}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Fonction</h4>
              <div className="text-sm text-gray-900">{trainee.fonction_stagiaire}</div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sessions</h4>
              <div className="flex flex-wrap gap-2">
                {(trainee.sessions || []).map((session: any, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm"
                  >
                    {session.titre}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-dark"
          >
            Fermer
          </button>
          <button
            onClick={onEdit}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

export default TraineeDetailsModal;
