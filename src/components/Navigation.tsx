import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { toast } from 'sonner';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const handleLogout = () => {
    // TODO: Implement actual logout logic when auth is added
    toast.info("Logout functionality will be implemented soon");
  };

  return (
    <nav className="bg-background border-b" role="navigation">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <a href="/" className="text-xl font-semibold" data-astro-reload>
            TripFit
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <a 
              href="/journeys" 
              className={`hover:text-primary transition-colors ${
                currentPath.startsWith('/journeys') ? 'text-primary font-medium' : 'text-foreground'
              }`}
              aria-current={currentPath.startsWith('/journeys') ? 'page' : undefined}
            >
              Journeys
            </a>
            <a 
              href="/profile" 
              className={`hover:text-primary transition-colors ${
                currentPath === '/profile' ? 'text-primary font-medium' : 'text-foreground'
              }`}
              aria-current={currentPath === '/profile' ? 'page' : undefined}
            >
              Profile
            </a>
            <Button variant="outline" onClick={handleLogout}>
              Log Out
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="/journeys"
              className={`block px-3 py-2 rounded-md ${
                currentPath.startsWith('/journeys') 
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
              aria-current={currentPath.startsWith('/journeys') ? 'page' : undefined}
            >
              Journeys
            </a>
            <a
              href="/profile"
              className={`block px-3 py-2 rounded-md ${
                currentPath === '/profile'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
              aria-current={currentPath === '/profile' ? 'page' : undefined}
            >
              Profile
            </a>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}