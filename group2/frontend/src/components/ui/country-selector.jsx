import * as React from "react"
import { useState, useMemo } from "react"
import { Check, ChevronDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Liste des pays avec la France en premier
export const countries = [
  { value: "france", label: "France", flag: "🇫🇷" },
  { value: "afghanistan", label: "Afghanistan", flag: "🇦🇫" },
  { value: "albania", label: "Albanie", flag: "🇦🇱" },
  { value: "algeria", label: "Algérie", flag: "🇩🇿" },
  { value: "andorra", label: "Andorre", flag: "🇦🇩" },
  { value: "angola", label: "Angola", flag: "🇦🇴" },
  { value: "antigua", label: "Antigua-et-Barbuda", flag: "🇦🇬" },
  { value: "argentina", label: "Argentine", flag: "🇦🇷" },
  { value: "armenia", label: "Arménie", flag: "🇦🇲" },
  { value: "australia", label: "Australie", flag: "🇦🇺" },
  { value: "austria", label: "Autriche", flag: "🇦🇹" },
  { value: "azerbaijan", label: "Azerbaïdjan", flag: "🇦🇿" },
  { value: "bahamas", label: "Bahamas", flag: "🇧🇸" },
  { value: "bahrain", label: "Bahreïn", flag: "🇧🇭" },
  { value: "bangladesh", label: "Bangladesh", flag: "🇧🇩" },
  { value: "barbados", label: "Barbade", flag: "🇧🇧" },
  { value: "belarus", label: "Biélorussie", flag: "🇧🇾" },
  { value: "belgium", label: "Belgique", flag: "🇧🇪" },
  { value: "belize", label: "Belize", flag: "🇧🇿" },
  { value: "benin", label: "Bénin", flag: "🇧🇯" },
  { value: "bhutan", label: "Bhoutan", flag: "🇧🇹" },
  { value: "bolivia", label: "Bolivie", flag: "🇧🇴" },
  { value: "bosnia", label: "Bosnie-Herzégovine", flag: "🇧🇦" },
  { value: "botswana", label: "Botswana", flag: "🇧🇼" },
  { value: "brazil", label: "Brésil", flag: "🇧🇷" },
  { value: "brunei", label: "Brunei", flag: "🇧🇳" },
  { value: "bulgaria", label: "Bulgarie", flag: "🇧🇬" },
  { value: "burkina", label: "Burkina Faso", flag: "🇧🇫" },
  { value: "burundi", label: "Burundi", flag: "🇧🇮" },
  { value: "cambodia", label: "Cambodge", flag: "🇰🇭" },
  { value: "cameroon", label: "Cameroun", flag: "🇨🇲" },
  { value: "canada", label: "Canada", flag: "🇨🇦" },
  { value: "cape_verde", label: "Cap-Vert", flag: "🇨🇻" },
  { value: "central_african_republic", label: "République centrafricaine", flag: "🇨🇫" },
  { value: "chad", label: "Tchad", flag: "🇹🇩" },
  { value: "chile", label: "Chili", flag: "🇨🇱" },
  { value: "china", label: "Chine", flag: "🇨🇳" },
  { value: "colombia", label: "Colombie", flag: "🇨🇴" },
  { value: "comoros", label: "Comores", flag: "��🇲" },
  { value: "congo", label: "Congo", flag: "🇨🇬" },
  { value: "costa_rica", label: "Costa Rica", flag: "🇨🇷" },
  { value: "croatia", label: "Croatie", flag: "🇭🇷" },
  { value: "cuba", label: "Cuba", flag: "🇨🇺" },
  { value: "cyprus", label: "Chypre", flag: "🇨🇾" },
  { value: "czech_republic", label: "République tchèque", flag: "🇨🇿" },
  { value: "denmark", label: "Danemark", flag: "🇩🇰" },
  { value: "djibouti", label: "Djibouti", flag: "🇩🇯" },
  { value: "dominica", label: "Dominique", flag: "🇩🇲" },
  { value: "dominican_republic", label: "République dominicaine", flag: "🇩🇴" },
  { value: "east_timor", label: "Timor oriental", flag: "🇹🇱" },
  { value: "ecuador", label: "Équateur", flag: "🇪🇨" },
  { value: "egypt", label: "Égypte", flag: "🇪🇬" },
  { value: "el_salvador", label: "Salvador", flag: "🇸🇻" },
  { value: "equatorial_guinea", label: "Guinée équatoriale", flag: "🇬🇶" },
  { value: "eritrea", label: "Érythrée", flag: "🇪🇷" },
  { value: "estonia", label: "Estonie", flag: "🇪🇪" },
  { value: "ethiopia", label: "Éthiopie", flag: "🇪🇹" },
  { value: "fiji", label: "Fidji", flag: "🇫🇯" },
  { value: "finland", label: "Finlande", flag: "🇫🇮" },
  { value: "gabon", label: "Gabon", flag: "🇬🇦" },
  { value: "gambia", label: "Gambie", flag: "🇬🇲" },
  { value: "georgia", label: "Géorgie", flag: "🇬🇪" },
  { value: "germany", label: "Allemagne", flag: "🇩🇪" },
  { value: "ghana", label: "Ghana", flag: "🇬🇭" },
  { value: "greece", label: "Grèce", flag: "🇬🇷" },
  { value: "grenada", label: "Grenade", flag: "🇬🇩" },
  { value: "guatemala", label: "Guatemala", flag: "🇬🇹" },
  { value: "guinea", label: "Guinée", flag: "🇬🇳" },
  { value: "guinea_bissau", label: "Guinée-Bissau", flag: "🇬🇼" },
  { value: "guyana", label: "Guyana", flag: "🇬🇾" },
  { value: "haiti", label: "Haïti", flag: "🇭🇹" },
  { value: "honduras", label: "Honduras", flag: "🇭🇳" },
  { value: "hungary", label: "Hongrie", flag: "🇭🇺" },
  { value: "iceland", label: "Islande", flag: "🇮🇸" },
  { value: "india", label: "Inde", flag: "🇮🇳" },
  { value: "indonesia", label: "Indonésie", flag: "🇮🇩" },
  { value: "iran", label: "Iran", flag: "🇮🇷" },
  { value: "iraq", label: "Irak", flag: "🇮🇶" },
  { value: "ireland", label: "Irlande", flag: "🇮🇪" },
  { value: "israel", label: "Israël", flag: "🇮🇱" },
  { value: "italy", label: "Italie", flag: "🇮🇹" },
  { value: "jamaica", label: "Jamaïque", flag: "🇯🇲" },
  { value: "japan", label: "Japon", flag: "🇯🇵" },
  { value: "jordan", label: "Jordanie", flag: "🇯🇴" },
  { value: "kazakhstan", label: "Kazakhstan", flag: "🇰🇿" },
  { value: "kenya", label: "Kenya", flag: "🇰🇪" },
  { value: "kiribati", label: "Kiribati", flag: "🇰🇮" },
  { value: "north_korea", label: "Corée du Nord", flag: "🇰🇵" },
  { value: "south_korea", label: "Corée du Sud", flag: "🇰🇷" },
  { value: "kuwait", label: "Koweït", flag: "🇰🇼" },
  { value: "kyrgyzstan", label: "Kirghizistan", flag: "🇰🇬" },
  { value: "laos", label: "Laos", flag: "🇱🇦" },
  { value: "latvia", label: "Lettonie", flag: "🇱🇻" },
  { value: "lebanon", label: "Liban", flag: "🇱🇧" },
  { value: "lesotho", label: "Lesotho", flag: "🇱🇸" },
  { value: "liberia", label: "Libéria", flag: "🇱🇷" },
  { value: "libya", label: "Libye", flag: "🇱🇾" },
  { value: "liechtenstein", label: "Liechtenstein", flag: "🇱🇮" },
  { value: "lithuania", label: "Lituanie", flag: "🇱🇹" },
  { value: "luxembourg", label: "Luxembourg", flag: "🇱🇺" },
  { value: "macedonia", label: "Macédoine du Nord", flag: "🇲🇰" },
  { value: "madagascar", label: "Madagascar", flag: "🇲🇬" },
  { value: "malawi", label: "Malawi", flag: "🇲🇼" },
  { value: "malaysia", label: "Malaisie", flag: "🇲🇾" },
  { value: "maldives", label: "Maldives", flag: "🇲🇻" },
  { value: "mali", label: "Mali", flag: "🇲🇱" },
  { value: "malta", label: "Malte", flag: "🇲🇹" },
  { value: "marshall_islands", label: "Îles Marshall", flag: "🇲🇭" },
  { value: "mauritania", label: "Mauritanie", flag: "🇲🇷" },
  { value: "mauritius", label: "Maurice", flag: "🇲🇺" },
  { value: "mexico", label: "Mexique", flag: "🇲🇽" },
  { value: "micronesia", label: "Micronésie", flag: "🇫🇲" },
  { value: "moldova", label: "Moldavie", flag: "🇲🇩" },
  { value: "monaco", label: "Monaco", flag: "🇲🇨" },
  { value: "mongolia", label: "Mongolie", flag: "🇲🇳" },
  { value: "montenegro", label: "Monténégro", flag: "🇲🇪" },
  { value: "morocco", label: "Maroc", flag: "🇲🇦" },
  { value: "mozambique", label: "Mozambique", flag: "🇲🇿" },
  { value: "myanmar", label: "Myanmar", flag: "🇲🇲" },
  { value: "namibia", label: "Namibie", flag: "🇳🇦" },
  { value: "nauru", label: "Nauru", flag: "🇳🇷" },
  { value: "nepal", label: "Népal", flag: "🇳🇵" },
  { value: "netherlands", label: "Pays-Bas", flag: "🇳🇱" },
  { value: "new_zealand", label: "Nouvelle-Zélande", flag: "🇳🇿" },
  { value: "nicaragua", label: "Nicaragua", flag: "🇳🇮" },
  { value: "niger", label: "Niger", flag: "🇳🇪" },
  { value: "nigeria", label: "Nigeria", flag: "🇳🇬" },
  { value: "norway", label: "Norvège", flag: "🇳🇴" },
  { value: "oman", label: "Oman", flag: "🇴🇲" },
  { value: "pakistan", label: "Pakistan", flag: "🇵🇰" },
  { value: "palau", label: "Palaos", flag: "🇵🇼" },
  { value: "panama", label: "Panama", flag: "🇵🇦" },
  { value: "papua_new_guinea", label: "Papouasie-Nouvelle-Guinée", flag: "🇵🇬" },
  { value: "paraguay", label: "Paraguay", flag: "🇵🇾" },
  { value: "peru", label: "Pérou", flag: "🇵🇪" },
  { value: "philippines", label: "Philippines", flag: "🇵🇭" },
  { value: "poland", label: "Pologne", flag: "🇵🇱" },
  { value: "portugal", label: "Portugal", flag: "🇵🇹" },
  { value: "qatar", label: "Qatar", flag: "🇶🇦" },
  { value: "romania", label: "Roumanie", flag: "🇷🇴" },
  { value: "russia", label: "Russie", flag: "🇷🇺" },
  { value: "rwanda", label: "Rwanda", flag: "🇷🇼" },
  { value: "saint_kitts", label: "Saint-Kitts-et-Nevis", flag: "🇰🇳" },
  { value: "saint_lucia", label: "Sainte-Lucie", flag: "🇱🇨" },
  { value: "saint_vincent", label: "Saint-Vincent-et-les-Grenadines", flag: "🇻🇨" },
  { value: "samoa", label: "Samoa", flag: "🇼🇸" },
  { value: "san_marino", label: "Saint-Marin", flag: "🇸🇲" },
  { value: "sao_tome", label: "Sao Tomé-et-Principe", flag: "🇸🇹" },
  { value: "saudi_arabia", label: "Arabie saoudite", flag: "🇸🇦" },
  { value: "senegal", label: "Sénégal", flag: "🇸🇳" },
  { value: "serbia", label: "Serbie", flag: "🇷🇸" },
  { value: "seychelles", label: "Seychelles", flag: "🇸🇨" },
  { value: "sierra_leone", label: "Sierra Leone", flag: "🇸🇱" },
  { value: "singapore", label: "Singapour", flag: "🇸🇬" },
  { value: "slovakia", label: "Slovaquie", flag: "🇸🇰" },
  { value: "slovenia", label: "Slovénie", flag: "🇸🇮" },
  { value: "solomon_islands", label: "Îles Salomon", flag: "🇸🇧" },
  { value: "somalia", label: "Somalie", flag: "🇸🇴" },
  { value: "south_africa", label: "Afrique du Sud", flag: "🇿🇦" },
  { value: "south_sudan", label: "Soudan du Sud", flag: "🇸🇸" },
  { value: "spain", label: "Espagne", flag: "🇪🇸" },
  { value: "sri_lanka", label: "Sri Lanka", flag: "🇱🇰" },
  { value: "sudan", label: "Soudan", flag: "🇸🇩" },
  { value: "suriname", label: "Suriname", flag: "🇸🇷" },
  { value: "swaziland", label: "Eswatini", flag: "🇸🇿" },
  { value: "sweden", label: "Suède", flag: "🇸🇪" },
  { value: "switzerland", label: "Suisse", flag: "🇨🇭" },
  { value: "syria", label: "Syrie", flag: "🇸🇾" },
  { value: "taiwan", label: "Taïwan", flag: "🇹🇼" },
  { value: "tajikistan", label: "Tadjikistan", flag: "🇹🇯" },
  { value: "tanzania", label: "Tanzanie", flag: "🇹🇿" },
  { value: "thailand", label: "Thaïlande", flag: "🇹🇭" },
  { value: "togo", label: "Togo", flag: "🇹🇬" },
  { value: "tonga", label: "Tonga", flag: "🇹🇴" },
  { value: "trinidad", label: "Trinité-et-Tobago", flag: "🇹🇹" },
  { value: "tunisia", label: "Tunisie", flag: "🇹🇳" },
  { value: "turkey", label: "Turquie", flag: "🇹🇷" },
  { value: "turkmenistan", label: "Turkménistan", flag: "🇹🇲" },
  { value: "tuvalu", label: "Tuvalu", flag: "🇹🇻" },
  { value: "uganda", label: "Ouganda", flag: "🇺🇬" },
  { value: "ukraine", label: "Ukraine", flag: "🇺🇦" },
  { value: "united_arab_emirates", label: "Émirats arabes unis", flag: "🇦🇪" },
  { value: "united_kingdom", label: "Royaume-Uni", flag: "🇬🇧" },
  { value: "united_states", label: "États-Unis", flag: "🇺🇸" },
  { value: "uruguay", label: "Uruguay", flag: "🇺🇾" },
  { value: "uzbekistan", label: "Ouzbékistan", flag: "🇺🇿" },
  { value: "vanuatu", label: "Vanuatu", flag: "🇻🇺" },
  { value: "vatican", label: "Vatican", flag: "🇻🇦" },
  { value: "venezuela", label: "Venezuela", flag: "🇻🇪" },
  { value: "vietnam", label: "Viêt Nam", flag: "🇻🇳" },
  { value: "yemen", label: "Yémen", flag: "🇾🇪" },
  { value: "zambia", label: "Zambie", flag: "🇿🇲" },
  { value: "zimbabwe", label: "Zimbabwe", flag: "🇿🇼" },
]

// Fonction pour mapper les valeurs de pays en noms de nationalité
export function mapCountryValueToNationalityName(countryValue) {
  const country = countries.find(c => c.value === countryValue);
  if (!country) return "";
  
  // Cas spéciaux
  const specialCases = {
    "france": "Française",
    "united_states": "Américaine",
    "united_kingdom": "Britannique",
    "germany": "Allemande",
    "italy": "Italienne",
    "spain": "Espagnole",
    "portugal": "Portugaise",
    "belgium": "Belge",
    "switzerland": "Suisse",
    "canada": "Canadienne",
  };
  
  if (specialCases[countryValue]) {
    return specialCases[countryValue];
  }
  
  // Par défaut, on utilise le label du pays
  return country.label;
}

export function CountrySelector({ value, onChange, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Trouver le pays sélectionné
  const selectedCountry = useMemo(() => 
    countries.find((country) => country.value === value),
    [value]
  );
  
  // Filtrer les pays en fonction de la recherche
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    
    const query = searchQuery.toLowerCase();
    return countries.filter(
      country => 
        country.label.toLowerCase().includes(query) || 
        country.value.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Fonction pour gérer le clic sur le sélecteur
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearchQuery("");
    }
  };

  // Fonction pour gérer la sélection d'un pays
  const handleSelectCountry = (countryValue) => {
    onChange(countryValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Gestion de la recherche
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="relative">
      {/* Bouton de sélection */}
      <Button
        type="button"
        variant="outline"
        onClick={handleToggle}
        className={cn(
          "w-full h-14 justify-between font-normal",
          !value && "text-gray-500",
          error && "border-red-500"
        )}
      >
        {selectedCountry ? (
          <div className="flex items-center">
            <span className="mr-2 text-lg">{selectedCountry.flag}</span>
            <span>{selectedCountry.label}</span>
          </div>
        ) : (
          "Sélectionnez un pays"
        )}
        <ChevronDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
      </Button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg dark:bg-gray-900 dark:border-gray-700">
          {/* Barre de recherche */}
          <div className="relative border-b">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              placeholder="Rechercher un pays..."
              className="h-9 w-full pl-8 pr-2 focus:outline-none"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Liste des pays avec défilement */}
          <div 
            className="overflow-y-scroll" 
            style={{ 
              maxHeight: '250px',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch' 
            }}
          >
            {filteredCountries.length === 0 ? (
              <div className="p-2 text-sm text-gray-500 text-center">
                Aucun pays trouvé
              </div>
            ) : (
              filteredCountries.map((country) => (
                <div
                  key={country.value}
                  className={cn(
                    "px-2 py-1.5 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
                    value === country.value && "bg-gray-100 dark:bg-gray-800"
                  )}
                  onClick={() => handleSelectCountry(country.value)}
                >
                  <div className="flex items-center">
                    <span className="mr-2 text-lg">{country.flag}</span>
                    <span>{country.label}</span>
                  </div>
                  {value === country.value && <Check className="ml-auto h-4 w-4" />}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-1 text-xs text-gray-500 text-center border-t">
            {filteredCountries.length} pays - Faites défiler pour tout voir
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
} 