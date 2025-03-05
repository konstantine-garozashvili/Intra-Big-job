const Footer = () => {
  return (
    <div className="relative mt-16 bg-[#00284f] rounded-md border border-[#DEC2E8] mb-[6mm] mx-[3mm]">
      <div className="px-4 pt-12 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
        <div className="grid gap-16 row-gap-10 mb-8 lg:grid-cols-6">
          {/* Logo & Infos */}
          <div className="md:max-w-md lg:col-span-2">
            <a href="/" aria-label="Go home" title="Company" className="inline-flex items-center">
              <img className="w-24 h-auto rounded-sm" src=" " alt="Logo" />
              <span className="ml-2 text-xl font-bold tracking-wide text-white uppercase">
                Ninja - Centre de Formation
              </span>
            </a>
            <div className="mt-4 lg:max-w-sm">
              <p className="text-sm text-white">Ninja - Centre de Formation</p>
              <p className="mt-4 text-sm font-bold text-white">Nos coordonnées :</p>
              <p className="mt-1 text-sm text-white">Email : ninja@laplateforme.io</p>
              <p className="mt-1 text-sm text-white">Adresse : 30 Place Jules Guesdes, 13003 MARSEILLE</p>
            </div>
          </div>

          {/* Liens avec séparation verticale */}
          <div className="grid grid-cols-2 gap-5 row-gap-8 lg:col-span-4 md:grid-cols-4 text-white">
            {[
              {
                title: "Lien rapide",
                links: ["Contact", "Forum", "FAQ","CGU"],
              },
              {
                title: "Titre?",
                links: ["À propos de nous", "Nos formations", "Mentions légales", "CGU"],
              },
              {
                title: "Titre?",
                links: ["Nos partenaires", "Devenir partenaires"],
              },
              
            ].map((section, index) => (
              <div key={index} className={`px-4 ${index !== 3 ? "border-r border-white/50" : ""}`}>
                <p className="font-semibold underline decoration-1 underline-offset-4">{section.title}</p>
                <ul className="mt-2 space-y-2">
                  {section.links.map((link, idx) => (
                    <li key={idx}>
                      <a href="/" className="transition-colors duration-300 hover:text-teal-400">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Bas */}
        <div className="flex flex-col justify-between pt-5 pb-10 border-t border-white/50 sm:flex-row">
          <p className="text-sm text-white">
            © Copyright 2025 - BigProject - Tous droits réservés.
          </p>
          {/* Icônes Réseaux Sociaux (à compléter) */}
          <div className="flex items-center mt-4 space-x-4 sm:mt-0 text-white">
            {/* Ajoute ici des icônes de réseaux sociaux si besoin */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
