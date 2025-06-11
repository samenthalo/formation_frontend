import React, { useEffect, useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import { FileDown, FileArchive } from 'lucide-react';
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
    }
  ]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = searchParams.get('id_session');

    console.log('Session ID from URL:', sessionIdFromUrl);

    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl);

      const fetchSessionData = async () => {
        try {
          const response = await fetch(`http://localhost:8000/attestation/generer/${sessionIdFromUrl}`);
          const data = await response.json();

          setCommonFields({
            ...commonFields,
            intituleAction: data.session || '',
            duree: data.duree_heures || '',
            dateDebut: data.creneaux[0]?.jour || '',
            dateFin: data.creneaux[data.creneaux.length - 1]?.jour || '',
          });

          setParticipants(data.participants.map(participant => ({
            nomBeneficiaire: participant?.nom || '',
            prenomBeneficiaire: participant?.prenom || '',
            raisonSocialeEntreprise: participant?.entreprise || '',
          })));
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

    // Ajouter la date et l'heure actuelles
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
    // Download locally
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
            </div>
            <button
              type="button"
              onClick={() => downloadSinglePdf(participant)}
              className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#5ea8f2] hover:bg-[#4a90d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ea8f2]"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Télécharger l'attestation
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={generateAllPdfs}
          disabled={isGenerating}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#5ea8f2] hover:bg-[#4a90d9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5ea8f2]"
        >
          <FileArchive className="mr-2 h-4 w-4" />
          {isGenerating ? 'Génération en cours...' : 'Télécharger toutes les attestations'}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AttestationFormation;
