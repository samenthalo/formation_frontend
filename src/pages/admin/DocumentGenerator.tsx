import React, { useState, useEffect } from 'react';
import { FileText, Download, Send, X, CheckCircle, Save, ArrowLeft } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AttestationFormation from './AttestationFormation';
import ExistingDocuments from './ExistingDocuments';
import signature from '../../assets/signature.png';
import logo from '../../assets/logo.png';


interface Participant {
  nom: string;
  prenom: string;
  email: string;
}

interface DateSession {
  jour: string;
  heureDebut: string;
  heureFin: string;
}

const calculateSessionDuration = (startTime: string, endTime: string) => {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  const diff = end.getTime() - start.getTime();
  return diff / (1000 * 60 * 60);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const calculateDuration = (datesSessions: DateSession[]) => {
  const uniqueDays = new Set(datesSessions.map(session => session.jour));
  return uniqueDays.size;
};

const generateRandomString = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const DocumentGenerator = () => {
  const today = new Date().toISOString().split('T')[0];
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const [selectedType, setSelectedType] = useState<string>('');
  const [customFields, setCustomFields] = useState({
    nomOrganisme: 'VIVASOFT',
    adresseOrganisme: '13 AVENUE DE LA PELATIE 81150 MARSSAC-SUR-TARN',
    declarationActivite: '76810170881',
    siretOrganisme: '80511483200027',
    representantOrganisme: 'M. Christian Pompier',
    nomSocieteBeneficiaire: '',
    adresseSocieteBeneficiaire: '',
    siretSocieteBeneficiaire: '',
    representantSocieteBeneficiaire: '',
    dureeFormation: '',
    typeActionFormation: '',
    modaliteFormation: 'présentiel',
    programmeFormation: '',
    participants: [] as Participant[],
    prixFormation: '',
    modalitesReglement: '',
    dateLieu: today,
    nomFormation: '',
    datesSessions: [] as DateSession[],
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [idSessionFormation, setIdSessionFormation] = useState<string | null>(null);
  const [emailDetails, setEmailDetails] = useState({
    to: '',
    subject: '',
    message: '',
  });
  const [viewMode, setViewMode] = useState<'generator' | 'documents'>('generator');

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const idSession = queryParams.get('id_session');
    setIdSessionFormation(idSession);

    const fetchPrefillData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/convention/prefill/${idSession}`);
        const data = response.data;

        setCustomFields(prevState => ({
          ...prevState,
          nomFormation: data.titreFormation || '',
          dureeFormation: data.dureeHeures || '',
          dateLieu: data.lieuSession || today,
          participants: data.participants || [],
          datesSessions: data.creneaux || [],
          prixFormation: data.prixFormation || '',
        }));
      } catch (error) {
        console.error('Error fetching prefill data:', error);
        if (axios.isAxiosError(error)) {
          console.error('Response data:', error.response?.data);
          console.error('Response status:', error.response?.status);
          console.error('Response headers:', error.response?.headers);
        }
      }
    };

    if (idSession) {
      fetchPrefillData();
    }
  }, [today]);

  const documentTypes = [
    {
      id: 'convention',
      name: 'Convention de formation',
      description: 'Document officiel établissant les termes de la formation',
      icon: FileText,
    },
    {
      id: 'attestation',
      name: 'Attestation de fin de formation',
      description: 'Certificat de réussite pour les participants',
      icon: FileText,
    },
  ];

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsGenerating(true);

  try {
    const generatedPdfBlob = await generatePDF();
    if (generatedPdfBlob) {
      setPdfBlob(generatedPdfBlob);
      toast.success('Document généré et sauvegardé avec succès !');
      await handleSaveAndDownload();
      setShowEmailModal(true);
      setCustomFields({
        nomOrganisme: 'VIVASOFT',
        adresseOrganisme: '13 AVENUE DE LA PELATIE 81150 MARSSAC-SUR-TARN',
        declarationActivite: '76810170881',
        siretOrganisme: '80511483200027',
        representantOrganisme: 'M. Christian Pompier',
        nomSocieteBeneficiaire: '',
        adresseSocieteBeneficiaire: '',
        siretSocieteBeneficiaire: '',
        representantSocieteBeneficiaire: '',
        dureeFormation: '',
        typeActionFormation: '',
        modaliteFormation: 'présentiel',
        programmeFormation: '',
        participants: [],
        prixFormation: '',
        modalitesReglement: '',
        dateLieu: today,
        nomFormation: '',
        datesSessions: [],
      });
    }
  } catch (error) {
    console.error('Erreur lors de la génération:', error);
    toast.error('Erreur lors de la génération du document.');
  } finally {
    setIsGenerating(false);
  }
};


  const generateFileName = () => {
    const { nomSocieteBeneficiaire, nomFormation, dateLieu } = customFields;
    const formattedDate = formatDate(dateLieu).replace(/\//g, '-');
    return `Convention_${nomSocieteBeneficiaire}_${nomFormation}_${formattedDate}.pdf`;
  };

  const handleSaveAndDownload = async () => {
    const pdfBlob = await generatePDF();
    if (pdfBlob) {
      const fileName = generateFileName();

      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const formData = new FormData();
      formData.append('file', pdfBlob, fileName);
      formData.append('sessionId', idSessionFormation || '');

      try {
        await uploadPDF(formData);
        toast.success('Document téléchargé et sauvegardé avec succès!');
      } catch (error) {
        console.error('Error uploading PDF:', error);
        toast.error('Erreur lors de la sauvegarde du document.');
      }
    }
  };

const handleSendEmail = async () => {
  const recipientName = `${emailDetails.firstName} ${emailDetails.lastName}`.trim();

  const initialData = {
    requests: {
      request_name: `Convention de formation`,
      description: "Signature de la convention de stage entre le responsable et l'organisme d'accueil",
      is_sequential: true,
      actions: [
        {
          action_type: "SIGN",
          recipient_email: emailDetails.to,
          recipient_name: recipientName,
          signing_order: 0,
          verify_recipient: false,
          verification_type: "EMAIL",
          private_notes: "Responsable entreprise - signature requise"
        }
      ],
      expiration_days: 10,
      email_reminders: true,
      reminder_period: 2,
      notes: "Merci de signer cette convention pour finaliser la mise en place de la formation."
    }
  };

  if (!pdfBlob) {
    console.error('Aucun PDF Blob disponible');
    toast.error('Aucun PDF disponible à envoyer.');
    return;
  }

  const formData = new FormData();
  formData.append('data', JSON.stringify(initialData));
  formData.append('file', pdfBlob, 'convention.pdf');

  try {
    // Envoyer la requête initiale pour créer la demande de signature
    const initialResponse = await axios.post('http://localhost:8000/zoho/request', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Réponse initiale :', initialResponse.data);

    // Vérifier si initialResponse.data est défini
    if (!initialResponse.data) {
      throw new Error('Aucune donnée reçue dans la réponse initiale.');
    }

    // Récupérer les identifiants nécessaires de la réponse initiale
    const { requests, status } = initialResponse.data;

    if (status !== 'success') {
      throw new Error(`La requête a échoué avec le statut : ${status}`);
    }

    // Vérifier si les requêtes et le tableau d'actions sont définis et non vides
    if (!requests || !requests.actions || requests.actions.length === 0) {
      throw new Error('Aucune action trouvée dans la réponse initiale.');
    }

    const { actions, document_ids } = requests;
    const action_id = actions[0].action_id;
    const document_id = document_ids[0].document_id; // Ajuster en fonction de la structure réelle

    // Données pour la mise à jour
    const updateData = {
      requests: [
        {
          request_name: `Convention de formation`,
          actions: [
            {
              action_id: action_id,
              recipient_name: recipientName,
              recipient_email: emailDetails.to,
              action_type: "SIGN",
              fields: {
                image_fields: [
                  {
                    field_name: "Signature1",
                    field_label: "Signature",
                    field_type_name: "Signature",
                    document_id: document_id,
                    action_id: action_id,
                    is_mandatory: true,
                    x_coord: 350,
                    y_coord: 620,
                    abs_width: 200,
                    abs_height: 50,
                    page_no: 1,
                    description_tooltip: "Placez votre signature ici",
                    is_resizable: true,
                    is_draggable: true
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    // Créer FormData pour la requête de mise à jour
    const updateFormData = new FormData();
    updateFormData.append('data', JSON.stringify(updateData));

    // Envoyer la requête de mise à jour en utilisant FormData
    const updateResponse = await axios.post(`http://localhost:8000/zoho/request/${requests.request_id}`, updateFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Troisième étape : Soumettre la demande de signature
    const submitResponse = await axios.post(`http://localhost:8000/zoho/request/${requests.request_id}/submit`);

    if (submitResponse.data.status !== 'success') {
      throw new Error('Échec de la soumission de la demande de signature.');
    }

    toast.success('Demande de signature envoyée avec succès !');
    setShowEmailModal(false);
  } catch (error) {
    console.error('Erreur :', error);
    toast.error('Erreur lors de l\'envoi, de la mise à jour ou de la soumission de la demande de signature.');
  }
};



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFields(prev => ({ ...prev, programmeFormation: file.name }));
    }
  };

  const handleAddParticipant = () => {
    setCustomFields(prev => ({
      ...prev,
      participants: [...prev.participants, { nom: '', prenom: '', email: '' }]
    }));
  };

  const handleParticipantChange = (index: number, field: keyof Participant, value: string) => {
    const newParticipants = [...customFields.participants];
    newParticipants[index][field] = value;
    setCustomFields(prev => ({
      ...prev,
      participants: newParticipants
    }));
  };

  const handleAddDateSession = () => {
    setCustomFields(prev => ({
      ...prev,
      datesSessions: [...prev.datesSessions, { jour: today, heureDebut: '', heureFin: '' }]
    }));
  };

  const handleDateSessionChange = (index: number, field: keyof DateSession, value: string) => {
    const newDatesSessions = [...customFields.datesSessions];
    newDatesSessions[index][field] = value;
    setCustomFields(prev => ({
      ...prev,
      datesSessions: newDatesSessions
    }));
  };

const generatePDF = async () => {
  const input = document.getElementById('document-content');

  if (input) {
    try {
      input.style.display = 'block';

      const canvas = await html2canvas(input, {
        useCORS: true,
        logging: true,
        allowTaint: true,
        scale: 2.5, // Réduisez légèrement l'échelle pour diminuer la taille du fichier
        quality: 0.9, // Ajustez la qualité pour un compromis taille/qualité
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9); // Utilisez JPEG avec une qualité légèrement réduite

      if (imgData === 'data:,') {
        throw new Error('Canvas did not generate image data');
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compression: true, // Activez la compression avec un niveau modéré
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);

      return pdfBlob;
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      if (input) {
        input.style.display = 'none';
      }
    }
  }
};



  const uploadPDF = async (formData: FormData) => {
    try {
      const response = await axios.post('http://localhost:8000/convention/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.message) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      toast.error('Erreur lors de l\'upload du PDF.');
    }
  };

  const selectedDocumentType = documentTypes.find(type => type.id === selectedType);

  return (
    <div className="space-y-6">
      {viewMode === 'generator' ? (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Générateur de Documents</h1>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setViewMode('documents')}
            >
              Voir les Documents Existants
            </button>
          </div>

          <ToastContainer />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documentTypes.map((type) => (
              <div
                key={type.id}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all ${
                  selectedType === type.id ? 'ring-2 ring-primary' : 'hover:shadow-lg'
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

          {selectedType === 'attestation' && (
            <AttestationFormation
              customFields={customFields}
              setCustomFields={setCustomFields}
              handleSubmit={handleSubmit}
              isGenerating={isGenerating}
            />
          )}

          {selectedType === 'convention' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'organisme de formation
                    </label>
                    <input
                      type="text"
                      value={customFields.nomOrganisme}
                      onChange={(e) =>
                        setCustomFields({ ...customFields, nomOrganisme: e.target.value })
                      }
                      className="input-field"
                      placeholder="Nom de l'organisme de formation"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse de l'organisme de formation
                    </label>
                    <input
                      type="text"
                      value={customFields.adresseOrganisme}
                      onChange={(e) =>
                        setCustomFields({ ...customFields, adresseOrganisme: e.target.value })
                      }
                      className="input-field"
                      placeholder="Adresse de l'organisme de formation"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Déclaration d'activité
                    </label>
                    <input
                      type="text"
                      value={customFields.declarationActivite}
                      onChange={(e) =>
                        setCustomFields({ ...customFields, declarationActivite: e.target.value })
                      }
                      className="input-field"
                      placeholder="Déclaration d'activité"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro SIRET de l'organisme de formation
                    </label>
                    <input
                      type="text"
                      value={customFields.siretOrganisme}
                      onChange={(e) =>
                        setCustomFields({ ...customFields, siretOrganisme: e.target.value })
                      }
                      className="input-field"
                      placeholder="Numéro SIRET de l'organisme de formation"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Représentant de l'organisme de formation
                    </label>
                    <input
                      type="text"
                      value={customFields.representantOrganisme}
                      onChange={(e) =>
                        setCustomFields({ ...customFields, representantOrganisme: e.target.value })
                      }
                      className="input-field"
                      placeholder="Représentant de l'organisme de formation"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de la société bénéficiaire
                    </label>
                    <input
                      type="text"
                      value={customFields.nomSocieteBeneficiaire}
                      onChange={(e) =>
                        setCustomFields({ ...customFields, nomSocieteBeneficiaire: e.target.value })
                      }
                      className="input-field"
                      placeholder="Nom de la société bénéficiaire"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse de la société bénéficiaire
                    </label>
                    <input
                      type="text"
                      value={customFields.adresseSocieteBeneficiaire}
                      onChange={(e) =>
                        setCustomFields({ ...customFields, adresseSocieteBeneficiaire: e.target.value })
                      }
                      className="input-field"
                      placeholder="Adresse de la société bénéficiaire"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro SIRET de la société bénéficiaire
                    </label>
                    <input
                      type="text"
                      value={customFields.siretSocieteBeneficiaire}
                      onChange={(e) =>
                        setCustomFields({ ...customFields, siretSocieteBeneficiaire: e.target.value })
                      }
                      className="input-field"
                      placeholder="Numéro SIRET de la société bénéficiaire"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Représentant de la société bénéficiaire
                    </label>
                    <input
                      type="text"
                      value={customFields.representantSocieteBeneficiaire}
                      onChange={(e) =>
                        setCustomFields({ ...customFields, representantSocieteBeneficiaire: e.target.value })
                      }
                      className="input-field"
                      placeholder="Représentant de la société bénéficiaire"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de la formation
                    </label>
                    <input
                      type="text"
                      value={customFields.nomFormation}
                      onChange={(e) =>
                        setCustomFields({ ...customFields, nomFormation: e.target.value })
                      }
                      className="input-field"
                      placeholder="Nom de la formation"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée de la formation
                    </label>
                    <input
                      type="text"
                      value={customFields.dureeFormation}
                      onChange={(e) =>
                        setCustomFields({ ...customFields, dureeFormation: e.target.value })
                      }
                      className="input-field"
                      placeholder="Durée de la formation"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type d'action de formation
                    </label>
                    <input
                      type="text"
                      value={customFields.typeActionFormation}
                      onChange={(e) =>
                        setCustomFields({ ...customFields, typeActionFormation: e.target.value })
                      }
                      className="input-field"
                      placeholder="Type d'action de formation"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modalité de formation
                    </label>
                    <select
                      value={customFields.modaliteFormation}
                      onChange={(e) =>
                        setCustomFields({ ...customFields, modaliteFormation: e.target.value })
                      }
                      className="input-field"
                      required
                    >
                      <option value="présentiel">Présentiel</option>
                      <option value="distanciel">Distanciel</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Créneaux
                  </label>
                  {customFields.datesSessions.map((session, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={session.jour}
                          onChange={(e) => handleDateSessionChange(index, 'jour', e.target.value)}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Heure de début
                        </label>
                        <input
                          type="time"
                          value={session.heureDebut}
                          onChange={(e) => handleDateSessionChange(index, 'heureDebut', e.target.value)}
                          className="input-field"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Heure de fin
                        </label>
                        <input
                          type="time"
                          value={session.heureFin}
                          onChange={(e) => handleDateSessionChange(index, 'heureFin', e.target.value)}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-secondary mt-2"
                    onClick={handleAddDateSession}
                  >
                    Ajouter un créneau
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Participants
                  </label>
                  {customFields.participants.map((participant, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom du participant
                        </label>
                        <input
                          type="text"
                          value={participant.nom}
                          onChange={(e) => handleParticipantChange(index, 'nom', e.target.value)}
                          className="input-field"
                          placeholder="Nom du participant"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom du participant
                        </label>
                        <input
                          type="text"
                          value={participant.prenom}
                          onChange={(e) => handleParticipantChange(index, 'prenom', e.target.value)}
                          className="input-field"
                          placeholder="Prénom du participant"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={participant.email}
                          onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                          className="input-field"
                          placeholder="Email"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-secondary mt-2"
                    onClick={handleAddParticipant}
                  >
                    Ajouter un participant
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix de la formation
                    </label>
                    <input
                      type="text"
                      value={customFields.prixFormation}
                      onChange={(e) =>
                        setCustomFields({ ...customFields, prixFormation: e.target.value })
                      }
                      className="input-field"
                      placeholder="Prix de la formation"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={customFields.dateLieu}
                    onChange={(e) =>
                      setCustomFields({ ...customFields, dateLieu: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Programme de formation
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="programmeFormation"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/90"
                        >
                          <span>Téléverser un fichier</span>
                          <input
                            id="programmeFormation"
                            name="programmeFormation"
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
                  {customFields.programmeFormation && (
                    <p className="mt-2 text-sm text-gray-600">
                      Fichier sélectionné : {customFields.programmeFormation}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="btn-secondary flex items-center space-x-2"
                    onClick={generatePDF}
                  >
                    <Download className="h-4 w-4" />
                    <span>Prévisualisation PDF</span>
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
        </>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Documents Existants</h1>
            <button
              type="button"
              className="btn-secondary flex items-center space-x-2"
              onClick={() => setViewMode('generator')}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour au Générateur</span>
            </button>
          </div>
          <ExistingDocuments />
        </div>
      )}

      <div id="document-content" style={{ display: 'none' }}>
        <div style={{ width: '100%', minHeight: '100vh', margin: '0', padding: '20px', boxSizing: 'border-box', fontSize: '16pt' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '20px', top: '20px' }}>
              <img
                src={logo}
                alt="Logo"
                style={{ width: '150px', height: 'auto', display: 'block' }}
              />

            </div>
            <h1 style={{ margin: 0, color: '#5fa7f1', fontSize: '18pt' }}>Convention de formation - <strong>{customFields.nomSocieteBeneficiaire}</strong></h1>
          </div>

          <p style={{ textAlign: 'center', fontSize: '16pt' }}>(Articles L.6353-1 et L.6353-2 du code du travail)</p>

          <ul style={{ marginLeft: '20px', fontSize: '16pt' }}>
            <li>L'organisme de formation : <strong>{customFields.nomOrganisme}</strong></li>
            <li>Situé : <strong>{customFields.adresseOrganisme}</strong></li>
            <li>Déclaration d'activité n° <strong>{customFields.declarationActivite}</strong>, Numéro SIRET : <strong>{customFields.siretOrganisme}</strong></li>
            <li>Représenté par : <strong>{customFields.representantOrganisme}</strong></li>
            <li>Et la société bénéficiaire : <strong>{customFields.nomSocieteBeneficiaire}</strong></li>
            <li>Située : <strong>{customFields.adresseSocieteBeneficiaire}</strong></li>
            <li>Numéro SIRET : <strong>{customFields.siretSocieteBeneficiaire}</strong></li>
            <li>Représentée par : <strong>{customFields.representantSocieteBeneficiaire}</strong></li>
          </ul>

          <h2 style={{ marginTop: '20px', color: '#5fa7f1', fontSize: '20pt' }}>1. Objet, nature et durée de la formation</h2>

          <p style={{ fontSize: '16pt' }}>
            En exécution de la présente convention, l'organisme de formation s'engage à mettre en œuvre à l'attention des employés de l’entreprise <strong>{customFields.nomSocieteBeneficiaire}</strong> un programme de formation, d'accompagnement et de maîtrise de la solution <strong>{customFields.nomFormation}</strong>.
          </p>

          <p style={{ fontSize: '16pt' }}>L'action de formation entre dans l'une des catégories prévues à l'article L6313-1 du code du travail. À savoir celle figurant à l'alinéa 2° : «Les actions d'adaptation et de développement des compétences des salariés. Elles ont pour objet de favoriser l'adaptation des salariés à leur poste de travail, à l'évolution des emplois, ainsi que leur maintien dans l'emploi, et de participer au développement des compétences des salariés »</p>

          <h3 style={{ marginTop: '20px', color: '#5fa7f1', fontSize: '18pt' }}>Session de formation</h3>

          <p style={{ fontSize: '16pt' }}>Type d'action de formation (art. L6313-1 du code du travail): <strong>{customFields.typeActionFormation}</strong>.</p>

          <p style={{ fontSize: '16pt' }}><strong>{customFields.modaliteFormation}</strong></p>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '16pt' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Date</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Intitulé de la formation</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Durée (heures)</th>
              </tr>
            </thead>
            <tbody>
              {customFields.datesSessions.map((session, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{formatDate(session.jour)}</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>Formation {customFields.nomFormation}</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    <strong>{calculateSessionDuration(session.heureDebut, session.heureFin)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ marginTop: '20px', color: '#5fa7f1', fontSize: '20pt' }}>2. Programme de la formation</h2>

          <p style={{ fontSize: '16pt' }}>La description détaillée du programme de formation est fournie en annexe.</p>

          <h2 style={{ marginTop: '20px', color: '#5fa7f1', fontSize: '20pt' }}>3. Engagement de participation à l'action de formation</h2>

          <p style={{ fontSize: '16pt' }}>Le bénéficiaire s'engage à assurer la présence des salariés de l'entreprise <strong>{customFields.nomSocieteBeneficiaire}</strong> aux dates prévues ci-dessus.</p>

          <p style={{ fontSize: '16pt' }}>Liste des participants à la formation {customFields.nomFormation}</p>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '16pt' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Nom & Prénom du participant</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Email</th>
              </tr>
            </thead>
            <tbody>
              {customFields.participants.map((participant, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #000', padding: '8px' }}><strong>{participant.nom} {participant.prenom}</strong></td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}><strong>{participant.email}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ marginTop: '20px', color: '#5fa7f1', fontSize: '20pt' }}>4. Prix de la formation</h2>

          <p style={{ fontSize: '16pt' }}>En contrepartie de cette action de formation, le bénéficiaire (ou le financeur dans le cadre d'une subrogation de paiement) s'acquittera des coûts suivants qui couvrent l'intégralité des frais engagés par l'organisme de formation pour cette session :</p>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '16pt' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Description</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Prix HT</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Durée (jours)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px' }}>Formation {customFields.nomFormation}</td>
                <td style={{ border: '1px solid #000', padding: '8px' }}><strong>{customFields.prixFormation}</strong></td>
                <td style={{ border: '1px solid #000', padding: '8px' }}><strong>{calculateDuration(customFields.datesSessions)}</strong></td>
              </tr>
            </tbody>
          </table>

          <h2 style={{ marginTop: '20px', color: '#5fa7f1', fontSize: '20pt' }}>5. Modalités de règlement</h2>

          <p style={{ fontSize: '16pt' }}>Le paiement sera dû en totalité à réception d'une facture émise par l'organisme de formation à destination du bénéficiaire. Paiement par virement bancaire ou par chèque.</p>

          <h2 style={{ marginTop: '20px', color: '#5fa7f1', fontSize: '20pt' }}>6. Moyens pédagogiques et techniques mis en œuvre</h2>

          <p style={{ fontSize: '16pt' }}>Pour les temps d’animation, un formateur encadre et assure l’apprentissage. Le programme de formation décrit les moyens mis en œuvre pour réaliser techniquement l'action, suivre son exécution et apprécier ses résultats.</p>
          <p style={{ fontSize: '16pt' }}>Cette formation est accessible aux personnes en situation de handicap. Vivasoft mettra en place des solutions et des moyens organisationnels techniques et humains pour permettre à toute personne en situation de handicap de bénéficier de la formation. Une assistance avec prise en main du logiciel à distance est mise en place si nécessaire.</p>

          <h2 style={{ marginTop: '20px', color: '#5fa7f1', fontSize: '20pt' }}>7. Moyens permettant d'apprécier les résultats de l'action</h2>

          <p style={{ fontSize: '16pt' }}>
            ● En amont de la formation :<br/>
            ➔ Recueil des attentes et des objectifs des participants.<br/>
            ● A la fin de la formation<br/>
            ➔ Une enquête interroge le niveau de satisfaction par rapport au déroulement de la formation.<br/>
            ➔ Le responsable pédagogique effectue un test au moyen d’un quiz pour évaluer les compétences et les progrès des participants autour de {customFields.nomFormation}.
          </p>

          <h2 style={{ marginTop: '20px', color: '#5fa7f1', fontSize: '20pt' }}>8. Non réalisation de la prestation de formation</h2>

          <p style={{ fontSize: '16pt' }}>En application de l’article L6354-1 du Code du travail, il est convenu entre les signataires de la présente convention, qu’en cas de résiliation de la présente convention par le bénéficiaire ou en cas d'abandon en cours de formation, l’organisme de formation facturera les sommes qu’il aura réellement dépensées ou engagées pour la préparation et/ou la réalisation de l’action de formation.</p>
          <p style={{ fontSize: '16pt' }}>En application de l’article L.6354-1 du Code du travail, il est convenu entre les signataires de la présente convention, que faute de réalisation totale ou partielle de la prestation de formation, l’organisme prestataire doit rembourser au cocontractant les sommes indûment perçues de ce fait.</p>

          <h2 style={{ marginTop: '20px', color: '#5fa7f1', fontSize: '20pt' }}>9. Dédommagement, réparation ou dédit</h2>

          <p style={{ fontSize: '16pt' }}>En cas de renoncement par le bénéficiaire avant le début du programme de formation</p>
          <ul style={{ marginLeft: '20px', fontSize: '16pt' }}>
            <li>Dans un délai supérieur à 1 mois avant le début de la formation : 50% du coût de la formation est dû.</li>
            <li>Dans un délai compris entre 1 mois et 2 semaines avant le début de la formation : 70 % du coût de la formation est dû.</li>
            <li>Dans un délai inférieur à 2 semaines avant le début de la formation : 100 % du coût de la formation est dû.</li>
            <li>Le coût ne pourra faire l’objet d’une demande de remboursement ou de prise en charge par l'OPCA.</li>
          </ul>

          <h2 style={{ marginTop: '20px', color: '#5fa7f1', fontSize: '20pt' }}>10. Litiges</h2>

          <p style={{ fontSize: '16pt' }}>Si une contestation ou un différend s’élève à l’occasion de l’exécution de la convention, la partie insatisfaite adressera à l’autre partie un courrier recommandé avec A/R décrivant les difficultés rencontrées. À compter de la réception de ce courrier, l’autre partie à la convention aura un délai de 15 jours pour répondre par recommandé avec A/R. En l’absence de réponse ou en cas de désaccord persistant, chaque partie pourra saisir le juge compétent.</p>

          <h2 style={{ marginTop: '20px', color: '#5fa7f1', fontSize: '20pt' }}>11. Annexes</h2>

          <p style={{ fontSize: '16pt' }}>Sont annexés à cette convention :</p>
          <ul style={{ marginLeft: '20px', fontSize: '16pt' }}>
            <li>Un programme de la formation</li>
          </ul>

          <p style={{ fontSize: '16pt' }}>Document réalisé en 2 exemplaires à Marssac-sur-Tarn, le <strong>{formatDate(customFields.dateLieu)}</strong></p>

<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', fontSize: '16pt' }}>
  <div style={{ textAlign: 'center', position: 'relative' }}>
    <p style={{ margin: 0, fontSize: '18pt' }}>
      Pour l'organisme de formation : <strong>{customFields.nomOrganisme}</strong>
    </p>
    <p style={{ margin: 0, fontSize: '18pt' }}>
      <strong>{customFields.representantOrganisme}</strong>
    </p>
    <div style={{ position: 'relative', left: '60px' }}>
      <img
        src={signature}
        alt="Signature Organisme"
        style={{
          width: '250px',
          height: 'auto',
          display: 'block',
          marginTop: '20px',
        }}
      />
    </div>
  </div>

  <div style={{ textAlign: 'center' }}>
    <p style={{ margin: 0 }}>
      Pour la société bénéficiaire : <strong>{customFields.nomSocieteBeneficiaire}</strong>
    </p>
    <p style={{ margin: 0 }}>
      <strong>{customFields.representantSocieteBeneficiaire}</strong>
    </p>
    {/* Suppression du div avec le trait */}
  </div>
</div>


        </div>
      </div>

      {pdfUrl && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Prévisualisation du PDF</h2>
          <iframe
            src={pdfUrl}
            style={{ width: '100%', height: '500px', border: 'none' }}
            title="PDF Preview"
          />
          <div className="mt-4 flex space-x-4">
            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveAndDownload}
            >
              Télécharger et Sauvegarder
            </button>
          </div>
        </div>
      )}

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

      {showEmailModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Envoyer le document par email</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input
              type="text"
              value={emailDetails.lastName}
              onChange={(e) => setEmailDetails({ ...emailDetails, lastName: e.target.value })}
              className="input-field"
              placeholder="Nom"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input
              type="text"
              value={emailDetails.firstName}
              onChange={(e) => setEmailDetails({ ...emailDetails, firstName: e.target.value })}
              className="input-field"
              placeholder="Prénom"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={emailDetails.to}
              onChange={(e) => setEmailDetails({ ...emailDetails, to: e.target.value })}
              className="input-field"
              placeholder="Email du destinataire"
              required
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowEmailModal(false)}
          >
            Annuler
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleSendEmail}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default DocumentGenerator;
