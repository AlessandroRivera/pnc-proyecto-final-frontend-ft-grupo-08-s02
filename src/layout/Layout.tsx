import React, { useState, createContext } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';

interface LayoutContextProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

export const LayoutContext = createContext<LayoutContextProps>({
  collapsed: false,
  toggleSidebar: () => { },
});

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(c => !c);

  return (
    <LayoutContext.Provider value={{ collapsed, toggleSidebar }}>
      <div className="flex flex-col h-screen">
        {/* 1) Header a ancho completo */}
        <Header />

        {/* 2) Debajo del header, sidebar + contenido */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-6 bg-gray-100">
            <Outlet />
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
};

export default Layout;
