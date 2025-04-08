import React, { useState } from 'react';
import { FileText, Download, Send, X, CheckCircle } from 'lucide-react';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
  template: string;
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  formation: string;
}

const DocumentGenerator = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [customFields, setCustomFields] = useState({
    formation: '',
    date: '',
    duration: '',
    location: '',
    program: null as File | null,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const documentTypes: DocumentType[] = [
    {
      id: 'convention',
      name: 'Convention de formation',
      description: 'Document officiel établissant les termes de la formation',
      icon: FileText,
      template: `
        CONVENTION DE FORMATION PROFESSIONNELLE
        Entre les soussignés :
        1. [Organisme de formation]
        2. [Entreprise/Stagiaire]

        Article 1 : Objet de la convention
        En exécution de la présente convention, l'organisme de formation s'engage à organiser l'action de formation suivante :
        - Formation : [formation]
        - Date : [date]
        - Durée : [duration]
        - Lieu : [location]

        Article 2 : Nature et caractéristiques de l'action de formation
        - Type d'action : Acquisition de compétences
        - Objectifs : Voir programme de formation joint
        - Programme : Voir annexe

        Article 3 : Dispositions financières
        En contrepartie de cette action de formation, le client s'engage à acquitter les frais suivants :
        - Frais de formation : XXX € HT
        - TVA (20%) : XXX €
        - Total TTC : XXX €
      `
    },
    {
      id: 'attestation',
      name: 'Attestation de fin de formation',
      description: 'Certificat de réussite pour les participants',
      icon: FileText,
      template: `
        ATTESTATION DE FIN DE FORMATION

        Je soussigné(e) [formateur], certifie que [stagiaire] a suivi avec assiduité la formation [formation] qui s'est déroulée du [date] pour une durée de [duration].

        Cette formation a permis d'acquérir les compétences suivantes :
        [compétences]

        Fait à [location], le [date]
      `
    },
  ];

  // Simuler une liste de stagiaires
  const availableRecipients: Recipient[] = [
    {
      id: '1',
      name: 'Marie Martin',
      email: 'marie.martin@email.com',
      formation: 'Formation React Avancé'
    },
    {
      id: '2',
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      formation: 'JavaScript Moderne'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      // Simuler la génération et l'envoi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Afficher le modal de succès
      setShowSuccessModal(true);
      
      // Réinitialiser le formulaire
      setCustomFields({
        formation: '',
        date: '',
        duration: '',
        location: '',
        program: null,
      });
      setRecipients([]);
      
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFields(prev => ({ ...prev, program: file }));
    }
  };

  const handleRecipientChange = (recipientId: string) => {
    const recipient = availableRecipients.find(r => r.id === recipientId);
    if (recipient) {
      if (recipients.find(r => r.id === recipientId)) {
        setRecipients(recipients.filter(r => r.id !== recipientId));
      } else {
        setRecipients([...recipients, recipient]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Générateur de Documents</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentTypes.map((type) => (
          <div
            key={type.id}
            className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all ${
              selectedType === type.id
                ? 'ring-2 ring-primary'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedType(type.id)}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary bg-opacity-10 rounded-full">
                <type.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">{type.name}</h3>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedType && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection des destinataires */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destinataires
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableRecipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      recipients.find(r => r.id === recipient.id)
                        ? 'border-primary bg-primary bg-opacity-5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleRecipientChange(recipient.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{recipient.name}</p>
                        <p className="text-sm text-gray-600">{recipient.email}</p>
                        <p className="text-sm text-gray-600">{recipient.formation}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={recipients.some(r => r.id === recipient.id)}
                        onChange={() => {}}
                        className="h-5 w-5 text-primary rounded border-gray-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Formation
                </label>
                <input
                  type="text"
                  value={customFields.formation}
                  onChange={(e) =>
                    setCustomFields({ ...customFields, formation: e.target.value })
                  }
                  className="input-field"
                  placeholder="Nom de la formation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={customFields.date}
                  onChange={(e) =>
                    setCustomFields({ ...customFields, date: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (en heures)
                </label>
                <input
                  type="number"
                  value={customFields.duration}
                  onChange={(e) =>
                    setCustomFields({ ...customFields, duration: e.target.value })
                  }
                  className="input-field"
                  placeholder="35"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu
                </label>
                <input
                  type="text"
                  value={customFields.location}
                  onChange={(e) =>
                    setCustomFields({ ...customFields, location: e.target.value })
                  }
                  className="input-field"
                  placeholder="Adresse de la formation"
                  required
                />
              </div>
            </div>

            {/* Programme de formation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Programme de formation
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="program"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/90"
                    >
                      <span>Téléverser un fichier</span>
                      <input
                        id="program"
                        name="program"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="sr-only"
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC jusqu'à 10MB
                  </p>
                </div>
              </div>
              {customFields.program && (
                <p className="mt-2 text-sm text-gray-600">
                  Fichier sélectionné : {customFields.program.name}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="btn-secondary flex items-center space-x-2"
                onClick={() => {
                  // Logique pour prévisualiser
                }}
              >
                <Download className="h-4 w-4" />
                <span>Prévisualiser</span>
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
                disabled={isGenerating}
              >
                <Send className="h-4 w-4" />
                <span>
                  {isGenerating ? 'Génération en cours...' : 'Générer et envoyer'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal de succès */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Documents générés avec succès
              </h3>
              <p className="text-sm text-gray-600">
                Les conventions et programmes de formation ont été envoyés aux destinataires sélectionnés.
              </p>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
              <button
                type="button"
                className="btn-primary w-full sm:w-auto"
                onClick={() => setShowSuccessModal(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentGenerator;