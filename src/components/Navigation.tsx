import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logout } from "@/lib/services/auth";

interface NavigationProps {
    isLoggedIn?: boolean;
}

export function Navigation({ isLoggedIn = false }: NavigationProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState("/");
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
            // Przekierowanie jest obsługiwane w funkcji logout
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Failed to log out. Please try again.");
        } finally {
            setIsLoggingOut(false);
        }
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
                        {isLoggedIn ? (
                            <>
                                <a
                                    href="/journeys"
                                    className={`hover:text-primary transition-colors ${
                                        currentPath.startsWith("/journeys")
                                            ? "text-primary font-medium"
                                            : "text-foreground"
                                    }`}
                                    aria-current={currentPath.startsWith("/journeys") ? "page" : undefined}
                                >
                                    Journeys
                                </a>
                                <a
                                    href="/profile"
                                    className={`hover:text-primary transition-colors ${
                                        currentPath === "/profile" ? "text-primary font-medium" : "text-foreground"
                                    }`}
                                    aria-current={currentPath === "/profile" ? "page" : undefined}
                                >
                                    Profile
                                </a>
                                <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
                                    {isLoggingOut ? "Logging out..." : "Log Out"}
                                </Button>
                            </>
                        ) : (
                            <>
                                <a
                                    href="/login"
                                    className={`hover:text-primary transition-colors ${
                                        currentPath === "/login" ? "text-primary font-medium" : "text-foreground"
                                    }`}
                                >
                                    Login
                                </a>
                                <a
                                    href="/register"
                                    className={`hover:text-primary transition-colors ${
                                        currentPath === "/register" ? "text-primary font-medium" : "text-foreground"
                                    }`}
                                >
                                    Register
                                </a>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-md hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                        aria-label="Open main menu"
                    >
                        <span className="sr-only">Open main menu</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMobileMenuOpen ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`md:hidden ${isMobileMenuOpen ? "block" : "hidden"}`} id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {isLoggedIn ? (
                            <>
                                <a
                                    href="/journeys"
                                    className={`block px-3 py-2 rounded-md ${
                                        currentPath.startsWith("/journeys")
                                            ? "text-primary font-medium"
                                            : "text-foreground hover:text-primary"
                                    }`}
                                    aria-current={currentPath.startsWith("/journeys") ? "page" : undefined}
                                >
                                    Journeys
                                </a>
                                <a
                                    href="/profile"
                                    className={`block px-3 py-2 rounded-md ${
                                        currentPath === "/profile"
                                            ? "text-primary font-medium"
                                            : "text-foreground hover:text-primary"
                                    }`}
                                    aria-current={currentPath === "/profile" ? "page" : undefined}
                                >
                                    Profile
                                </a>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                >
                                    {isLoggingOut ? "Logging out..." : "Log Out"}
                                </Button>
                            </>
                        ) : (
                            <>
                                <a
                                    href="/login"
                                    className="block px-3 py-2 rounded-md text-foreground hover:text-primary"
                                >
                                    Login
                                </a>
                                <a
                                    href="/register"
                                    className="block px-3 py-2 rounded-md text-foreground hover:text-primary"
                                >
                                    Register
                                </a>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
