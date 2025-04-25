import React from 'react';
import { X, Trash } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import type { Formation } from '../types/database';

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newFormation: Formation) => void;
  programme: string;
  setProgramme: React.Dispatch<React.SetStateAction<string>>;
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const AddModal: React.FC<AddModalProps> = ({
  isOpen,
  onClose,
  onSave,
  programme,
  setProgramme,
  file,
  setFile,
}) => {
  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'color', 'background',
    'align',
    'link', 'image', 'video'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newFormation = {
      titre: formData.get('titre') as string,
      description: formData.get('description') as string,
      prix_unitaire_ht: parseFloat(formData.get('prix_unitaire_ht') as string),
      nb_participants_max: parseInt(formData.get('nb_participants_max') as string),
      est_active: formData.get('est_active') === 'true',
      type_formation: formData.get('type_formation') as 'intra' | 'distanciel',
      duree_heures: parseInt(formData.get('duree_heures') as string),
      categorie: formData.get('categorie') as 'administrateur' | 'utilisateur',
      programme: programme,
      multi_jour: formData.get('multi_jour') === 'true',
      cible: formData.get('cible') as string,
      moyens_pedagogiques: formData.get('moyens_pedagogiques') as string,
      pre_requis: formData.get('pre_requis') as string,
      delai_acces: formData.get('delai_acces') as string,
      supports_pedagogiques: formData.get('supports_pedagogiques') as string,
      methodes_evaluation: formData.get('methodes_evaluation') as string,
      accessible: formData.get('accessible') === 'true',
      taux_tva: parseFloat(formData.get('taux_tva') as string),
      welcomeBooklet: file ? file : null,
    };
    onSave(newFormation);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl p-4">
        <div className="border-b border-gray-200 flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Ajouter une formation</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  name="titre"
                  className="mt-1 input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  className="mt-1 input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Durée (heures)</label>
                <input
                  type="number"
                  name="duree_heures"
                  className="mt-1 input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre max de participants</label>
                <input
                  type="number"
                  name="nb_participants_max"
                  className="mt-1 input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  name="type_formation"
                  className="mt-1 input-field w-full"
                  required
                >
                  <option value="intra">Intra</option>
                  <option value="distanciel">Distanciel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Accessible</label>
                <select
                  name="accessible"
                  className="mt-1 input-field w-full"
                  required
                >
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
                <input
                  type="number"
                  name="prix_unitaire_ht"
                  className="mt-1 input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Taux de TVA (%)</label>
                <input
                  type="number"
                  name="taux_tva"
                  className="mt-1 input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                <select
                  name="categorie"
                  className="mt-1 input-field w-full"
                  required
                >
                  <option value="administrateur">Administrateur</option>
                  <option value="utilisateur">Utilisateur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sur plusieurs jours</label>
                <select
                  name="multi_jour"
                  className="mt-1 input-field w-full"
                  required
                >
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cible</label>
                <input
                  type="text"
                  name="cible"
                  className="mt-1 input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Moyens pédagogiques</label>
                <input
                  type="text"
                  name="moyens_pedagogiques"
                  className="mt-1 input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prérequis</label>
                <input
                  type="text"
                  name="pre_requis"
                  className="mt-1 input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Délais d'accès</label>
                <input
                  type="text"
                  name="delai_acces"
                  className="mt-1 input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Supports pédagogiques</label>
                <input
                  type="text"
                  name="supports_pedagogiques"
                  className="mt-1 input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Méthodes d'évaluation</label>
                <input
                  type="text"
                  name="methodes_evaluation"
                  className="mt-1 input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Livret d'accueil (PDF)
                </label>
                {file ? (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex justify-center px-6 pt-2 pb-2 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-10 w-10 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                        >
                          <span>Téléverser un fichier</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".pdf"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF jusqu'à 10MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-6">
              <label className="block text-sm font-medium text-gray-700">Programme</label>
              <ReactQuill
                value={programme}
                onChange={setProgramme}
                className="mt-1 input-field w-full quill-container full-height-editor no-scrollbar"
                modules={quillModules}
                formats={quillFormats}
              />
            </div>
          </div>
          <div className="border-t border-gray-200 flex justify-end items-center pt-2">
            <button type="submit" className="btn-primary">
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModal;
