import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const Regulation = () => (
  <div className="p-6 max-w-4xl mx-auto">
    <h1 className="text-2xl font-bold mb-4">Réglementation : Mentions Légales, RGPD & RGAA</h1>
    
    <section className="mb-6">
      <h2 className="text-xl font-semibold">Mentions Légales</h2>
      <p><strong>Éditeur du site :</strong> Nom de l’entreprise, adresse, contact.</p>
      <p><strong>Responsable de la publication :</strong> Nom du responsable.</p>
      <p><strong>Hébergement :</strong> Nom de l’hébergeur, adresse, contact.</p>
      <p><strong>Propriété intellectuelle :</strong> Tous les contenus présents sur ce site sont protégés par les lois sur la propriété intellectuelle.</p>
      <p><strong>Limitation de responsabilité :</strong> L’éditeur du site ne peut être tenu responsable des erreurs ou omissions dans les informations diffusées.</p>
    </section>
    
    <section className="mb-6">
      <h2 className="text-xl font-semibold">Politique de confidentialité (RGPD)</h2>
      <p><strong>Collecte des données :</strong> Nous collectons des données personnelles uniquement dans le cadre des services fournis.</p>
      <p><strong>Finalité du traitement :</strong> Vos données sont utilisées pour assurer le bon fonctionnement du site et améliorer nos services.</p>
      <p><strong>Droits des utilisateurs :</strong> Conformément au RGPD, vous avez un droit d’accès, de rectification et de suppression de vos données.</p>
      <p><strong>Durée de conservation :</strong> Les données sont conservées uniquement pour la durée nécessaire à la finalité du traitement.</p>
      <p><strong>Partage des données :</strong> Aucune donnée personnelle n’est vendue ou cédée à des tiers sans votre consentement.</p>
    </section>
    
    <section className="mb-6">
      <h2 className="text-xl font-semibold">Accessibilité (RGAA)</h2>
      <p><strong>Engagement :</strong> Nous nous engageons à respecter les normes d’accessibilité définies par le RGAA.</p>
      <p><strong>Conformité :</strong> Le site est conçu pour être utilisable par tous, y compris les personnes en situation de handicap.</p>
      <p><strong>Améliorations :</strong> Nous travaillons continuellement à améliorer l’accessibilité du site.</p>
      <p><strong>Contact :</strong> Si vous rencontrez des difficultés d’accessibilité, vous pouvez nous contacter à l’adresse email de support.</p>
    </section>
  </div>
);



export default App;
