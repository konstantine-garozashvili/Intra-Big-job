import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="bg-[#02284f] shadow-lg">
            <div className="container px-4 mx-auto">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-black tracking-tight text-white">
                            Big<span className="text-[#528eb2]">Project</span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="flex items-center ml-10 space-x-1">
                            <Link to="/" className="px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-[#02284f]/80 transition-colors">
                                Accueil
                            </Link>
                            <a href="https://github.com/your-repo/Intra-Big-job" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="px-3 py-2 rounded-md text-gray-200 hover:text-white hover:bg-[#02284f]/80 transition-colors">
                                GitHub
                            </a>
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