import React from 'react';
import Dashboard from './pages/Dashboard';
import { GraphProvider } from './context/GraphContext';
import { UserProvider } from './context/UserContext';

const App: React.FC = () => {
  return (
    <UserProvider>
      <GraphProvider>
        <Dashboard />
      </GraphProvider>
    </UserProvider>
  );
};

export default App;
