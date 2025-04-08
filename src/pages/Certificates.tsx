import React, { useState } from 'react';
import { Award, Download, Search, Eye, Calendar, CheckCircle } from 'lucide-react';

interface Certificate {
  id: number;
  title: string;
  formation: string;
  date: string;
  type: 'Formation' | 'Module';
  status: 'completed' | 'pending' | 'generating';
  progress: number;
  skills: string[];
  instructor: string;
  duration: string;
  certificationNumber: string;
}

const Certificates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const certificates: Certificate[] = [
    {
      id: 1,
      title: 'Attestation de fin de formation React',
      formation: 'Formation React Avancé',
      date: '15 mars 2024',
      type: 'Formation',
      status: 'completed',
      progress: 100,
      skills: [
        'Maîtrise des React Hooks',
        'Gestion d\'état avancée',
        'Performance et optimisation',
        'Tests unitaires avec Jest'
      ],
      instructor: 'Sophie Bernard',
      duration: '35 heures',
      certificationNumber: 'CERT-2024-001'
    },
    {
      id: 2,
      title: 'Certificat JavaScript Moderne',
      formation: 'JavaScript Moderne',
      date: '10 mars 2024',
      type: 'Module',
      status: 'completed',
      progress: 100,
      skills: [
        'ES6+ et nouvelles fonctionnalités',
        'Programmation asynchrone',
        'Modules et bundlers',
        'Bonnes pratiques'
      ],
      instructor: 'Marc Dubois',
      duration: '28 heures',
      certificationNumber: 'CERT-2024-002'
    },
    {
      id: 3,
      title: 'Attestation Node.js',
      formation: 'Node.js Fondamentaux',
      date: '5 mars 2024',
      type: 'Formation',
      status: 'generating',
      progress: 85,
      skills: [
        'Architecture Node.js',
        'Express.js',
        'API REST',
        'Base de données'
      ],
      instructor: 'Jean Martin',
      duration: '21 heures',
      certificationNumber: 'CERT-2024-003'
    }
  ];

  const filteredCertificates = certificates.filter(certificate =>
    certificate.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePreview = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mes Attestations</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher une attestation..."
            className="pl-10 input-field w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertificates.map((certificate) => (
          <div
            key={certificate.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-primary bg-opacity-10 rounded-lg">
                <Award className="h-8 w-8 text-primary" />
              </div>
              {certificate.status === 'completed' && (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handlePreview(certificate)}
                    className="p-2 text-gray-600 hover:text-primary"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-primary">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            <h3 className="text-lg font-medium mb-2">{certificate.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{certificate.formation}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {certificate.date}
              </div>
              {certificate.status === 'completed' ? (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Disponible
                </span>
              ) : certificate.status === 'generating' ? (
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                    <div 
                      className="h-2 bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${certificate.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{certificate.progress}%</span>
                </div>
              ) : (
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  En attente
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Preview Modal */}
      {showPreview && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-8 space-y-6">
              {/* Certificate Header */}
              <div className="text-center border-b border-gray-200 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary bg-opacity-10 rounded-full">
                    <Award className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedCertificate.title}
                </h2>
                <p className="text-lg text-gray-600">
                  {selectedCertificate.formation}
                </p>
              </div>

              {/* Certificate Content */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Formateur</p>
                    <p className="font-medium">{selectedCertificate.instructor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Durée</p>
                    <p className="font-medium">{selectedCertificate.duration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de délivrance</p>
                    <p className="font-medium">{selectedCertificate.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Numéro de certification</p>
                    <p className="font-medium">{selectedCertificate.certificationNumber}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Compétences acquises</h3>
                  <div className="space-y-2">
                    {selectedCertificate.skills.map((skill, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600">
                  <p>Cette attestation certifie que le stagiaire a suivi avec succès la formation</p>
                  <p>et a acquis les compétences mentionnées ci-dessus.</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowPreview(false)}
                  className="btn-secondary"
                >
                  Fermer
                </button>
                <button className="btn-primary flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Télécharger</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Progression globale</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Formation React Avancé</span>
              <span>80%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary rounded-full h-2" style={{ width: '80%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>JavaScript Moderne</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary rounded-full h-2" style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Node.js Fondamentaux</span>
              <span>60%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary rounded-full h-2" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificates;