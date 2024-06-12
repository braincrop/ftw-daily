import React, { createContext, useState } from 'react';
const PubCategoryContext = createContext();

//context for pub categories

export const PubCategoryProvider = ({ children }) => {
  const [selectedPubCat, setSelectedPubCat] = useState('');

  return (
    <PubCategoryContext.Provider value={{ selectedPubCat, setSelectedPubCat }}>
      {children}
    </PubCategoryContext.Provider>
  );
};

export default PubCategoryContext;
