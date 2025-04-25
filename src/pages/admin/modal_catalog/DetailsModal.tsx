import React from 'react';
import { X, Edit, Trash, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import type { Formation } from '../types/database';

interface DetailsModalProps {
  selectedFormation: Formation | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (formation: Formation) => void;
  onDelete: (formationId: string) => void;
  onDownloadPDF: () => void;
}


const DetailsModal: React.FC<DetailsModalProps> = ({
  selectedFormation,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDownloadPDF,
}) => {
  if (!isOpen || !selectedFormation) return null;

  const contentToExportRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl p-4">
        <div className="border-b border-gray-200 flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">{selectedFormation.titre}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div ref={contentToExportRef} className="space-y-4">
  <h1 className="text-xl font-bold mb-2">{selectedFormation.titre}</h1>
  <div>
    <h3 className="text-lg font-semibold mb-1 text-blue-500">Programme de la formation :</h3>
    <div
      className="space-y-2 ql-editor"
      dangerouslySetInnerHTML={{ __html: selectedFormation.programme || '' }}
    />
  </div>


        </div>

        {/* Bloc sessions supprimé */}

        <div className="border-t border-gray-200 flex justify-between items-center pt-4">
          <button onClick={onClose} className="btn-secondary">
            Fermer
          </button>
          <div className="flex space-x-2">
            <button onClick={() => onEdit(selectedFormation)} className="btn-secondary flex items-center space-x-1">
              <Edit className="h-3 w-3" />
              <span>Modifier</span>
            </button>
            <button onClick={onDownloadPDF} className="btn-primary">
              Télécharger en PDF
            </button>
            <button
              onClick={() => onDelete(selectedFormation.id_formation)}
              className="btn-secondary flex items-center space-x-1 delete-button"
            >
              <Trash className="h-3 w-3" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
