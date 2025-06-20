import React, { useEffect, useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import { FileDown, FileArchive, Mail } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AttestationFormation = ({ isGenerating }) => {
  const [sessionId, setSessionId] = useState(null);
  const [commonFields, setCommonFields] = useState({
    nomRepresentant: 'Pompier',
    prenomRepresentant: 'Christian',
    raisonSocialeDispensateur: 'Vivasoft',
    intituleAction: '',
    natureAction: 'action de formation',
    dateDebut: '',
    dateFin: '',
    duree: '',
    lieu: 'Marssac-sur-Tarn',
    dateSignature: '',
    nomSignataire: '',
    prenomSignataire: '',
    qualiteSignataire: '',
  });

  const [participants, setParticipants] = useState([
    {
      nomBeneficiaire: '',
      prenomBeneficiaire: '',
      raisonSocialeEntreprise: '',
      email: '',
    }
  ]);

const [isModalOpen, setIsModalOpen] = useState(false);
const [emailData, setEmailData] = useState({
  message: 'Bonjour,\n\nVeuillez trouver ci-joint votre attestation de stage, délivrée dans le cadre de la formation que vous avez suivie au sein de notre entreprise, Vivasoft.',
});

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = searchParams.get('id_session');

    console.log('Session ID from URL:', sessionIdFromUrl);

    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl);

      const fetchSessionData = async () => {
        try {
          const response = await fetch(`http://localhost:8000/attestation/generer/${sessionIdFromUrl}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log('Data received from API:', data);

          setCommonFields({
            ...commonFields,
            intituleAction: data.session || '',
            duree: data.duree_heures || '',
            dateDebut: data.creneaux[0]?.jour || '',
            dateFin: data.creneaux[data.creneaux.length - 1]?.jour || '',
          });

          const participantsWithEmails = data.participants.map(participant => ({
            nomBeneficiaire: participant?.nom || '',
            prenomBeneficiaire: participant?.prenom || '',
            raisonSocialeEntreprise: participant?.entreprise || '',
            email: participant?.email || '',
          }));
          console.log('Participants with emails:', participantsWithEmails);
          setParticipants(participantsWithEmails);
        } catch (error) {
          console.error('Error fetching session data:', error);
        }
      };

      fetchSessionData();
    }
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const generatePdf = async (participant) => {
    try {
      const url = '/uploads/attestation_officielle.pdf';
      const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      const imageUrl = 'http://localhost:5173/src/assets/signature.png';
      console.log('Attempting to load image from:', imageUrl);

      let imageBytes;
      try {
        const response = await fetch(imageUrl);
        console.log('Server response:', response);
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        imageBytes = await response.arrayBuffer();
      } catch (error) {
        console.error('Error loading image:', error);
        return null;
      }

      const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
      const fileSignature = new Uint8Array(imageBytes).subarray(0, 8);
      console.log('File signature:', Array.from(fileSignature).map(b => b.toString(16).padStart(2, '0')));

      let image;
      if (pngSignature.every((val, i) => val === fileSignature[i])) {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        try {
          image = await pdfDoc.embedJpg(imageBytes);
        } catch (error) {
          console.error('File is neither a valid PNG nor JPEG:', error);
          return null;
        }
      }

      if (image) {
        firstPage.drawImage(image, {
          x: firstPage.getWidth() - 280,
          y: 98,
          width: 150,
          height: 60,
        });
      }

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 11;
      const color = rgb(0, 0, 0);

      const fields = {
        ...commonFields,
        ...participant,
        dateDebut: formatDate(commonFields.dateDebut),
        dateFin: formatDate(commonFields.dateFin),
        duree: String(commonFields.duree),
        dateSignature: formatDate(commonFields.dateSignature),
      };

      firstPage.drawText(`${fields.prenomRepresentant || ''} ${fields.nomRepresentant || ''}`, {
        x: 250,
        y: 605,
        size: fontSize,
        font,
        color,
      });

      firstPage.drawText(`${fields.nomBeneficiaire || ''} ${fields.prenomBeneficiaire || ''}`, {
        x: 270,
        y: 505,
        size: fontSize,
        font,
        color,
      });

      firstPage.drawText(fields.raisonSocialeEntreprise || '', {
        x: 270,
        y: 487,
        size: fontSize,
        font,
        color,
      });

      firstPage.drawText(fields.raisonSocialeDispensateur || '', {
        x: 110,
        y: 562,
        size: fontSize,
        font,
        color,
      });

      firstPage.drawText(fields.intituleAction || '', {
        x: 190,
        y: 466,
        size: fontSize,
        font,
        color,
      });

      const casesCoords = {
        'action de formation': { x: 80, y: 415 },
        'bilan de compétences': { x: 80, y: 400 },
        'action de VAE': { x: 80, y: 385 },
        'formation apprentissage': { x: 80, y: 370 },
      };

      const caseCoord = casesCoords[fields.natureAction];
      if (caseCoord) {
        firstPage.drawText('X', {
          x: caseCoord.x,
          y: caseCoord.y,
          size: 14,
          font,
          color,
        });
      }

      firstPage.drawText(fields.dateDebut || '', {
        x: 180,
        y: 342,
        size: fontSize,
        font,
        color,
      });

      firstPage.drawText(fields.dateFin || '', {
        x: 300,
        y: 342,
        size: fontSize,
        font,
        color,
      });

      firstPage.drawText(fields.duree || '', {
        x: 180,
        y: 323,
        size: fontSize,
        font,
        color,
      });

      firstPage.drawText(fields.lieu || '', {
        x: 120,
        y: 192,
        size: fontSize,
        font,
        color,
      });

      firstPage.drawText(fields.dateSignature || '', {
        x: 110,
        y: 175,
        size: fontSize,
        font,
        color,
      });

      firstPage.drawText(`${fields.prenomSignataire || ''} ${fields.nomSignataire || ''}`, {
        x: 120,
        y: 395,
        size: fontSize,
        font,
        color,
      });

      firstPage.drawText(fields.qualiteSignataire || '', {
        x: 120,
        y: 380,
        size: fontSize,
        font,
        color,
      });

      const pdfBytes = await pdfDoc.save();
      return pdfBytes;
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  };

  const uploadPdfToServer = async (pdfBytes, fileName) => {
    console.log('Uploading with Session ID:', sessionId);

    if (!sessionId) {
      console.error('Session ID is undefined during upload');
      return;
    }

    const formData = new FormData();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    formData.append('file', blob, fileName);
    formData.append('sessionId', sessionId);

    const dateGeneration = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    formData.append('dateGeneration', dateGeneration);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('File uploaded successfully:', data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const downloadAndUploadPdf = async (pdfBytes, fileName) => {
    await uploadPdfToServer(pdfBytes, fileName);
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  };

  const downloadSinglePdf = async (participant) => {
    if (!commonFields.dateSignature) {
      toast.error('Veuillez renseigner la date de signature avant de télécharger.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const pdfBytes = await generatePdf(participant);
    if (pdfBytes) {
      const fileName = `${participant.nomBeneficiaire}_${participant.prenomBeneficiaire}_attestation.pdf`;
      await downloadAndUploadPdf(pdfBytes, fileName);
    }
  };

  const generateAllPdfs = async () => {
    if (!commonFields.dateSignature) {
      toast.error('Veuillez renseigner la date de signature avant de télécharger.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const zip = new JSZip();

    for (const participant of participants) {
      const pdfBytes = await generatePdf(participant);
      if (pdfBytes) {
        const fileName = `${participant.nomBeneficiaire}_${participant.prenomBeneficiaire}_attestation.pdf`;
        zip.file(fileName, pdfBytes);
        await uploadPdfToServer(pdfBytes, fileName);
      }
    }

    const zipFile = await zip.generateAsync({ type: 'blob' });
    const downloadUrl = URL.createObjectURL(zipFile);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'attestations.zip';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  };

  const handleCommonFieldChange = (field, value) => {
    setCommonFields({ ...commonFields, [field]: value });
  };

  const handleParticipantFieldChange = (index, field, value) => {
    const newParticipants = [...participants];
    newParticipants[index][field] = value;
    setParticipants(newParticipants);
  };

  const handleEmailFieldChange = (field, value) => {
    setEmailData({ ...emailData, [field]: value });
  };

  const sendEmailWithAttachment = async (email, message, pdfBytes, fileName) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('message', message);

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    formData.append('attestation', blob, fileName);

    try {
      const response = await fetch('http://localhost:8000/envoyer-attestation', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('Email sent successfully:', data);
      toast.success('Email envoyé avec succès !');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email.');
    }
  };

  const handleSendSingleEmail = async (participant) => {
    if (!participant.email) {
      console.error(`Email is missing for participant: ${participant.nomBeneficiaire} ${participant.prenomBeneficiaire}`);
      toast.error('Email manquant pour ce participant.');
      return;
    }

    const pdfBytes = await generatePdf(participant);
    if (pdfBytes) {
      const fileName = `${participant.nomBeneficiaire}_${participant.prenomBeneficiaire}_attestation.pdf`;
      await sendEmailWithAttachment(participant.email, emailData.message, pdfBytes, fileName);
    }
  };

  const handleSendEmail = async () => {
    for (const participant of participants) {
      if (!participant.email) {
        console.error(`Email is missing for participant: ${participant.nomBeneficiaire} ${participant.prenomBeneficiaire}`);
        continue;
      }

      const pdfBytes = await generatePdf(participant);
      if (pdfBytes) {
        const fileName = `${participant.nomBeneficiaire}_${participant.prenomBeneficiaire}_attestation.pdf`;
        await sendEmailWithAttachment(participant.email, emailData.message, pdfBytes, fileName);
      }
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Prénom représentant légal</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={commonFields.prenomRepresentant}
              onChange={(e) => handleCommonFieldChange('prenomRepresentant', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom représentant légal</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={commonFields.nomRepresentant}
              onChange={(e) => handleCommonFieldChange('nomRepresentant', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Raison sociale dispensateur</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={commonFields.raisonSocialeDispensateur}
              onChange={(e) => handleCommonFieldChange('raisonSocialeDispensateur', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Intitulé de l'action</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={commonFields.intituleAction}
              onChange={(e) => handleCommonFieldChange('intituleAction', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nature de l'action</label>
            <select
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={commonFields.natureAction}
              onChange={(e) => handleCommonFieldChange('natureAction', e.target.value)}
            >
              <option value="">-- Choisir --</option>
              <option value="action de formation">Action de formation</option>
              <option value="bilan de compétences">Bilan de compétences</option>
              <option value="action de VAE">Action de VAE</option>
              <option value="formation apprentissage">Action de formation par apprentissage</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date début</label>
            <input
              type="date"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={commonFields.dateDebut}
              onChange={(e) => handleCommonFieldChange('dateDebut', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date fin</label>
            <input
              type="date"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={commonFields.dateFin}
              onChange={(e) => handleCommonFieldChange('dateFin', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Durée (ex: 20 heures)</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={commonFields.duree}
              onChange={(e) => handleCommonFieldChange('duree', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Lieu (Fait à)</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={commonFields.lieu}
              onChange={(e) => handleCommonFieldChange('lieu', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date signature</label>
            <input
              type="date"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={commonFields.dateSignature}
              onChange={(e) => handleCommonFieldChange('dateSignature', e.target.value)}
            />
          </div>
        </div>

        {participants.map((participant, index) => (
          <div key={index} className="mt-4 border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900">Participant {index + 1}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom bénéficiaire</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={participant.nomBeneficiaire}
                  onChange={(e) => handleParticipantFieldChange(index, 'nomBeneficiaire', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom bénéficiaire</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={participant.prenomBeneficiaire}
                  onChange={(e) => handleParticipantFieldChange(index, 'prenomBeneficiaire', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Raison sociale entreprise</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={participant.raisonSocialeEntreprise}
                  onChange={(e) => handleParticipantFieldChange(index, 'raisonSocialeEntreprise', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={participant.email}
                  onChange={(e) => handleParticipantFieldChange(index, 'email', e.target.value)}
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => downloadSinglePdf(participant)}
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#5ea8f2] hover:bg-[#4a90d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ea8f2]"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Télécharger l'attestation
              </button>
              <button
                type="button"
                onClick={() => handleSendSingleEmail(participant)}
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#5ea8f2] hover:bg-[#4a90d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ea8f2]"
              >
                <Mail className="mr-2 h-4 w-4" />
                Envoyer par email
              </button>
            </div>
          </div>
        ))}

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={generateAllPdfs}
            disabled={isGenerating}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5ea8f2] hover:bg-[#4a90d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ea8f2]"
          >
            <FileArchive className="mr-2 h-4 w-4" />
            {isGenerating ? 'Génération en cours...' : 'Télécharger toutes les attestations'}
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5ea8f2] hover:bg-[#4a90d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ea8f2]"
          >
          <Mail className="mr-2 h-4 w-4" />
          Envoyer les attestations par mail à tous les participants
          </button>
        </div>
      </form>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Envoyer par mail</h3>
              <div className="mt-2 px-7 py-3">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={emailData.message}
                    onChange={(e) => handleEmailFieldChange('message', e.target.value)}
                  />
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={handleSendEmail}
                    className="px-4 py-2 bg-[#5ea8f2] text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-[#4a90d9] focus:outline-none focus:ring-2 focus:ring-[#5ea8f2] focus:ring-offset-2"
                  >
                    Envoyer
                  </button>
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default AttestationFormation;
