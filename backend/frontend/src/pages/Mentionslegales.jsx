import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const Regulation = () => (
  <div className="p-6 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold mb-6 text-center text-[#02284f]">
      Politiques et réglementations
    </h1>
    
    <section className="mb-6">
      <h2 className="text-xl font-semibold text-center text-[#02284f] mb-4">Mentions Légales</h2>
      <p><strong>Éditeur du site :</strong>La Plateforme_, 30 Place Jules Guesdes, 13003 MARSEILLE, Bigproject@laplateforme.io.</p>
      <p><strong>Responsable de la publication :</strong> Nom du responsable.</p>
      <p><strong>Hébergement :</strong> Nom de l’hébergeur, adresse, contact.</p>
      <p><strong>Propriété intellectuelle :</strong> Tous les contenus présents sur ce site sont protégés par les lois sur la propriété intellectuelle.</p>
      <p><strong>Limitation de responsabilité :</strong> L’éditeur du site ne peut être tenu responsable des erreurs ou omissions dans les informations diffusées.</p>
    </section>
    
    <section className="mb-6">
      <h2 className="text-xl font-semibold text-center text-[#02284f] mb-4">Politique de confidentialité (RGPD)</h2>
      <p><strong>Collecte des données :</strong> Nous collectons des données personnelles uniquement dans le cadre des services fournis.</p>
      <p><strong>Finalité du traitement :</strong> Vos données sont utilisées pour assurer le bon fonctionnement du site et améliorer nos services.</p>
      <p><strong>Droits des utilisateurs :</strong> Conformément au RGPD, vous avez un droit d’accès, de rectification et de suppression de vos données.</p>
      <p><strong>Durée de conservation :</strong> Les données sont conservées uniquement pour la durée nécessaire à la finalité du traitement.</p>
      <p><strong>Partage des données :</strong> Aucune donnée personnelle n’est vendue ou cédée à des tiers sans votre consentement.</p>
    </section>
    
    <section className="mb-6">
      <h2 className="text-xl font-semibold text-center text-[#02284f] mb-4">Accessibilité (RGAA)</h2>
      <p><strong>Engagement :</strong> Nous nous engageons à respecter les normes d’accessibilité définies par le RGAA.</p>
      <p><strong>Conformité :</strong> Le site est conçu pour être utilisable par tous, y compris les personnes en situation de handicap.</p>
      <p><strong>Améliorations :</strong> Nous travaillons continuellement à améliorer l’accessibilité du site.</p>
      <p><strong>Contact :</strong> Si vous rencontrez des difficultés d’accessibilité, vous pouvez nous contacter à l’adresse email de support.</p>
    </section>
    
    <section className="mb-6">
      <h2 className="text-xl font-semibold text-center text-[#02284f] mb-4">Conditions Générales d'Utilisation (CGU)</h2>
      <p><strong>Objet :</strong> Les présentes conditions définissent les règles d’utilisation du site et des services associés.</p>
      <p><strong>Accès au site :</strong> L’utilisateur s’engage à utiliser le site conformément aux lois en vigueur et aux présentes CGU.</p>
      <p><strong>Responsabilité des utilisateurs :</strong> Toute utilisation abusive, frauduleuse ou contraire aux lois est interdite.</p>
      <p><strong>Modification des CGU :</strong> L’éditeur se réserve le droit de modifier les CGU à tout moment.</p>
    </section>
    
    <section className="mb-6">
      <h2 className="text-xl font-semibold text-center text-[#02284f] mb-4">Conditions Générales de Vente (CGV)</h2>
      <p><strong>Objet :</strong> Les présentes CGV régissent les ventes de formations proposées sur le site.</p>
      <p><strong>Prix et paiements :</strong> Les prix sont indiqués en euros et incluent les taxes applicables. Le paiement s’effectue en ligne via des moyens sécurisés.</p>
      <p><strong>Livraison des formations :</strong> L’accès aux formations est fourni immédiatement après confirmation du paiement.</p>
      <p><strong>Droit de rétractation :</strong> Conformément aux lois en vigueur, l’utilisateur dispose d’un délai de 14 jours pour annuler son achat, sauf si la formation a déjà été consommée.</p>
      <p><strong>Service client :</strong> Pour toute question, veuillez contacter notre support à l’adresse email de contact.</p>
    </section>
  </div>
);

export default Regulation;
