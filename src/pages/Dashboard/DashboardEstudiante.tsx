import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { Plus, Trash2, Edit2, Clock, AlertCircle } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import useAuth from '../../hooks/useAuth';
import { calcularHorasEfectivas } from '../../utils/timeUtils';
import { listarMateriasPorUsuario } from '../../services/usuarioMateriaService';
import { listarMaterias } from '../../services/materiaService';
import { listarActividades } from '../../services/actividadService';
import { listarFormulariosPorUsuario, crearFormulario } from '../../services/formularioService';
import {
    listarRegistrosPorUsuarioYFechas,
    crearRegistroHora,
    actualizarRegistroHora,
    eliminarRegistro,
} from '../../services/registroHoraService';
import type { Materia, RegistroHora, RegistroDTO, MateriaUsuario, Actividad, Formulario, FormularioDTO } from '../../types';
import Modal from '../../layout/Modal';

const DashboardEstudiante: React.FC = () => {
    const { user } = useAuth();
    const userId = user?.idUsuario ?? '';
    const userCode = user?.codigoUsuario ?? '';

    // Estados principales
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [formularios, setFormularios] = useState<Formulario[]>([]);
    const [registros, setRegistros] = useState<RegistroHora[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<RegistroHora | null>(null);
    const [loadingMaterias, setLoadingMaterias] = useState(true);
    const [errorMaterias, setErrorMaterias] = useState<string | null>(null);
    const [loadingRegistros, setLoadingRegistros] = useState(true);
    const [procesando, setProcesando] = useState<string | null>(null);
    const [form, setForm] = useState<{
        fechaRegistro: string;
        horaInicio: string;
        horaFin: string;
        aula: string;
        idActividad: number;
        idFormulario: number;
    }>({
        fechaRegistro: '',
        horaInicio: '',
        horaFin: '',
        aula: '',
        idActividad: 0,
        idFormulario: 0,
    });
    const [modal, setModal] = useState<{open: boolean, message: string, type?: 'success' | 'error'}>({open: false, message: '', type: 'error'});
    const [deleteModal, setDeleteModal] = useState<{open: boolean, registroId: string | null}>({open: false, registroId: null});

    // Cargo las materias asignadas al usuario
    const loadMaterias = useCallback(async () => {
        setLoadingMaterias(true);
        setErrorMaterias(null);
        
        try {
            const todasLasMateriasRes = await listarMaterias();
            const todasLasMaterias = todasLasMateriasRes.data;
            
            const materiasUsuarioRes = await listarMateriasPorUsuario(String(userId));
            const materiasUsuario = materiasUsuarioRes.data;
            
            const materiasAsignadas = todasLasMaterias.filter(materia => 
                materiasUsuario.some((m: MateriaUsuario) => m.nombreMateria === materia.nombreMateria)
            );
            
            setMaterias(materiasAsignadas);
        } catch (error) {
            console.error('Error cargando materias:', error);
            setErrorMaterias('Error al cargar las materias asignadas');
        } finally {
            setLoadingMaterias(false);
        }
    }, [userId]);

    // Cargo las actividades segun el rol del usuario
    const loadActividades = useCallback(async () => {
        try {
            const actividadesRes = await listarActividades();
            const todasLasActividades = actividadesRes.data;
            const actividadesFiltradas = todasLasActividades.filter(actividad => {
                if (user?.rol === 'INSTRUCTOR_NORMAL') {
                    return ['APOYO_PRACTICAS_LABORATORIO', 'CONSULTAS', 'APOYO_CLASE', 'APOYO_EN_PARCIAL'].includes(actividad.nombreActividad);
                } else if (user?.rol === 'INSTRUCTOR_REMUNERADO') {
                    return ['PRACTICA_LABORATORIO', 'PERMANENCIA', 'APOYO_PARCIAL', 'APOYO_INFORMATICO'].includes(actividad.nombreActividad);
                }
                return false;
            });
            setActividades(actividadesFiltradas);
        } catch (error) {
            console.error('Error cargando actividades:', error);
        }
    }, [user?.rol]);

    useEffect(() => {
        loadMaterias();
        loadActividades();
    }, [loadMaterias, loadActividades]);

    // Cargo registros y formularios del usuario
    const loadRegistrosYFormularios = useCallback(async () => {
        setLoadingRegistros(true);
        try {
            const [registrosRes, formulariosRes] = await Promise.all([
                listarRegistrosPorUsuarioYFechas(userCode, '1900-01-01', '2099-12-31'),
                listarFormulariosPorUsuario(String(userId)),
            ]);

            const pad = (n: number) => n.toString().padStart(2, '0');
            const getValue = (val: any) => Array.isArray(val) ? val[0] : val;
            
            // Formateo las fechas correctamente
            const formatFechaRegistro = (fecha: any): string => {
                if (!fecha) return '';
                
                if (typeof fecha === 'string' && fecha.includes('-')) {
                    return fecha;
                }
                
                if (typeof fecha === 'number') {
                    const date = new Date(fecha);
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                    }
                }
                
                if (fecha instanceof Date) {
                    return fecha.toISOString().split('T')[0];
                }
                
                if (typeof fecha === 'string') {
                    const date = new Date(fecha);
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                    }
                }
                
                return '';
            };

            const registrosConEstado = registrosRes.data.map(registro => {
                const formulario = formulariosRes.data.find(f => 
                    String(f.idFormulario) === String(getValue(registro.idFormulario))
                );
                
                let fechaRegistro = formatFechaRegistro(getValue(registro.fechaRegistro));

                let horaInicio = getValue(registro.horaInicio);
                if (typeof horaInicio === 'number') horaInicio = `${pad(horaInicio)}:00:00`;

                let horaFin = getValue(registro.horaFin);
                if (typeof horaFin === 'number') horaFin = `${pad(horaFin)}:00:00`;

                return {
                    ...registro,
                    idRegistro: getValue(registro.idRegistro),
                    horaInicio,
                    horaFin,
                    idActividad: getValue(registro.idActividad) || getValue(registro.actividad),
                    idFormulario: getValue(registro.idFormulario),
                    horasEfectivas: getValue(registro.horasEfectivas),
                    fechaRegistro,
                    estado: formulario ? formulario.estado : 'PENDIENTE',
                    nombreActividad: registro.nombreActividad
                } as RegistroHora;
            });
            
            const registrosPendientes = registrosConEstado.filter(registro => 
                registro.estado === 'PENDIENTE'
            );
            
            setRegistros(registrosPendientes);
            localStorage.setItem('registros', JSON.stringify(registrosConEstado));
            setFormularios(formulariosRes.data);
        } catch (error) {
            const local = localStorage.getItem('registros');
            if (local) {
                const registrosLocal = JSON.parse(local);
                const registrosPendientes = registrosLocal.filter((r: any) => r.estado === 'PENDIENTE');
                setRegistros(registrosPendientes);
            }
        } finally {
            setLoadingRegistros(false);
        }
    }, [userCode, userId]);

    useEffect(() => {
        loadRegistrosYFormularios();
    }, [loadRegistrosYFormularios]);

    // Obtengo el nombre de la actividad por ID
    const getNombreActividad = (idActividad: string | number): string => {
        const id = typeof idActividad === 'string' ? parseInt(idActividad) : idActividad;
        const actividad = actividades.find(a => String(a.idActividad) === String(id));
        return actividad ? actividad.nombreActividad : idActividad ? String(idActividad) : '—';
    };

    // Obtengo el nombre de la materia de un registro
    const getNombreMateria = (idFormulario: string): string => {
        if (!idFormulario || idFormulario === 'null' || idFormulario === 'undefined') {
            return 'Pendiente de validacion';
        }
        
        const formulario = formularios.find(f => f.idFormulario === idFormulario);
        if (formulario) {
            return `Formulario ${formulario.idFormulario} (${formulario.estado})`;
        }
        
        return `Formulario ${idFormulario}`;
    };

    // Creo o actualizo registros
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!form.idFormulario || form.idFormulario === 0) {
            setModal({open: true, message: 'Por favor selecciona una materia', type: 'error'});
            return;
        }
        
        if (!form.idActividad || form.idActividad === 0) {
            setModal({open: true, message: 'Por favor selecciona una actividad', type: 'error'});
            return;
        }
        
        if (!form.fechaRegistro || !form.horaInicio || !form.horaFin || !form.aula) {
            setModal({open: true, message: 'Por favor completa todos los campos', type: 'error'});
            return;
        }
        
        const horas = calcularHorasEfectivas(form.horaInicio, form.horaFin);

        try {
            let formularioExistente = formularios.find(f => 
                f.codigoUsuario === userCode && 
                f.estado === 'PENDIENTE'
            );

            let idFormularioParaRegistro: number;

            if (formularioExistente) {
                idFormularioParaRegistro = parseInt(formularioExistente.idFormulario);
            } else {
                const formularioDTO: FormularioDTO = {
                    fechaCreacion: new Date().toISOString().split('T')[0],
                    estado: 'PENDIENTE' as const,
                    codigoUsuario: userCode,
                    idMateria: form.idFormulario
                };

                try {
                    const formularioRes = await crearFormulario(formularioDTO);
                    idFormularioParaRegistro = parseInt(formularioRes.data.idFormulario);
                    setFormularios(prev => [...prev, formularioRes.data]);
                } catch (formularioError) {
                    console.error('Error creating formulario:', formularioError);
                    setModal({open: true, message: 'No se pudo crear un formulario. Contacta al administrador.', type: 'error'});
                    return;
                }
            }

            const dto: RegistroDTO = {
                fechaRegistro: form.fechaRegistro,
                horaInicio: form.horaInicio,
                horaFin: form.horaFin,
                horasEfectivas: horas,
                aula: form.aula,
                codigoUsuario: userCode,
                idActividad: form.idActividad,
                idFormulario: idFormularioParaRegistro,
            };

            const action = editing
                ? actualizarRegistroHora(editing.idRegistro, dto)
                : crearRegistroHora(dto);

            const res = await action;
            const saved = res.data as RegistroHora;
            
            setRegistros(prev => {
                const nuevos = editing
                        ? prev.map(r => r.idRegistro === editing.idRegistro ? saved : r)
                    : [...prev, saved];
                localStorage.setItem('registros', JSON.stringify(nuevos));
                return nuevos;
            });
            setModalOpen(false);
            setEditing(null);
            setForm({
                fechaRegistro: '',
                horaInicio: '',
                horaFin: '',
                aula: '',
                idActividad: 0,
                idFormulario: 0,
            });

            loadRegistrosYFormularios();
            
            setModal({open: true, message: editing ? '✅ Registro actualizado exitosamente' : '✅ Registro creado exitosamente. Esta pendiente de validacion por el encargado.', type: 'success'});
            
        } catch (error) {
            console.error('Error al guardar registro:', error);
            setModal({open: true, message: 'Error al guardar el registro. Por favor, intentalo de nuevo.', type: 'error'});
        }
    };

    // Confirmo la eliminacion de un registro
    const confirmDelete = (id: string) => {
        const registro = registros.find(r => r.idRegistro === id);
        if (!registro) return;
        
        if (registro.estado !== 'PENDIENTE') {
            setModal({open: true, message: '❌ Solo se pueden eliminar registros pendientes', type: 'error'});
            return;
        }
        
        setDeleteModal({open: true, registroId: id});
    };

    // Ejecuto la eliminacion del registro
    const handleDelete = async () => {
        if (!deleteModal.registroId) return;
        
        setProcesando(deleteModal.registroId);
        try {
            await eliminarRegistro(deleteModal.registroId);
            setRegistros(prev => prev.filter(r => r.idRegistro !== deleteModal.registroId));
            setModal({open: true, message: '✅ Registro eliminado exitosamente', type: 'success'});
        } catch (error) {
            console.error('Error eliminando registro:', error);
            setModal({open: true, message: '❌ Error al eliminar el registro. Por favor, intentalo de nuevo.', type: 'error'});
        } finally {
            setProcesando(null);
            setDeleteModal({open: false, registroId: null});
        }
    };

    // Edito un registro existente
    const handleEdit = (reg: RegistroHora) => {
        if (reg.estado !== 'PENDIENTE') {
            setModal({open: true, message: '❌ Solo se pueden editar registros pendientes', type: 'error'});
            return;
        }
        setEditing(reg);
        setForm({
            fechaRegistro: reg.fechaRegistro,
            horaInicio: reg.horaInicio,
            horaFin: reg.horaFin,
            aula: reg.aula,
            idActividad: reg.idActividad ? parseInt(reg.idActividad) : 0,
            idFormulario: parseInt(reg.idFormulario) || 0,
        });
        setModalOpen(true);
    };

    // Formateo las fechas para mostrar
    const formatDate = (dateString: string) => {
        if (!dateString) return '--/--/----';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return '--/--/----';
            }
            return date.toLocaleDateString('es-ES');
        } catch (error) {
            return '--/--/----';
        }
    };

    // Formateo las horas para mostrar
    const formatTime = (timeString: any) => {
        if (!timeString || typeof timeString !== 'string') return '--:--';
        return timeString.substring(0, 5);
    };

    // Obtengo el color del estado para mostrar
    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'PENDIENTE':
                return 'bg-yellow-100 text-yellow-800';
            case 'APROBADO':
                return 'bg-green-100 text-green-800';
            case 'DENEGADO':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mis Registros de Horas</h1>
                    <p className="text-gray-600">Gestiona tus registros pendientes de validación</p>
                    <div className="flex items-center gap-2 mt-2">
                        <Clock className="text-yellow-500" size={16} />
                        <span className="text-sm text-yellow-700">Solo se muestran registros pendientes</span>
                    </div>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Registro
                </button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Total de Registros</h3>
                    <p className="text-2xl font-bold text-gray-900">{registros.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Horas Totales</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {registros.reduce((total, reg) => total + (reg.horasEfectivas || 0), 0)}h
                    </p>
                </div>
            </div>

            {/* Tabla de Registros */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Registros Pendientes de Validación</h2>
                </div>
                
                {loadingRegistros ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Cargando registros...</p>
                    </div>
                ) : registros.length === 0 ? (
                    <div className="p-8 text-center">
                        <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500 mb-2">No hay registros pendientes de validación</p>
                        <p className="text-sm text-gray-400 mb-4">Los registros aprobados o rechazados se muestran en la página de Registros</p>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Crear tu primer registro
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Horario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actividad
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aula
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Horas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {registros.map((registro) => (
                                    <tr key={registro.idRegistro} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(registro.fechaRegistro)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatTime(registro.horaInicio)} - {formatTime(registro.horaFin)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {registro.nombreActividad || getNombreActividad(registro.idActividad || '')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {registro.aula}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {registro.horasEfectivas}h
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(registro.estado)}`}>
                                                {registro.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {registro.estado === 'PENDIENTE' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(registro)}
                                                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                                            title="Editar"
                                                            disabled={procesando === registro.idRegistro}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(registro.idRegistro)}
                                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                            title="Eliminar"
                                                            disabled={procesando === registro.idRegistro}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {registro.estado !== 'PENDIENTE' && (
                                                    <span className="text-gray-400 text-xs">
                                                        {registro.estado === 'APROBADO' ? '✅ Aprobado' : '❌ Denegado'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal para crear/editar registro */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black opacity-30" onClick={() => setModalOpen(false)}></div>

                        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                {editing ? 'Editar Registro' : 'Nuevo Registro de Horas'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Selector de Materia */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Materia *
                                    </label>
                                    {loadingMaterias ? (
                                        <div className="text-sm text-gray-500">Cargando materias...</div>
                                    ) : errorMaterias ? (
                                        <div className="text-sm text-red-500">{errorMaterias}</div>
                                    ) : materias.length === 0 ? (
                                        <div className="text-sm text-red-500">No tienes materias asignadas</div>
                                    ) : (
                                        <select
                                            value={form.idFormulario}
                                            onChange={(e) => setForm(prev => ({ ...prev, idFormulario: parseInt(e.target.value) }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value={0}>Selecciona una materia</option>
                                            {materias.map((materia) => (
                                                <option key={materia.idMateria} value={materia.idMateria}>
                                                    {materia.nombreMateria}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Selector de Actividad */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Actividad *
                                    </label>
                                    <select
                                        value={form.idActividad}
                                        onChange={(e) => setForm(prev => ({ ...prev, idActividad: parseInt(e.target.value) }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value={0}>Selecciona una actividad</option>
                                        {actividades.map((actividad) => (
                                            <option key={actividad.idActividad} value={actividad.idActividad}>
                                                {actividad.nombreActividad}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fecha */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha *
                                    </label>
                                    <input
                                        type="date"
                                        value={form.fechaRegistro}
                                        onChange={(e) => setForm(prev => ({ ...prev, fechaRegistro: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Horario */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hora Inicio *
                                        </label>
                                        <input
                                            type="time"
                                            value={form.horaInicio}
                                            onChange={(e) => setForm(prev => ({ ...prev, horaInicio: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Hora Fin *
                                        </label>
                                        <input
                                            type="time"
                                            value={form.horaFin}
                                            onChange={(e) => setForm(prev => ({ ...prev, horaFin: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Aula */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Aula *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.aula}
                                        onChange={(e) => setForm(prev => ({ ...prev, aula: e.target.value }))}
                                        placeholder="Ej: L-3, Aula 101"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Botones */}
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModalOpen(false);
                                            setEditing(null);
                                            setForm({
                                                fechaRegistro: '',
                                                horaInicio: '',
                                                horaFin: '',
                                                aula: '',
                                                idActividad: 0,
                                                idFormulario: 0,
                                            });
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                                    >
                                        {editing ? 'Actualizar' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <Modal open={modal.open} message={modal.message} type={modal.type} onClose={() => setModal(m => ({...m, open: false}))} />

            {/* Modal de confirmacion para eliminar */}
            <Modal
                open={deleteModal.open}
                title="Confirmar eliminacion"
                message="¿Estas seguro de que quieres eliminar este registro? Esta accion no se puede deshacer."
                type="warning"
                confirmText="Eliminar"
                onConfirm={handleDelete}
                onClose={() => setDeleteModal({open: false, registroId: null})}
            />
        </div>
    );
};

export default DashboardEstudiante;
