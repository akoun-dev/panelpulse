import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faBars, faUser, faSignOutAlt, faTachometerAlt, faUserFriends, faEnvelope, faCog } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fonction pour gérer la déconnexion
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <FontAwesomeIcon size='10x' icon={faComments} className="text-purple-600 dark:text-purple-400 text-2xl" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">PanelPulse</span>
            </Link>
          </div>

          {/* Menu pour les utilisateurs non connectés */}
          {!user && (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <Link to="/auth/login" className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Connexion
              </Link>
              <Link to="/auth/register" className="ml-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                S'inscrire
              </Link>
              <div className="ml-4">
                <ThemeToggle />
              </div>
            </div>
          )}

          {/* Menu pour les utilisateurs connectés */}
          {user && (
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <Link to="/user/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" />
                Tableau de bord
              </Link>
              <Link to="/user/my-panels" className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                <FontAwesomeIcon icon={faUserFriends} className="mr-2" />
                Mes panels
              </Link>
              <Link to="/user/invitations" className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                Invitations
              </Link>

              <div className="ml-2">
                <ThemeToggle />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user?.email || 'Utilisateur'} />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {user?.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/user/profile')}>
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/user/settings')}>
                    <FontAwesomeIcon icon={faCog} className="mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Menu mobile */}
          <div className="sm:hidden flex items-center">
            <div className="mr-2">
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              <span className="sr-only">Open main menu</span>
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {!user ? (
              <>
                <Link to="/auth/login" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Connexion
                </Link>
                <Link to="/auth/register" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  S'inscrire
                </Link>
              </>
            ) : (
              <>
                <Link to="/user/dashboard" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" />
                  Tableau de bord
                </Link>
                <Link to="/user/my-panels" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <FontAwesomeIcon icon={faUserFriends} className="mr-2" />
                  Mes panels
                </Link>
                <Link to="/user/invitations" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  Invitations
                </Link>
                <Link to="/user/profile" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  Profil
                </Link>
                <Link to="/user/settings" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <FontAwesomeIcon icon={faCog} className="mr-2" />
                  Paramètres
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
