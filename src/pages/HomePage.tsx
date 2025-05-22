import { FC } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faComments, faBars, faCheck, 
  faUserShield, faUserTie, faUserGraduate, faUsers,
  faQrcode, faClock, faQuestionCircle, 
  faVoteYea, faChartPie, faBell, faPlay 
} from '@fortawesome/free-solid-svg-icons';

const HomePage: FC = () => {
  return (
    <div className="font-sans antialiased text-gray-800 ">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 m-2">
        <div className="w-full py-16 px-4 sm:py-24 sm:px-6 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Gestion simplifiée de vos panels et conférences
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-purple-100">
            Une solution complète pour, modérateurs, panélistes et public avec des fonctionnalités adaptées à chaque rôle.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link to="/register" className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-purple-700 bg-white hover:bg-purple-50 md:py-4 md:text-lg md:px-10">
              Créer un compte
            </Link>
            <a href="#demo" className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-800 bg-opacity-60 hover:bg-opacity-70 md:py-4 md:text-lg md:px-10">
              Voir la démo
            </a>
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div id="roles" className="py-12 bg-gray-50 ml-20 mr-20">
        <div className="w-full px-4 sm:px-6">
          <div className="lg:text-center">
            <h2 className="text-base text-purple-600 font-semibold tracking-wide uppercase">Pour chaque acteur</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Des fonctionnalités adaptées à votre rôle
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              PanelPulse offre une expérience personnalisée selon que vous soyez modérateur, panéliste ou membre du public.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-1 lg:grid-cols-3">            
            {/* Moderator Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                  <FontAwesomeIcon icon={faUserTie} className="text-green-600 text-xl" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">Modérateur</h3>
              </div>
              <div className="mt-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Création et configuration des panels</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Gestion des panélistes et temps de parole</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Préchargement des questions/réponses</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon icon={faCheck} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Modération des questions en temps réel</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Panelist Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                  <FontAwesomeIcon icon={faUserGraduate} className="text-blue-600 text-xl" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">Panéliste</h3>
              </div>
              <div className="mt-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <FontAwesomeIcon icon={faCheck} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Accès aux questions préchargées</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon icon={faCheck} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Visualisation des réponses préparées</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon icon={faCheck} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Suivi des questions en temps réel</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon icon={faCheck} className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Gestion du temps de parole</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Public Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-yellow-500">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-full">
                  <FontAwesomeIcon icon={faUsers} className="text-yellow-600 text-xl" />
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900">Public</h3>
              </div>
              <div className="mt-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <FontAwesomeIcon icon={faCheck} className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Soumission de questions via QR Code</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon icon={faCheck} className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Vote pour les meilleures questions</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon icon={faCheck} className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Pas de compte nécessaire</span>
                  </li>
                  <li className="flex items-start">
                    <FontAwesomeIcon icon={faCheck} className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                    <span>Interface simplifiée</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 bg-white ml-20 mr-20">
        <div className="w-full px-4 sm:px-6">
          <div className="lg:text-center">
            <h2 className="text-base text-purple-600 font-semibold tracking-wide uppercase">Fonctionnalités clés</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Tout ce dont vous avez besoin pour des panels réussis
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 p-3 rounded-full">
                    <FontAwesomeIcon icon={faQrcode} className="text-purple-600 text-xl" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">QR Code de panel</h3>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Génération automatique de QR Code pour chaque panel, permettant au public d'accéder facilement à l'interface de questions.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 p-3 rounded-full">
                    <FontAwesomeIcon icon={faClock} className="text-green-600 text-xl" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Gestion des temps</h3>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Configuration des temps de parole pour chaque panéliste avec alertes visuelles et notifications.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                    <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-600 text-xl" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Questions préchargées</h3>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Préparation à l'avance des questions et réponses pour guider la discussion du panel.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 p-3 rounded-full">
                    <FontAwesomeIcon icon={faVoteYea} className="text-yellow-600 text-xl" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Système de votes</h3>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Le public peut voter pour les meilleures questions, permettant une modération par popularité.
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 p-3 rounded-full">
                    <FontAwesomeIcon icon={faChartPie} className="text-red-600 text-xl" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Statistiques</h3>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Tableaux de bord complets avec analyse des interactions, temps de parole et engagement.
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-full">
                    <FontAwesomeIcon icon={faBell} className="text-indigo-600 text-xl" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Notifications</h3>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Alertes en temps réel pour les nouvelles questions, fin de temps de parole et événements importants.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div id="demo" className="bg-gray-50 py-16 w-full">
        <div className="w-full px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Essayez PanelPulse dès maintenant
          </h2>
          <div className="mt-8 flex justify-center">
            <button className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10">
              <FontAwesomeIcon icon={faPlay} className="mr-2" />
              Démo interactive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default HomePage;
