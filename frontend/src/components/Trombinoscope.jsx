import React, { useEffect, useState } from 'react';

function Trombinoscope() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    role: '',
    specialization: '',
    formation: '',
    class: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50;

  useEffect(() => {
    const params = new URLSearchParams({
      page,
      limit,
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '')),
    });

    fetch(`http://localhost:8000/api/users/list?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        // Si l'API renvoie un tableau directement
        setUsers(data.users ?? data); // data.users ou juste data selon ta réponse
        setTotalPages(data.totalPages ?? 1); // si pagination incluse
      })
      .catch(err => console.error('Erreur :', err));
  }, [filters, page]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const getMainRole = (user) => {
    if (!user.userRoles || user.userRoles.length === 0) return 'Sans rôle';
    return user.userRoles[0]?.role?.name ?? 'Sans rôle';
  };

  return (
    <div>
      <h2>Trombinoscope</h2>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <select name="role" onChange={handleFilterChange}>
          <option value="">Tous les rôles</option>
          <option value="STUDENT">Étudiant</option>
          <option value="TEACHER">Formateur</option>
          <option value="HR">RH</option>
          {/* autres rôles... */}
        </select>

        <select name="specialization" onChange={handleFilterChange}>
          <option value="">Spécialisation</option>
          {/* à remplir dynamiquement */}
        </select>

        <select name="formation" onChange={handleFilterChange}>
          <option value="">Formation</option>
          {/* idem */}
        </select>

        <select name="class" onChange={handleFilterChange}>
          <option value="">Classe</option>
        </select>
      </div>

      {/* Liste utilisateurs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {users.map(user => {
          const role = getMainRole(user);
          if (role === 'ADMIN') return null; // exclusion admins

          return (
            <div key={user.id} style={{
              width: '200px',
              border: '1px solid #ccc',
              borderRadius: '10px',
              padding: '15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <img
                src={user.profilePicturePath
                  ? `http://localhost:8000${user.profilePicturePath}`
                  : 'https://via.placeholder.com/100'}
                alt={`${user.firstName} ${user.lastName}`}
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <h4 style={{ marginTop: '10px' }}>{user.firstName} {user.lastName}</h4>
              <p style={{ fontSize: '0.9em', margin: '5px 0' }}>{role}</p>
              <p style={{ fontSize: '0.85em', color: '#666' }}>{user.theme?.name ?? 'Ville inconnue'}</p>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
          ◀ Précédent
        </button>
        <span style={{ margin: '0 10px' }}>Page {page} / {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
          Suivant ▶
        </button>
      </div>
    </div>
  );
}

export default Trombinoscope;