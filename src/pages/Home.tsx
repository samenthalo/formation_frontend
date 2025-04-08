import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Award, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-montserrat font-bold">Formation Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login"
                className="text-gray-600 hover:text-primary px-4 py-2 rounded-lg transition-colors"
              >
                Se connecter
              </Link>
              <Link
                to="/signup"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-montserrat font-bold text-gray-900 mb-6">
            Formez-vous pour l'avenir
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Développez vos compétences avec notre plateforme de formation professionnelle innovante
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/signup"
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
            >
              <span>Commencer maintenant</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <button className="border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary/5 transition-colors">
              En savoir plus
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-montserrat font-bold text-gray-900 mb-4">
              Pourquoi choisir Formation Pro ?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Notre plateforme offre une expérience d'apprentissage complète et personnalisée
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-lg w-fit">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mt-4 mb-2">Formations de qualité</h3>
              <p className="text-gray-600">
                Des contenus pédagogiques élaborés par des experts du domaine
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-lg w-fit">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mt-4 mb-2">Suivi personnalisé</h3>
              <p className="text-gray-600">
                Un accompagnement adapté à votre rythme et vos objectifs
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-lg w-fit">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mt-4 mb-2">Certification reconnue</h3>
              <p className="text-gray-600">
                Des attestations validant vos acquis et compétences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-gray-600">Apprenants formés</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-gray-600">Formations disponibles</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-gray-600">Taux de satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-montserrat font-bold">Formation Pro</span>
            </div>
            <div className="text-gray-600">
              © 2024 Formation Pro. Tous droits réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;