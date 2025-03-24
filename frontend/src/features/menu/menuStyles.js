/**
 * Styles personnalisés pour le menu burger
 * Exportés sous forme de chaîne de caractères pour être injectés dans le DOM
 */
export const customStyles = `
  /* Styles pour le menu burger */
  .menu-burger-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
  
  .menu-burger-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }
  
  .menu-burger-button:active {
    transform: scale(0.95);
  }
  
  /* Styles pour la barre latérale */
  .sidebar-menu {
    position: fixed;
    top: 0;
    left: 0;
    width: 300px;
    height: 100vh;
    background-color: #00284f;
    color: #fff;
    z-index: 50;
    box-shadow: 4px 0 10px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  /* Styles pour les éléments de menu */
  .menu-item {
    transition: background-color 0.2s ease;
  }
  
  .menu-item:hover {
    background-color: rgba(82, 142, 178, 0.1);
  }
  
  .menu-item.active {
    background-color: rgba(82, 142, 178, 0.15);
  }
  
  /* Styles pour les sous-éléments de menu */
  .submenu-item {
    transition: background-color 0.2s ease;
  }
  
  .submenu-item:hover {
    background-color: rgba(82, 142, 178, 0.2);
  }
  
  /* Animation pour les icônes chevron */
  .chevron-icon {
    transition: transform 0.2s ease;
  }
  
  .chevron-icon.open {
    transform: rotate(90deg);
  }
  
  /* Styles pour la zone défilante */
  .scrollable-div {
    scrollbar-width: thin;
    scrollbar-color: rgba(82, 142, 178, 0.5) rgba(0, 40, 79, 0.1);
  }
  
  .scrollable-div::-webkit-scrollbar {
    width: 6px;
  }
  
  .scrollable-div::-webkit-scrollbar-track {
    background: rgba(0, 40, 79, 0.1);
  }
  
  .scrollable-div::-webkit-scrollbar-thumb {
    background-color: rgba(82, 142, 178, 0.5);
    border-radius: 3px;
  }
  
  /* Styles responsifs */
  @media (max-width: 768px) {
    .sidebar-menu {
      width: 280px;
    }
  }
`;
