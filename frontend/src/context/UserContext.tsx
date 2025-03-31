import React, { createContext, useState, useContext } from 'react';

interface UserContextType {
  user: {
    id: string;
    photoUrl: string;
    firstName: string;
    lastName: string;
  } | null;
  updateUserPhoto: (photoUrl: string) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  updateUserPhoto: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserContextType['user']>(null);

  const updateUserPhoto = (photoUrl: string) => {
    setUser(prev => prev ? { ...prev, photoUrl } : null);
  };

  return (
    <UserContext.Provider value={{ user, updateUserPhoto }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); 