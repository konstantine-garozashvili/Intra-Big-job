import React, { useState, useEffect } from 'react';
import Navbar2 from '../components/Navbar2';

import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const links = [
    { name: 'Devenir partenaire', href: '#' },
    { name: 'Notre mission', href: '#' },
  ]
 
const Home = () => {
    

  return (
    <div className="">
        <Navbar2 />
   <div className="flex space-x-4 mt-6  item-center justify-center ">
      {/* Bouton Connexion */}
      <button className="px-6 py-3 bg-[#DEC2E8] text-[#2D055B] font-semibold rounded-lg hover:bg-blue-700 transition">
        Connexion
      </button>

      {/* Bouton Inscription */}
      <button className="px-6 py-3 bg-[#DEC2E8] text-[#2D055B] font-semibold rounded-lg hover:bg-green-700 transition">
        Inscription
      </button>
    </div>
    </div>
  );
};

export default Home;