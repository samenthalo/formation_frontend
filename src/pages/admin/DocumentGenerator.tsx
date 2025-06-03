import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FileText, Download, Send, X, CheckCircle, RefreshCw, Save } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AttestationFormation from './AttestationFormation';

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

const generateTemplateWithVariables = () => {
  return `<h1>Template de Convention de Formation</h1>
<p>Ceci est un template pour une convention de formation.</p>
<ul>
  <li>L'organisme de formation : <strong>(nomOrganisme)</strong></li>
  <li>Situé : <strong>(adresseOrganisme)</strong></li>
  <li>Déclaration d'activité n° <strong>(declarationActivite)</strong>, Numéro SIRET : <strong>(siretOrganisme)</strong></li>
  <li>Représenté par : <strong>(representantOrganisme)</strong></li>
  <li>Et la société bénéficiaire : <strong>(nomSocieteBeneficiaire)</strong></li>
  <li>Située : <strong>(adresseSocieteBeneficiaire)</strong></li>
  <li>Numéro SIRET : <strong>(siretSocieteBeneficiaire)</strong></li>
  <li>Représentée par : <strong>(representantSocieteBeneficiaire)</strong></li>
</ul>
<p>En exécution de la présente convention, l'organisme de formation s'engage à mettre en œuvre à l'attention des employés de l’entreprise (nomSocieteBeneficiaire) un programme de formation, d'accompagnement et de maîtrise de la solution (nomFormation).</p>
<p>L'action de formation entre dans l'une des catégories prévues à l'article L6313-1 du code du travail. À savoir celle figurant à l'alinéa 2° : «Les actions d'adaptation et de développement des compétences des salariés. Elles ont pour objet de favoriser l'adaptation des salariés à leur poste de travail, à l'évolution des emplois, ainsi que leur maintien dans l'emploi, et de participer au développement des compétences des salariés »</p>
<h3>Session de formation</h3>
<p>Type d'action de formation (art. L6313-1 du code du travail): <strong>(typeActionFormation)</strong>.</p>
<p>(modaliteFormation)</p>
<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Intitulé de la formation</th>
      <th>Durée (heures)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>(jour_0)</td>
      <td>Formation (nomFormation)</td>
      <td><strong>(duree_0)</strong></td>
    </tr>
  </tbody>
</table>
<h2>2. Programme de la formation</h2>
<p>La description détaillée du programme de formation est fournie en annexe.</p>
<h2>3. Engagement de participation à l'action de formation</h2>
<p>Le bénéficiaire s'engage à assurer la présence des salariés de l'entreprise (nomSocieteBeneficiaire) aux dates prévues ci-dessus.</p>
<p>Liste des participants à la formation (nomFormation)</p>
<table>
  <thead>
    <tr>
      <th>Nom & Prénom du participant</th>
      <th>Email</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>(nom_0) (prenom_0)</strong></td>
      <td><strong>(email_0)</strong></td>
    </tr>
  </tbody>
</table>
<h2>4. Prix de la formation</h2>
<p>En contrepartie de cette action de formation, le bénéficiaire (ou le financeur dans le cadre d'une subrogation de paiement) s'acquittera des coûts suivants qui couvrent l'intégralité des frais engagés par l'organisme de formation pour cette session :</p>
<table>
  <thead>
    <tr>
      <th>Description</th>
      <th>Prix HT</th>
      <th>Durée (jours)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Formation (nomFormation)</td>
      <td><strong>(prixFormation)</strong></td>
      <td><strong>(dureeFormation)</strong></td>
    </tr>
  </tbody>
</table>
<h2>5. Modalités de règlement</h2>
<p>Le paiement sera dû en totalité à réception d'une facture émise par l'organisme de formation à destination du bénéficiaire. Paiement par virement bancaire ou par chèque.</p>
<h2>6. Moyens pédagogiques et techniques mis en œuvre</h2>
<p>Pour les temps d’animation, un formateur encadre et assure l’apprentissage. Le programme de formation décrit les moyens mis en œuvre pour réaliser techniquement l'action, suivre son exécution et apprécier ses résultats.</p>
<p>Cette formation est accessible aux personnes en situation de handicap. Vivasoft mettra en place des solutions et des moyens organisationnels techniques et humains pour permettre à toute personne en situation de handicap de bénéficier de la formation. Une assistance avec prise en main du logiciel à distance est mise en place si nécessaire.</p>
<h2>7. Moyens permettant d'apprécier les résultats de l'action</h2>
<p>
  ● En amont de la formation :<br/>
  ➔ Recueil des attentes et des objectifs des participants.<br/>
  ● A la fin de la formation<br/>
  ➔ Une enquête interroge le niveau de satisfaction par rapport au déroulement de la formation.<br/>
  ➔ Le responsable pédagogique effectue un test au moyen d’un quiz pour évaluer les compétences et les progrès des participants autour de (nomFormation).
</p>
<h2>8. Non réalisation de la prestation de formation</h2>
<p>En application de l’article L6354-1 du Code du travail, il est convenu entre les signataires de la présente convention, qu’en cas de résiliation de la présente convention par le bénéficiaire ou en cas d'abandon en cours de formation, l’organisme de formation facturera les sommes qu’il aura réellement dépensées ou engagées pour la préparation et/ou la réalisation de l’action de formation.</p>
<p>En application de l’article L.6354-1 du Code du travail, il est convenu entre les signataires de la présente convention, que faute de réalisation totale ou partielle de la prestation de formation, l’organisme prestataire doit rembourser au cocontractant les sommes indûment perçues de ce fait.</p>
<h2>9. Dédommagement, réparation ou dédit</h2>
<p>En cas de renoncement par le bénéficiaire avant le début du programme de formation</p>
<ul>
  <li>Dans un délai supérieur à 1 mois avant le début de la formation : 50% du coût de la formation est dû.</li>
  <li>Dans un délai compris entre 1 mois et 2 semaines avant le début de la formation : 70 % du coût de la formation est dû.</li>
  <li>Dans un délai inférieur à 2 semaines avant le début de la formation : 100 % du coût de la formation est dû.</li>
  <li>Le coût ne pourra faire l’objet d’une demande de remboursement ou de prise en charge par l'OPCA.</li>
</ul>
<h2>10. Litiges</h2>
<p>Si une contestation ou un différend s’élève à l’occasion de l’exécution de la convention, la partie insatisfaite adressera à l’autre partie un courrier recommandé avec A/R décrivant les difficultés rencontrées. À compter de la réception de ce courrier, l’autre partie à la convention aura un délai de 15 jours pour répondre par recommandé avec A/R. En l’absence de réponse ou en cas de désaccord persistant, chaque partie pourra saisir le juge compétent.</p>
<h2>11. Annexes</h2>
<p>Sont annexés à cette convention :</p>
<ul>
  <li>Un programme de la formation</li>
</ul>
<p>Document réalisé en 2 exemplaires à Marssac-sur-Tarn, le (dateLieu)</p>
<p>Pour l'organisme de formation :</p>
<p><strong>(nomOrganisme)</strong></p>
<p><strong>(representantOrganisme)</strong></p>
<p>Pour la société bénéficiaire</p>
<p><strong>(nomSocieteBeneficiaire)</strong></p>
<p><strong>(representantSocieteBeneficiaire)</strong></p>`;
};

const DocumentGenerator = () => {
  const today = new Date().toISOString().split('T')[0];

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
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [editorHtml, setEditorHtml] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [idSessionFormation, setIdSessionFormation] = useState<string | null>(null);
  const [emailDetails, setEmailDetails] = useState({
    to: '',
    subject: '',
    message: '',
  });

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
        console.error('Erreur lors de la récupération des données de préremplissage:', error);
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
      template: `<h1>Template de Convention de Formation</h1><p>Ceci est un template pour une convention de formation.</p>`
    },
    {
      id: 'attestation',
      name: 'Attestation de fin de formation',
      description: 'Certificat de réussite pour les participants',
      icon: FileText,
      template: `<h1>Template d'Attestation de Formation</h1><p>Ceci est un template pour une attestation de formation.</p>`
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await axios.post(`http://localhost:8000/convention/create/${idSessionFormation}`, customFields);

      if (response.status === 201) {
        toast.success('Document généré et enregistré avec succès!');
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

  const handleSave = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/convention/create/${idSessionFormation}`, customFields);

      if (response.status === 201) {
        toast.success('Document sauvegardé avec succès!');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du document.');
    }
  };

  const handleSendEmail = async () => {
    try {
      await axios.post('http://localhost:8000/email/send', emailDetails);
      toast.success('Email envoyé avec succès!');
      setShowEmailModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email.');
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
          scale: 2,
        });

        const imgData = canvas.toDataURL('image/png');

        if (imgData === 'data:,') {
          throw new Error('Canvas did not generate image data');
        }

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(pdfUrl);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        if (input) {
          input.style.display = 'none';
        }
      }
    }
  };

  const selectedDocumentType = documentTypes.find(type => type.id === selectedType);

  return (
    <div className="space-y-6">
      <ToastContainer />
      <h1 className="text-3xl font-bold">Générateur de Documents</h1>

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
                onClick={() => {
                  setEditorHtml(generateTemplateWithVariables());
                  setShowTemplateModal(true);
                }}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Voir le template</span>
              </button>
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

      <div id="document-content" style={{ display: 'none' }}>
        <div style={{ width: '100%', minHeight: '100vh', margin: '0', padding: '20px', boxSizing: 'border-box', fontSize: '16pt' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '20px', top: '20px' }}>
              <img
                src="../../../../public/uploads/logo.png"
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

          <p style={{ fontSize: '16pt' }}>Pour l'organisme de formation :</p>
          <p style={{ fontSize: '16pt' }}><strong>{customFields.nomOrganisme}</strong></p>
          <p style={{ fontSize: '16pt' }}><strong>{customFields.representantOrganisme}</strong></p>

          <p style={{ fontSize: '16pt' }}>Pour la société bénéficiaire</p>

          <p style={{ fontSize: '16pt' }}><strong>{customFields.nomSocieteBeneficiaire}</strong></p>
          <p style={{ fontSize: '16pt' }}><strong>{customFields.representantSocieteBeneficiaire}</strong></p>
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
            <a href={pdfUrl} download="document.pdf" className="btn-primary">
              Télécharger le PDF
            </a>
            <button
              type="button"
              className="btn-primary"
              onClick={handleSave}
            >
              Sauvegarder la convention
            </button>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-5/6 flex flex-col">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Template de {selectedDocumentType?.name}
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setShowTemplateModal(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex-grow overflow-y-auto">
                <div className="h-full">
                  <ReactQuill
                    value={editorHtml}
                    onChange={setEditorHtml}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                        ['link', 'image'],
                        ['clean']
                      ],
                    }}
                    className="h-full"
                    style={{ height: '600px', width: '100%' }}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  className="btn-primary flex items-center space-x-2"
                  onClick={() => {
                    setShowTemplateModal(false);
                  }}
                >
                  <Save className="h-4 w-4" />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destinataire</label>
                  <input
                    type="email"
                    value={emailDetails.to}
                    onChange={(e) => setEmailDetails({ ...emailDetails, to: e.target.value })}
                    className="input-field"
                    placeholder="Email du destinataire"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Objet</label>
                  <input
                    type="text"
                    value={emailDetails.subject}
                    onChange={(e) => setEmailDetails({ ...emailDetails, subject: e.target.value })}
                    className="input-field"
                    placeholder="Objet de l'email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={emailDetails.message}
                    onChange={(e) => setEmailDetails({ ...emailDetails, message: e.target.value })}
                    className="input-field"
                    placeholder="Message"
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
