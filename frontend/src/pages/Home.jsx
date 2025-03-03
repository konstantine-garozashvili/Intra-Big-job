import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from "react-router-dom"

const Home = () => {

  return (
    <div className="h-screen flex flex-col">
      <Navbar />

      {/* Contenu principal qui prend toute la hauteur restante */}
      <main className="flex-1 flex flex-col items-center bg-[url('/src/assets/images/purplebg.jpg')] bg-repeat bg-center">
        <section className="w-full flex justify-center items-start mt-10 space-x-4">
          {/* Bouton Connexion */}
          <Link to="/connexion">
            <button className="w-40 px-6 py-3 bg-[#DEC2E8] text-[#2D055B] font-semibold rounded-lg hover:bg-white transition">
              Connexion
            </button>
          </Link>

          {/* Bouton Inscription */}
          <Link to="/inscription">
            <button className="w-40 px-6 py-3 bg-[#DEC2E8] text-[#2D055B] font-semibold rounded-lg hover:bg-white transition">
              Inscription
            </button>
          </Link>
        </section>
      </main>

    </div>
  )
};

export default Home;