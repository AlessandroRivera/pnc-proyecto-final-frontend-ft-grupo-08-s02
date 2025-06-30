import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, Search, Filter, Calendar } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { listarRegistrosPendientes, aprobarRegistro, denegarRegistro } from '../../services/registroHoraService';
import { listarMaterias } from '../../services/materiaService';
import { listarUsuarios } from '../../services/userService';
import type { RegistroHora, Materia, Usuario } from '../../types';
import Modal from '../../layout/Modal';

interface Filtros {
    codigo: string;
    materia: string;
    fechaInicio: string;
    fechaFin: string;
}

const ITEMS_PER_PAGE = 15;

const ValidacionesPage: React.FC = () => {
    const { user } = useAuth();
    const [registros, setRegistros] = useState<RegistroHora[]>([]);
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState<Filtros>({
        codigo: '',
        materia: '',
        fechaInicio: '',
        fechaFin: ''
    });
    const [page, setPage] = useState(1);
    const [procesando, setProcesando] = useState<string | null>(null);
    const [modal, setModal] = useState<{open: boolean, message: string, type?: 'success' | 'error'}>({open: false, message: '', type: 'success'});
    const [confirmModal, setConfirmModal] = useState<{open: boolean, action: 'aprobar' | 'denegar' | null, registroId: string | null}>({open: false, action: null, registroId: null});
    const [observacion, setObservacion] = useState('');

    // Cargo los datos iniciales
    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                const [registrosRes, materiasRes, usuariosRes] = await Promise.all([
                    listarRegistrosPendientes(),
                    listarMaterias(),
                    listarUsuarios()
                ]);
                
                setRegistros(registrosRes.data);
                setMaterias(materiasRes.data);
                setUsuarios(usuariosRes.data);
            } catch (error) {
                console.error('Error cargando datos:', error);
                setModal({open: true, message: 'No pude cargar los datos. Intenta de nuevo.', type: 'error'});
            } finally {
                setLoading(false);
            }
        };
        
        cargarDatos();
    }, []);

    // Obtengo la informacion del usuario por codigo
    const getUsuario = (codigoUsuario: string) => {
        return usuarios.find(u => u.codigoUsuario === codigoUsuario);
    };

    // Confirmo la aprobacion de un registro
    const confirmAprobar = (idRegistro: string) => {
        setConfirmModal({open: true, action: 'aprobar', registroId: idRegistro});
    };

    // Confirmo la denegacion de un registro
    const confirmDenegar = (idRegistro: string) => {
        setConfirmModal({open: true, action: 'denegar', registroId: idRegistro});
        setObservacion('');
    };

    // Ejecuto la aprobacion del registro
    const handleAprobar = async () => {
        if (!confirmModal.registroId) return;
        
        setProcesando(confirmModal.registroId);
        try {
            await aprobarRegistro(confirmModal.registroId);
            
            setRegistros(prev => prev.map(r => 
                r.idRegistro === confirmModal.registroId 
                    ? { ...r, estado: 'APROBADO' as const }
                    : r
            ));
            
            setModal({open: true, message: '✅ Registro aprobado exitosamente', type: 'success'});
        } catch (error) {
            console.error('Error aprobando registro:', error);
            setModal({open: true, message: '❌ Error al aprobar el registro', type: 'error'});
        } finally {
            setProcesando(null);
            setConfirmModal({open: false, action: null, registroId: null});
        }
    };

    // Ejecuto la denegacion del registro
    const handleDenegar = async () => {
        if (!confirmModal.registroId) return;
        
        setProcesando(confirmModal.registroId);
        try {
            await denegarRegistro(confirmModal.registroId, observacion || undefined);
            
            setRegistros(prev => prev.map(r => 
                r.idRegistro === confirmModal.registroId 
                    ? { ...r, estado: 'DENEGADO' as const }
                    : r
            ));
            
            setModal({open: true, message: '✅ Registro denegado exitosamente', type: 'success'});
        } catch (error) {
            console.error('Error denegando registro:', error);
            setModal({open: true, message: '❌ Error al denegar el registro', type: 'error'});
        } finally {
            setProcesando(null);
            setConfirmModal({open: false, action: null, registroId: null});
            setObservacion('');
        }
    };

    // Filtro los registros segun los criterios seleccionados
    const registrosFiltrados = useMemo(() => {
        return registros.filter(r => {
            const usuario = getUsuario(r.codigoUsuario);
            
            if (filtros.codigo && !r.codigoUsuario.toLowerCase().includes(filtros.codigo.toLowerCase())) {
                return false;
            }
            
            if (filtros.materia && r.nombreMateria !== filtros.materia) {
                return false;
            }
            
            if (filtros.fechaInicio && r.fechaRegistro < filtros.fechaInicio) {
                return false;
            }
            if (filtros.fechaFin && r.fechaRegistro > filtros.fechaFin) {
                return false;
            }
            
            return true;
        });
    }, [registros, filtros, usuarios]);

    // Configuracion de paginacion
    const pageCount = Math.max(1, Math.ceil(registrosFiltrados.length / ITEMS_PER_PAGE));
    const paginated = registrosFiltrados.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // Formateo las fechas para mostrar
    const formatDate = (dateString: string) => {
        if (!dateString) return '--/--/----';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES');
        } catch {
            return '--/--/----';
        }
    };

    // Formateo las horas para mostrar
    const formatTime = (timeString: string) => {
        if (!timeString) return '--:--';
        return timeString.substring(0, 5);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Cargando registros pendientes...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#003c71]">Validaciones de Registros</h2>
                <span className="text-gray-600">Usuario: <strong>{user?.nombre}</strong></span>
            </div>

            {/* Seccion de filtros */}
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-4">
                <div className="flex items-center flex-1 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#003c71] transition">
                    <Search className="text-gray-400 mr-2" />
                <input
                    type="text"
                        placeholder="Buscar por codigo..."
                        value={filtros.codigo}
                        onChange={e => { setFiltros(f => ({ ...f, codigo: e.target.value })); setPage(1); }}
                        className="w-full border-none focus:outline-none placeholder-gray-400"
                    />
                </div>

                <div className="flex items-center flex-1 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#003c71] transition">
                    <Filter className="text-gray-400 mr-2" />
                    <select
                        value={filtros.materia}
                        onChange={e => { setFiltros(f => ({ ...f, materia: e.target.value })); setPage(1); }}
                        className="w-full bg-transparent border-none focus:outline-none"
                    >
                        <option value="">Todas las materias</option>
                        {materias.map(materia => (
                            <option key={materia.idMateria} value={materia.nombreMateria}>
                                {materia.nombreMateria}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center flex-1 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#003c71] transition">
                    <Calendar className="text-gray-400 mr-2" />
                    <div className="flex flex-col w-full">
                        <label className="text-xs text-gray-500">Desde</label>
                        <input
                            type="date"
                            value={filtros.fechaInicio}
                            onChange={e => { setFiltros(f => ({ ...f, fechaInicio: e.target.value })); setPage(1); }}
                            className="w-full border-none focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center flex-1 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#003c71] transition">
                    <Calendar className="text-gray-400 mr-2" />
                    <div className="flex flex-col w-full">
                        <label className="text-xs text-gray-500">Hasta</label>
                        <input
                            type="date"
                            value={filtros.fechaFin}
                            onChange={e => { setFiltros(f => ({ ...f, fechaFin: e.target.value })); setPage(1); }}
                            className="w-full border-none focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Tabla principal de registros */}
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full text-left">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700">
                            <th className="px-4 py-2">Codigo</th>
                            <th className="px-4 py-2">Estudiante</th>
                            <th className="px-4 py-2">Materia</th>
                            <th className="px-4 py-2">Fecha</th>
                            <th className="px-4 py-2">Inicio</th>
                            <th className="px-4 py-2">Fin</th>
                            <th className="px-4 py-2">Actividad</th>
                            <th className="px-4 py-2">Aula</th>
                            <th className="px-4 py-2">Horas</th>
                            <th className="px-4 py-2">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map(r => {
                            const usuario = getUsuario(r.codigoUsuario);
                            return (
                                <tr key={r.idRegistro} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-2">{r.codigoUsuario}</td>
                                    <td className="px-4 py-2">
                                        {usuario ? `${usuario.nombre} ${usuario.apellido}` : r.codigoUsuario}
                                    </td>
                                    <td className="px-4 py-2">{r.nombreMateria || 'Sin materia asignada'}</td>
                                    <td className="px-4 py-2">{formatDate(r.fechaRegistro)}</td>
                                    <td className="px-4 py-2">{formatTime(r.horaInicio)}</td>
                                    <td className="px-4 py-2">{formatTime(r.horaFin)}</td>
                                    <td className="px-4 py-2">{r.nombreActividad}</td>
                                <td className="px-4 py-2">{r.aula}</td>
                                    <td className="px-4 py-2">{r.horasEfectivas}h</td>
                                <td className="px-4 py-2 space-x-2">
                                    <button
                                            className="text-green-600 hover:text-green-800 disabled:opacity-50"
                                            onClick={() => confirmAprobar(r.idRegistro)}
                                            disabled={procesando === r.idRegistro}
                                            title="Aprobar"
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                    <button
                                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                            onClick={() => confirmDenegar(r.idRegistro)}
                                            disabled={procesando === r.idRegistro}
                                            title="Denegar"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                </td>
                            </tr>
                            );
                        })}
                        {paginated.length === 0 && (
                            <tr>
                                <td colSpan={10} className="px-4 py-2 text-center text-gray-500">
                                    No hay registros pendientes.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Controles de paginacion */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-sm">Pagina {page} de {pageCount}</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition"
                    >
                        Anterior
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                        disabled={page === pageCount}
                        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition"
                    >
                        Siguiente
                    </button>
                </div>
            </div>

            {/* Modal para mensajes */}
            <Modal open={modal.open} message={modal.message} type={modal.type} onClose={() => setModal(m => ({...m, open: false}))} />

            {/* Modal de confirmacion para aprobar/denegar */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-6 min-w-[400px] max-w-[90vw] animate-fadeInUp">
                        <h3 className="text-lg font-bold mb-4 text-center">
                            {confirmModal.action === 'aprobar' ? 'Confirmar aprobacion' : 'Confirmar denegacion'}
                        </h3>
                        
                        {confirmModal.action === 'aprobar' ? (
                            <div className="mb-4 text-center text-blue-600">
                                ¿Estas seguro de que quieres aprobar este registro?
                            </div>
                        ) : (
                            <div className="mb-4 text-center text-red-600">
                                ¿Estas seguro de que quieres denegar este registro?
                            </div>
                        )}

                        {confirmModal.action === 'denegar' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Observacion (opcional):
                                </label>
                                <textarea
                                    value={observacion}
                                    onChange={(e) => setObservacion(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                    rows={3}
                                    placeholder="Ingresa una observacion para la denegacion..."
                                />
                            </div>
                        )}

                        <div className="flex justify-center gap-2 mt-4">
                            <button
                                className={`px-4 py-2 text-white rounded hover:opacity-90 transition ${
                                    confirmModal.action === 'aprobar' ? 'bg-green-600' : 'bg-red-600'
                                }`}
                                onClick={confirmModal.action === 'aprobar' ? handleAprobar : handleDenegar}
                            >
                                {confirmModal.action === 'aprobar' ? 'Aprobar' : 'Denegar'}
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                                onClick={() => setConfirmModal({open: false, action: null, registroId: null})}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ValidacionesPage;
