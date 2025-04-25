import React from 'react';
import { FaUser, FaCalendarAlt, FaMapMarkerAlt, FaLink, FaPhoneAlt, FaUsers } from 'react-icons/fa'; // Import des icônes

const SessionDetailsModal = ({ formation, onClose }) => {
  const formatHeure = (heure) => {
    const date = new Date(`1970-01-01T${heure}`);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-1/2 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Détails de la Session</h2>

        <div className="mb-4">
          <h3 className="text-xl font-semibold">{formation.titre}</h3>
          <p className="text-gray-600">{formation.nb_heures} heures</p>
          <p className="text-gray-600 flex items-center"><FaUsers className="mr-2" />Nombre de participants: {formation.nb_inscrits}</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 flex items-center">
            <FaCalendarAlt className="mr-2" />
            Mode: {formation.mode === 'presentiel' ? 'Présentiel' : 'Distanciel'}
          </p>
        </div>

        <div className="mb-4">
          {formation.mode === 'distanciel' ? (
            <p className="text-gray-600 flex items-center">
              <FaLink className="mr-2" />
              Lien visio :{' '}
              <a
                href={formation.lien_visio}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {formation.lien}
              </a>
            </p>
          ) : (
            <p className="text-gray-600 flex items-center">
              <FaMapMarkerAlt className="mr-2" />
              Lieu: {formation.lieu}
            </p>
          )}
        </div>

        <div className="mb-4">
          <h4 className="text-lg font-semibold">Créneaux</h4>
          {formation.creneaux && formation.creneaux.length > 0 ? (
            <ul className="list-disc list-inside">
              {formation.creneaux.map((creneau, index) => (
                <li key={index} className="text-gray-600">
                  {new Date(creneau.jour).toLocaleDateString()} — de {formatHeure(creneau.heure_debut)} à {formatHeure(creneau.heure_fin)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Aucun créneau disponible.</p>
          )}
        </div>

        <div className="mb-4">
          <h4 className="text-lg font-semibold">Formateur</h4>
          <p className="text-gray-600 flex items-center"><FaUser className="mr-2" />Nom: {formation.formateur.nom}</p>
          <p className="text-gray-600 flex items-center"><FaUser className="mr-2" />Prénom: {formation.formateur.prenom}</p>
          <p className="text-gray-600 flex items-center"><FaLink className="mr-2" />Email: {formation.formateur.email}</p>
          <p className="text-gray-600 flex items-center"><FaPhoneAlt className="mr-2" />Téléphone: {formation.formateur.telephone}</p>
        </div>

        <div className="mb-4">
          <h4 className="text-lg font-semibold">Responsable</h4>
          {formation.responsable_nom ? (
            <>
              <p className="text-gray-600 flex items-center"><FaUser className="mr-2" />Nom: {formation.responsable_nom}</p>
              <p className="text-gray-600 flex items-center"><FaUser className="mr-2" />Prénom: {formation.responsable_prenom}</p>
              <p className="text-gray-600 flex items-center"><FaLink className="mr-2" />Email: {formation.responsable_email}</p>
              <p className="text-gray-600 flex items-center"><FaPhoneAlt className="mr-2" />Téléphone: {formation.responsable_telephone}</p>
            </>
          ) : (
            <p className="text-gray-600">Aucun responsable renseigné.</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

export default SessionDetailsModal;
