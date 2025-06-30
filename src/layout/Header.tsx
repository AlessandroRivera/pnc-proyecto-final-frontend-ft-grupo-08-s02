import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, UserCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useLayout from '../hooks/useLayout';
import useAuth from '../hooks/useAuth';

interface RegistroLocal {
    id: number;
    estudianteId: string;
    estado: 'PENDIENTE' | 'APROBADO' | 'DENEGADO';
}

const Header: React.FC = () => {
    const { toggleSidebar } = useLayout();
    const { user, signout } = useAuth();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState<RegistroLocal[]>([]);
    const [showNotif, setShowNotif] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const notifRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    // Carga y refresca notificaciones
    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('registros') || '[]') as RegistroLocal[];
        let nots: RegistroLocal[];
        if (user?.rol === 'ENCARGADO') {
            nots = data.filter(r => r.estado === 'PENDIENTE');
        } else {
            nots = data.filter(r => r.estudianteId === user?.nombre && r.estado !== 'PENDIENTE');
        }
        setNotifications(nots);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
            if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (id: number) => {
        // Marcar como visto (remover de lista)
        setNotifications(prev => prev.filter(n => n.id !== id));
        const seen = JSON.parse(localStorage.getItem('seenNotificaciones') || '[]');
        localStorage.setItem('seenNotificaciones', JSON.stringify([...seen, id]));

        setShowNotif(false);
        if (user?.rol === 'ENCARGADO') {
            navigate('/dashboard/validaciones');
        } else {
            navigate('/dashboard/registros');
        }
    };

    // Filtrar ya vistas
    const filteredNotifications = notifications.filter(n => {
        const seen = JSON.parse(localStorage.getItem('seenNotificaciones') || '[]');
        return !seen.includes(n.id);
    });

    return (
        <header className="sticky top-0 z-20 w-full bg-[rgb(0,60,113)] text-white shadow flex items-center justify-between px-6 py-3">
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="p-2 hover:bg-white/20 rounded-full transition">
                    <Menu size={24} />
                </button>
                <h1 className="ml-4 text-xl font-semibold">REHOSAR</h1>
            </div>

            <div className="flex items-center space-x-3">
                {/* Notificaciones */}
                <div className="relative" ref={notifRef}>
                    <button onClick={() => setShowNotif(v => !v)} className="relative p-2 hover:bg-white/20 rounded-full transition">
                        <Bell size={24} />
                        {filteredNotifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
                                {filteredNotifications.length}
                            </span>
                        )}
                    </button>
                    {showNotif && (
                        <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-lg shadow-lg overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-[rgb(0,60,113)] text-white">
                                <span className="font-semibold">Notificaciones</span>
                                <button onClick={() => setShowNotif(false)} className="hover:opacity-80"><XCircle size={18} /></button>
                            </div>
                            <ul className="max-h-60 overflow-y-auto">
                                {filteredNotifications.map(n => (
                                    <li
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n.id)}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition cursor-pointer"
                                    >
                                        {user?.rol === 'ENCARGADO' ? (
                                            <Clock className="text-blue-600" size={20} />
                                        ) : n.estado === 'APROBADO' ? (
                                            <CheckCircle2 className="text-green-600" size={20} />
                                        ) : (
                                            <XCircle className="text-red-600" size={20} />
                                        )}
                                        <div className="flex-1 text-sm">
                                            {user?.rol === 'ENCARGADO'
                                                ? `Registro ${n.estudianteId} pendiente`
                                                : `Tu registro fue ${n.estado.toLowerCase()}`}
                                        </div>
                                        <span className="text-xs text-gray-500">Ver</span>
                                    </li>
                                ))}
                                {filteredNotifications.length === 0 && (
                                    <li className="px-4 py-3 text-center text-gray-500">Sin notificaciones nuevas</li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Usuario */}
                <div className="relative" ref={userRef}>
                    <button onClick={() => setShowUserMenu(v => !v)} className="p-2 hover:bg-white/20 rounded-full transition">
                        <UserCircle size={24} />
                    </button>
                    {showUserMenu && (
                        <div className="absolute right-0 mt-3 w-48 bg-white text-black rounded-lg shadow-lg overflow-hidden">
                            <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                                <UserCircle size={25} className="text-gray-600" />
                                <div className="flex flex-col text-sm">
                                    <span className="font-medium text-gray-800">{user?.nombre}</span>
                                    <span className="text-gray-600 break-all text-xs">{user?.correo}</span>
                                </div>
                            </div>
                            <button onClick={signout} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition">
                                <XCircle size={16} className="text-red-600" />
                                <span className="text-sm text-red-600">Cerrar sesión</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;