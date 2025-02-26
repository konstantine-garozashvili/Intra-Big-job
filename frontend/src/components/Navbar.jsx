import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-[#02284f] shadow-lg">
            <div className="container px-4 mx-auto">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-black tracking-tight text-white">
                            School<span className="text-[#528eb2]">Co'</span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="flex items-center ml-10 space-x-1">
                            <Link to="#" className="px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-[#02284f]/80 transition-colors">
                                Accueil
                            </Link>
                            <Link to="#" className="px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-[#02284f]/80 transition-colors">
                                À propos
                            </Link>
                            <Link to="#" className="px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-[#02284f]/80 transition-colors">
                                Contact
                            </Link>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <div className="flex items-center ml-4">
                            <Link to="#" className="px-4 py-2 text-gray-200 transition-colors rounded-md hover:text-white">
                                Connexion
                            </Link>
                            <Link to="#" className="ml-2 px-4 py-2 bg-[#528eb2] rounded-md text-white font-medium hover:bg-[#528eb2]/90 transition-all transform hover:scale-105">
                                Inscription
                            </Link>
                        </div>
                    </div>

                    <div className="md:hidden">
                        <button className="text-gray-200 hover:text-white focus:outline-none">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;