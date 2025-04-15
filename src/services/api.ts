// src/services/api.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});
// Fonction pour récupérer les formations depuis le backend
const fetchFormations = async () => {
  try {
    const response = await axios.get('/api/formations');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    return [];
  }
};

// Fonction pour récupérer les instructeurs depuis le backend
const fetchInstructors = async () => {
  try {
    const response = await axios.get('/api/instructors');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des instructeurs:', error);
    return [];
  }
};

// Fonction pour récupérer les trainees depuis le backend
const fetchTrainees = async () => {
  try {
    const response = await axios.get('/api/trainees');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des trainees:', error);
    return [];
  }
};

export default instance;
