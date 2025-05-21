<?php
// src/Controller/StagiaireController.php

namespace App\Controller;

use App\Entity\Stagiaire;
use App\Repository\StagiaireRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Inscription;
use App\Repository\SessionFormationRepository;
use Symfony\Component\HttpFoundation\Response; // Ajoutez cette ligne pour importer la classe Response

class StagiaireController extends AbstractController
{
    #[Route('/stagiaires', name: 'get_stagiaires', methods: ['GET'])]
    public function getStagiaires(StagiaireRepository $stagiaireRepository): JsonResponse
    {
        // Récupérer tous les stagiaires
        $stagiaires = $stagiaireRepository->findAll();

        // Transforme les stagiaires en tableau associatif
        $data = [];
        foreach ($stagiaires as $stagiaire) {
            $data[] = [
                'id_stagiaire' => $stagiaire->getIdStagiaire(),
                'nom_stagiaire' => $stagiaire->getNomStagiaire(),
                'prenom_stagiaire' => $stagiaire->getPrenomStagiaire(),
                'telephone_stagiaire' => $stagiaire->getTelephoneStagiaire(),
                'email_stagiaire' => $stagiaire->getEmailStagiaire(),
                'entreprise_stagiaire' => $stagiaire->getEntrepriseStagiaire(),
                'fonction_stagiaire' => $stagiaire->getFonctionStagiaire(),
            ];
        }

        // Retourner les stagiaires en JSON
        return new JsonResponse($data);
    }

    #[Route('/stagiaires/update/{id}', name: 'update_stagiaire', methods: ['POST'])]
    public function updateStagiaire(
        int $id,
        Request $request,
        StagiaireRepository $stagiaireRepository,
        EntityManagerInterface $entityManager,
        SessionFormationRepository $sessionFormationRepository
    ): JsonResponse {
        // Récupérer le stagiaire
        $stagiaire = $stagiaireRepository->find($id);

        if (!$stagiaire) {
            return new JsonResponse(['message' => 'Stagiaire non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Récupérer les données du formulaire
        $nomStagiaire = $request->request->get('nom_stagiaire');
        $prenomStagiaire = $request->request->get('prenom_stagiaire');
        $telephoneStagiaire = $request->request->get('telephone_stagiaire');
        $emailStagiaire = $request->request->get('email_stagiaire');
        $entrepriseStagiaire = $request->request->get('entreprise_stagiaire');
        $fonctionStagiaire = $request->request->get('fonction_stagiaire');

        // Mise à jour des données du stagiaire (si présentes)
        if ($nomStagiaire) $stagiaire->setNomStagiaire($nomStagiaire);
        if ($prenomStagiaire) $stagiaire->setPrenomStagiaire($prenomStagiaire);
        if ($telephoneStagiaire) $stagiaire->setTelephoneStagiaire($telephoneStagiaire);
        if ($emailStagiaire) $stagiaire->setEmailStagiaire($emailStagiaire);
        if ($entrepriseStagiaire) $stagiaire->setEntrepriseStagiaire($entrepriseStagiaire);
        if ($fonctionStagiaire) $stagiaire->setFonctionStagiaire($fonctionStagiaire);

        // Récupérer les sessions à ajouter (sous forme de tableau)
        $idsSessions = $request->request->all('id_sessions'); // Ex: ['3', '5', '7']

        // Récupérer les sessions actuellement associées au stagiaire
        $currentSessions = [];
        foreach ($stagiaire->getInscriptions() as $inscription) {
            $currentSessions[] = $inscription->getSessionFormation()->getIdSession();
        }

        // Supprimer les inscriptions qui ne sont plus présentes dans la requête
        foreach ($stagiaire->getInscriptions() as $inscription) {
            if (!in_array($inscription->getSessionFormation()->getIdSession(), $idsSessions)) {
                $entityManager->remove($inscription);
            }
        }

        // Ajouter les nouvelles inscriptions
        if (!empty($idsSessions) && is_array($idsSessions)) {
            foreach ($idsSessions as $idSession) {
                $session = $sessionFormationRepository->find($idSession);
                if (!$session) continue; // On ignore les sessions introuvables

                // Vérifie si déjà inscrit
                $dejaInscrit = false;
                foreach ($stagiaire->getInscriptions() as $inscription) {
                    if ($inscription->getSessionFormation()->getIdSession() === $session->getIdSession()) {
                        $dejaInscrit = true;
                        break;
                    }
                }

                // Sinon, on ajoute une nouvelle inscription
                if (!$dejaInscrit) {
                    $nouvelleInscription = new \App\Entity\Inscription();
                    $nouvelleInscription->setStagiaire($stagiaire);
                    $nouvelleInscription->setSessionFormation($session);
                    $entityManager->persist($nouvelleInscription);
                }
            }
        }

        // Enregistrement en base de données
        $entityManager->flush();

        return new JsonResponse(['message' => 'Stagiaire mis à jour et inscriptions ajoutées/supprimées si nécessaire'], JsonResponse::HTTP_OK);
    }

    #[Route('/stagiaires', name: 'add_stagiaire', methods: ['POST'])]
    public function addStagiaire(
        Request $request,
        EntityManagerInterface $entityManager,
        SessionFormationRepository $sessionFormationRepository // ajoute ce repository
    ): JsonResponse {
        // Récupérer les données du formulaire
        $nomStagiaire = $request->request->get('nom_stagiaire');
        $prenomStagiaire = $request->request->get('prenom_stagiaire');
        $telephoneStagiaire = $request->request->get('telephone_stagiaire');
        $emailStagiaire = $request->request->get('email_stagiaire');
        $entrepriseStagiaire = $request->request->get('entreprise_stagiaire');
        $fonctionStagiaire = $request->request->get('fonction_stagiaire');
        $idSession = $request->request->get('id_session'); // ID de la session

        // Créer et remplir l'objet Stagiaire
        $stagiaire = new Stagiaire();
        $stagiaire->setNomStagiaire($nomStagiaire);
        $stagiaire->setPrenomStagiaire($prenomStagiaire);
        $stagiaire->setTelephoneStagiaire($telephoneStagiaire);
        $stagiaire->setEmailStagiaire($emailStagiaire);
        $stagiaire->setEntrepriseStagiaire($entrepriseStagiaire);
        $stagiaire->setFonctionStagiaire($fonctionStagiaire);

        // Chercher la session correspondante
        $session = $sessionFormationRepository->find($idSession);
        if (!$session) {
            return new JsonResponse(['error' => 'Session non trouvée'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Créer l'inscription
        $inscription = new Inscription();
        $inscription->setStagiaire($stagiaire);
        $inscription->setSessionFormation($session);
        $inscription->setStatut('inscrit'); // ou un autre statut par défaut

        // Persister les deux entités
        $entityManager->persist($stagiaire);
        $entityManager->persist($inscription);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Stagiaire et inscription ajoutés avec succès'], JsonResponse::HTTP_CREATED);
    }

    #[Route('/stagiaires/{id}', name: 'delete_stagiaire', methods: ['DELETE'])]
    public function deleteStagiaire(int $id, StagiaireRepository $stagiaireRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        // Récupérer le stagiaire à supprimer
        $stagiaire = $stagiaireRepository->find($id);

        if (!$stagiaire) {
            return new JsonResponse(['message' => 'Stagiaire non trouvé'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Supprimer le stagiaire
        $entityManager->remove($stagiaire);
        $entityManager->flush();

        // Retourner une réponse JSON
        return new JsonResponse(['message' => 'Stagiaire supprimé avec succès'], JsonResponse::HTTP_OK);
    }

    #[Route('/stagiaires/import', name: 'import_stagiaires', methods: ['POST'])]
    public function importStagiaires(Request $request, EntityManagerInterface $entityManager, SessionFormationRepository $sessionFormationRepository): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return new JsonResponse(['error' => 'Invalid JSON data'], Response::HTTP_BAD_REQUEST);
            }

            foreach ($data as $traineeData) {
                $stagiaire = new Stagiaire();
                $stagiaire->setPrenomStagiaire($traineeData['prenom_stagiaire']);
                $stagiaire->setNomStagiaire($traineeData['nom_stagiaire']);
                $stagiaire->setEmailStagiaire($traineeData['email_stagiaire']);
                $stagiaire->setTelephoneStagiaire($traineeData['telephone_stagiaire'] ?? null);
                $stagiaire->setEntrepriseStagiaire($traineeData['entreprise_stagiaire'] ?? null);
                $stagiaire->setFonctionStagiaire($traineeData['fonction_stagiaire'] ?? null);

                $entityManager->persist($stagiaire);

                if (isset($traineeData['sessions']) && is_array($traineeData['sessions'])) {
                    foreach ($traineeData['sessions'] as $sessionData) {
                        $session = $sessionFormationRepository->find($sessionData['id']);
                        if ($session) {
                            $inscription = new Inscription();
                            $inscription->setStagiaire($stagiaire);
                            $inscription->setSessionFormation($session);
                            $entityManager->persist($inscription);
                        }
                    }
                }
            }

            $entityManager->flush();

            return new JsonResponse(['message' => 'Stagiaires importés avec succès'], Response::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => 'Erreur lors de l\'importation des stagiaires: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/stagiaires/update-sessions', name: 'update_stagiaire_sessions', methods: ['POST'])]
    public function updateStagiaireSessions(
        Request $request,
        EntityManagerInterface $entityManager,
        StagiaireRepository $stagiaireRepository,
        SessionFormationRepository $sessionFormationRepository
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return new JsonResponse(['error' => 'Invalid JSON data'], Response::HTTP_BAD_REQUEST);
        }

        $trainees = $data['trainees'];
        $sessionId = $data['sessionId'];

        $session = $sessionFormationRepository->find($sessionId);
        if (!$session) {
            return new JsonResponse(['error' => 'Session non trouvée'], Response::HTTP_NOT_FOUND);
        }

        foreach ($trainees as $traineeId) {
            $stagiaire = $stagiaireRepository->find($traineeId);
            if (!$stagiaire) {
                continue; // Ignore les stagiaires introuvables
            }

            // Vérifie si déjà inscrit
            $dejaInscrit = false;
            foreach ($stagiaire->getInscriptions() as $inscription) {
                if ($inscription->getSessionFormation()->getIdSession() === $session->getIdSession()) {
                    $dejaInscrit = true;
                    break;
                }
            }

            // Sinon, on ajoute une nouvelle inscription
            if (!$dejaInscrit) {
                $nouvelleInscription = new Inscription();
                $nouvelleInscription->setStagiaire($stagiaire);
                $nouvelleInscription->setSessionFormation($session);
                $entityManager->persist($nouvelleInscription);
            }
        }

        $entityManager->flush();

        return new JsonResponse(['message' => 'Sessions des stagiaires mises à jour avec succès'], Response::HTTP_OK);
    }
}
