import React, { useState, useEffect } from 'react';
import { Search, Filter, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Document {
  id: number;
  idSession: number;
  title: string;
  description: string;
  type: string;
  date: string;
  cheminFichier: string;
}

const DocumentList = () => {
  const [activeTab, setActiveTab] = useState<'attestations' | 'conventions'>('attestations');
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = activeTab === 'attestations'
          ? 'http://localhost:8000/attestations/all'
          : 'http://localhost:8000/convention/all';

        console.log(`Fetching data from ${endpoint}`);

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Data received:', data);

        const transformedData = data.map((item) => {
          const cheminFichier = activeTab === 'attestations' ? item.chemin_fichier : item.cheminFichier || 'unknown.pdf';
          const fileExtension = cheminFichier.split('.').pop() || 'pdf';
          const fileName = cheminFichier.split('/').pop() || 'unknown.pdf';

          const dateGeneration = activeTab === 'attestations' ? item.date_generation : item.dateGeneration || '2023-01-01 00:00:00';
          const date = new Date(dateGeneration);

          if (isNaN(date.getTime())) {
            console.error(`Invalid date: ${dateGeneration}`);
            return {
              id: item.id,
              idSession: activeTab === 'attestations' ? item.session_id : item.idSession,
              title: fileName,
              description: activeTab === 'attestations' ? item.session_description || `Document ${item.id}` : item.titreSession || `Document ${item.id}`,
              type: fileExtension.toUpperCase(),
              date: new Date('2023-01-01').toLocaleDateString('fr-FR'),
              cheminFichier: cheminFichier,
            };
          }

          return {
            id: item.id,
            idSession: activeTab === 'attestations' ? item.session_id : item.idSession,
            title: fileName,
            description: activeTab === 'attestations' ? item.session_description || `Document ${item.id}` : item.titreSession || `Document ${item.id}`,
            type: fileExtension.toUpperCase(),
            date: date.toLocaleDateString('fr-FR'),
            cheminFichier: cheminFichier,
          };
        });

        setDocuments(transformedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleDelete = async (id: number) => {
    try {
      const endpoint = activeTab === 'attestations'
        ? `http://localhost:8000/attestation/delete/${id}`
        : `http://localhost:8000/convention/delete/${id}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete the document');
      }

      setDocuments(documents.filter(document => document.id !== id));

      toast.success('Document supprimé avec succès !');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erreur lors de la suppression du document.');
    }
  };

  const filteredDocuments = documents.filter(document =>
    document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    document.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastDocument = currentPage * documentsPerPage;
  const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
  const currentDocuments = filteredDocuments.slice(indexOfFirstDocument, indexOfLastDocument);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-8 p-6">
      <ToastContainer />
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Liste des Documents</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setActiveTab('attestations')}
              className={`px-4 py-2 rounded-md ${activeTab === 'attestations' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Attestations
            </button>
            <button
              onClick={() => setActiveTab('conventions')}
              className={`px-4 py-2 rounded-md ${activeTab === 'conventions' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Conventions
            </button>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher un document..."
                  className="pl-10 border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button className="bg-secondary text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-secondary-dark">
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDocuments.length > 0 ? (
                currentDocuments.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{document.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{document.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{document.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{document.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`http://localhost:8000/${document.cheminFichier}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark mr-3"
                      >
                        Télécharger
                      </a>
                      <button
                        onClick={() => handleDelete(document.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun document trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-between items-center p-4 bg-white border-t border-gray-200">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="ml-2">Précédent</span>
            </button>
            <span className="text-gray-700">
              Page {currentPage} de {Math.ceil(filteredDocuments.length / documentsPerPage)}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredDocuments.length / documentsPerPage)}
              className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              <span className="mr-2">Suivant</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;
