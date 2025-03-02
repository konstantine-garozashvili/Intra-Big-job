import React, { useState, useEffect } from 'react';
import Navbar2 from '../components/Navbar2';
import Footer from '../components/Footer';

import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const links = [
    { name: 'Devenir partenaire', href: '#' },
    { name: 'Notre mission', href: '#' },
  ]
 
const Home = () => {
    

  return (
    <div className="h-screen flex flex-col">
      <Navbar2 />
      
      {/* Contenu principal qui prend toute la hauteur restante */}
      <main className="flex-1 flex flex-col items-center bg-[url('/src/assets/images/purplebg.jpg')]  bg-center">
  <section className="w-full flex justify-center items-start mt-10 space-x-4">
    {/* Bouton Connexion */}
    <button className="w-40 px-6 py-3 bg-[#DEC2E8] text-[#2D055B] font-semibold rounded-lg hover:bg-white transition ">
      Connexion
    </button>

    {/* Bouton Inscription */}
    <button className="w-40 px-6 py-3 bg-[#DEC2E8] text-[#2D055B] font-semibold rounded-lg hover:bg-white transition">
      Inscription
    </button>
  </section>
</main>


  
      <Footer />
    </div>
  )};
  
export default Home;