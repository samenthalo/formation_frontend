import React from 'react';


const QuizDetailsModal = ({ isOpen, onRequestClose, quiz }) => {
  return (
    <CustomModal isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2>{quiz.titre}</h2>
      <p>{quiz.description}</p>
      <h3>Questions:</h3>
      {quiz.questions.map((question, index) => (
        <div key={index}>
          <p>{question.contenu}</p>
          <h4>Réponses:</h4>
          <ul>
            {question.reponses.map((reponse, idx) => (
              <li key={idx}>
                {reponse.libelle} - {reponse.correct ? 'Correct' : 'Incorrect'}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button onClick={onRequestClose}>Fermer</button>
    </CustomModal>
  );
};

export default QuizDetailsModal;
