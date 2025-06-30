import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Book, UserCheck, Clock, LogOut, FileText, CheckCircle } from 'lucide-react';
import { LayoutContext } from './Layout';
import ucaBg from '../assets/sidebar/uca.png';

const Sidebar: React.FC = () => {
    const { user, signout } = useAuth();
    const { pathname } = useLocation();
    const { collapsed } = useContext(LayoutContext);

    const isActive = (path: string) =>
        path === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(path);

    const links = user?.rol === 'ENCARGADO'
        ? [
            { to: '/dashboard', label: 'Dashboard', icon: <Book size={20} /> },
            { to: '/dashboard/validaciones', label: 'Validaciones', icon: <UserCheck size={20} /> },
            { to: '/dashboard/historico', label: 'Histórico', icon: <FileText size={20} /> },
        ]
        : [
            { to: '/dashboard', label: 'Registros Pendientes', icon: <Clock size={20} /> },
            { to: '/dashboard/registros', label: 'Registros Validados', icon: <CheckCircle size={20} /> },
        ];

    return (
        <aside
            className={`
                bg-white h-full flex flex-col shadow-lg transition-all duration-300
                ${collapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-64'}
            `}
        >
            {/* Perfil con bg + degradado */}
            <div
                className="relative h-40 bg-cover bg-center"
                style={{ backgroundImage: `url(${ucaBg})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                    <p className="font-bold">{user?.nombre}</p>
                    <p className="text-xs flex items-center gap-1">
                        <span className="material-icons text-sm">Email: </span>
                        {user?.correo}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                        {user?.rol === 'ENCARGADO' ? 'Encargado' : 'Instructor'}
                    </p>
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 mt-4">
                {links.map(({ to, label, icon }) => {
                    const active = isActive(to);
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`
                                flex items-center gap-3 px-5 py-3 text-base font-medium transition
                                ${active
                                    ? 'bg-white text-[rgb(0,60,113)] border-l-4 border-[rgb(0,60,113)]'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-[rgb(0,60,113)]'}
                            `}
                        >
                            {icon}
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;