import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import {
    crearUsuario,
    listarUsuarios,
    actualizarUsuario,
    eliminarUsuario
} from '../../services/userService';
import {
    crearMateria,
    listarMaterias,
    actualizarMateria,
    eliminarMateria
} from '../../services/materiaService';
import {
    asociarUsuarioConMateria,
    eliminarAsociacion,
    listarMateriasPorUsuario,
    listarUsuariosPorMateria
} from '../../services/usuarioMateriaService';
import type {
    UsuarioConMaterias,
    UsuarioDTO,
    Materia,
} from '../../types';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from '../../hooks/useAuth';
import Modal from '../../layout/Modal';

const ITEMS_PER_PAGE = 10;

const DashboardEncargado: React.FC = () => {
    const { user: currentUser, updateUser } = useAuth();
    const [searchUsuario, setSearchUsuario] = useState('');
    const [userPage, setUserPage] = useState(1);
    const [usuarios, setUsuarios] = useState<UsuarioConMaterias[]>([]);

    const [modalUserOpen, setModalUserOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UsuarioConMaterias | null>(null);
    const [userForm, setUserForm] = useState<UsuarioDTO>({
        nombre: '',
        apellido: '',
        correo: '',
        contrasena: '',
        rol: 'ENCARGADO',
        codigoUsuario: ''
    });
    const [userError, setUserError] = useState<string | null>(null);

    const [materiaSearch, setMateriaSearch] = useState('');
    const [selectedMaterias, setSelectedMaterias] = useState<string[]>([]);

    const [searchMateria, setSearchMateria] = useState('');
    const [matPage, setMatPage] = useState(1);
    const [materias, setMaterias] = useState<Materia[]>([]);

    const [modalMatOpen, setModalMatOpen] = useState(false);
    const [editingMat, setEditingMat] = useState<Materia | null>(null);
    const [matForm, setMatForm] = useState<{ nombreMateria: string }>({ nombreMateria: '' });
    const [matError, setMatError] = useState<string | null>(null);

    const [modal, setModal] = useState<{open: boolean, message: string, type?: 'success' | 'error'}>({open: false, message: '', type: 'success'});
    const [confirmModal, setConfirmModal] = useState<{open: boolean, action: 'deleteUser' | 'deleteMat' | null, id: string | null, message: string}>({open: false, action: null, id: null, message: ''});

    const filteredUsuarios = useMemo(() => {
        return usuarios.filter(u =>
            (`${u.nombre} ${u.apellido}`.toLowerCase().includes(searchUsuario.toLowerCase()))
        );
    }, [usuarios, searchUsuario]);

    const userPageCount = useMemo(() => {
        return Math.ceil(filteredUsuarios.length / ITEMS_PER_PAGE) || 1;
    }, [filteredUsuarios]);

    const paginatedUsuarios = useMemo(() => {
        const start = (userPage - 1) * ITEMS_PER_PAGE;
        return filteredUsuarios.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredUsuarios, userPage]);

    const filteredMaterias = useMemo(() => {
        return materias.filter(m =>
            m.nombreMateria.toLowerCase().includes(searchMateria.toLowerCase())
        );
    }, [materias, searchMateria]);

    const matPageCount = useMemo(() => {
        return Math.ceil(filteredMaterias.length / ITEMS_PER_PAGE) || 1;
    }, [filteredMaterias]);

    const paginatedMaterias = useMemo(() => {
        const start = (matPage - 1) * ITEMS_PER_PAGE;
        return filteredMaterias.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredMaterias, matPage]);

    const fetchUsuarios = async () => {
        try {
            const res = await listarUsuarios();
            const usuariosData = res.data;

            const usuariosConMaterias = await Promise.all(
                usuariosData.map(async (u) => {
                    try {
                        const materiasRes = await listarMateriasPorUsuario(String(u.idUsuario));
                        const materiaNombres = materiasRes.data.map((m: any) => m.nombreMateria);
                        
                        return {
                            ...u,
                            materiaIds: materiaNombres
                        } as UsuarioConMaterias;
                    } catch (error) {
                        return {
                            ...u,
                            materiaIds: []
                        } as UsuarioConMaterias;
                    }
                })
            );

            setUsuarios(usuariosConMaterias);
        } catch (error) {
            toast.error('Error al cargar usuarios');
        }
    };

    const fetchMaterias = () => {
        listarMaterias()
            .then(res => setMaterias(res.data))
            .catch(() => toast.error('Error al cargar materias'));
    };

    useEffect(() => {
        fetchUsuarios();
        fetchMaterias();
    }, []);

    const handleMateriaCheckbox = (id: string) => {
        setSelectedMaterias(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleSubmitUser = async (e: FormEvent) => {
        e.preventDefault();
        setUserError(null);

        const isDuplicate = usuarios.some(u => u.codigoUsuario === userForm.codigoUsuario && (!editingUser || u.idUsuario !== editingUser.idUsuario));
        if (isDuplicate) {
            setUserError('Ya existe un usuario con ese codigo.');
            return;
        }

        const dto: UsuarioDTO = { ...userForm };
        try {
            const res = editingUser
                ? await actualizarUsuario(editingUser.idUsuario, dto)
                : await crearUsuario(dto);

            const usuarioId = res.data.idUsuario;

            if (editingUser) {
                const prev = await listarMateriasPorUsuario(String(editingUser.idUsuario));
                const prevNombres = prev.data.map((m: any) => m.nombreMateria);

                await Promise.all(
                    prevNombres
                        .filter((nombre: string) => !selectedMaterias.includes(nombre))
                        .map(nombre => {
                            const materiaToDelete = prev.data.find((m: any) => m.nombreMateria === nombre);
                            return materiaToDelete ? eliminarAsociacion(String(materiaToDelete.idUsuarioXMateria)) : Promise.resolve();
                        })
                );

                const materiasNuevas = selectedMaterias.filter(nombreMateria => !prevNombres.includes(nombreMateria));
                await Promise.all(
                    materiasNuevas.map((nombreMateria) => {
                        return asociarUsuarioConMateria(dto.codigoUsuario, nombreMateria);
                    })
                );
            } else {
                await Promise.all(
                    selectedMaterias.map((nombreMateria) => {
                        return asociarUsuarioConMateria(dto.codigoUsuario, nombreMateria);
                    })
                );
            }

            setModal({open: true, message: editingUser ? 'Usuario actualizado con exito' : 'Usuario creado exitosamente', type: 'success'});
            
            if (editingUser && currentUser && editingUser.idUsuario === currentUser.idUsuario) {
                const updatedUser = {
                    ...currentUser,
                    nombre: dto.nombre,
                    apellido: dto.apellido,
                    correo: dto.correo,
                    codigoUsuario: dto.codigoUsuario
                };
                updateUser(updatedUser);
            }

            setModalUserOpen(false);
            setEditingUser(null);
            setUserForm({
                nombre: '',
                apellido: '',
                correo: '',
                contrasena: '',
                rol: 'ENCARGADO',
                codigoUsuario: ''
            });
            setSelectedMaterias([]);
            fetchUsuarios();
        } catch (error: any) {
            setUserError(error.response?.data?.message || 'Error al guardar usuario');
        }
    };

    const openNewUser = () => {
        setEditingUser(null);
        setUserForm({
            nombre: '',
            apellido: '',
            correo: '',
            contrasena: '',
            rol: 'ENCARGADO',
            codigoUsuario: ''
        });
        setSelectedMaterias([]);
        setUserError(null);
        setModalUserOpen(true);
    };

    const openEditUser = async (u: UsuarioConMaterias) => {
        setEditingUser(u);
        setUserForm({
            nombre: u.nombre,
            apellido: u.apellido,
            correo: u.correo,
            contrasena: '',
            rol: u.rol,
            codigoUsuario: u.codigoUsuario
        });

        try {
            const materiasRes = await listarMateriasPorUsuario(String(u.idUsuario));
            const materiaNombres = materiasRes.data.map((m: any) => m.nombreMateria);
            setSelectedMaterias(materiaNombres);
        } catch (error) {
            setSelectedMaterias([]);
        }

        setUserError(null);
        setModalUserOpen(true);
    };

    const confirmDeleteUser = (idUsuario: string) => {
        setConfirmModal({
            open: true, 
            action: 'deleteUser', 
            id: idUsuario, 
            message: '¿Estas seguro de eliminar este usuario?'
        });
    };

    const handleDeleteUser = async () => {
        if (!confirmModal.id) return;
        
        try {
            await eliminarUsuario(confirmModal.id);
            setModal({open: true, message: 'Usuario eliminado correctamente', type: 'success'});
            fetchUsuarios();
        } catch (error: any) {
            console.error('Error al eliminar usuario:', error);
            
            if (error.response?.status === 409) {
                setConfirmModal({
                    open: true,
                    action: 'deleteUser',
                    id: confirmModal.id,
                    message: 'No se puede eliminar este usuario porque tiene materias asignadas. ¿Desea desasignar todas las materias y luego eliminar el usuario?'
                });
                return;
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                setModal({open: true, message: 'Sesion expirada. Por favor, inicie sesion nuevamente.', type: 'error'});
            } else {
                setModal({open: true, message: 'Error al eliminar usuario: ' + (error.response?.data?.message || error.message), type: 'error'});
            }
        } finally {
            setConfirmModal({open: false, action: null, id: null, message: ''});
        }
    };

    const handleDeleteUserWithDesasignar = async () => {
        if (!confirmModal.id) return;
        
        try {
            const materiasRes = await listarMateriasPorUsuario(confirmModal.id);
            const materiasAsignadas = materiasRes.data;
            
            await Promise.all(
                materiasAsignadas.map((materia: any) => 
                    eliminarAsociacion(String(materia.idUsuarioXMateria))
                )
            );
            
            await eliminarUsuario(confirmModal.id);
            setModal({open: true, message: 'Usuario eliminado correctamente despues de desasignar materias', type: 'success'});
            fetchUsuarios();
        } catch (desasignarError: any) {
            console.error('Error al desasignar materias:', desasignarError);
            setModal({open: true, message: 'Error al desasignar materias: ' + (desasignarError.response?.data?.message || desasignarError.message), type: 'error'});
        } finally {
            setConfirmModal({open: false, action: null, id: null, message: ''});
        }
    };

    const handleSubmitMat = (e: FormEvent) => {
        e.preventDefault();
        setMatError(null);

        const nombre = matForm.nombreMateria.trim();
        const exists = materias.some(m => m.nombreMateria.toLowerCase() === nombre.toLowerCase() && (!editingMat || m.idMateria !== editingMat.idMateria));

        if (exists) {
            setMatError('Ya existe una materia con ese nombre.');
            return;
        }

        const action = editingMat ? actualizarMateria(editingMat.idMateria, nombre) : crearMateria(nombre);
        action
            .then(() => {
                setModal({open: true, message: editingMat ? 'Materia actualizada con exito' : 'Materia creada exitosamente', type: 'success'});
                fetchMaterias();
                setModalMatOpen(false);
            })
            .catch(err => {
                setModal({open: true, message: 'Error al guardar materia', type: 'error'});
                setMatError(err.response?.data?.message || err.message);
            });
    };

    const openNewMat = () => {
        setEditingMat(null);
        setMatForm({ nombreMateria: '' });
        setMatError(null);
        setModalMatOpen(true);
    };

    const openEditMat = (m: Materia) => {
        setEditingMat(m);
        setMatForm({ nombreMateria: m.nombreMateria });
        setMatError(null);
        setModalMatOpen(true);
    };

    const confirmDeleteMat = (id: string) => {
        setConfirmModal({
            open: true, 
            action: 'deleteMat', 
            id: id, 
            message: '¿Estas seguro de eliminar esta materia?'
        });
    };

    const handleDeleteMat = async () => {
        if (!confirmModal.id) return;
        
        try {
            await eliminarMateria(confirmModal.id);
            setModal({open: true, message: 'Materia eliminada correctamente', type: 'success'});
            fetchMaterias();
        } catch (error: any) {
            console.error('Error al eliminar materia:', error);
            
            if (error.response?.status === 409) {
                setConfirmModal({
                    open: true,
                    action: 'deleteMat',
                    id: confirmModal.id,
                    message: 'No se puede eliminar esta materia porque tiene usuarios asignados. ¿Desea desasignar todos los usuarios y luego eliminar la materia?'
                });
                return;
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                setModal({open: true, message: 'Sesion expirada. Por favor, inicie sesion nuevamente.', type: 'error'});
            } else {
                setModal({open: true, message: 'Error al eliminar materia: ' + (error.response?.data?.message || error.message), type: 'error'});
            }
        } finally {
            setConfirmModal({open: false, action: null, id: null, message: ''});
        }
    };

    const handleDeleteMatWithDesasignar = async () => {
        if (!confirmModal.id) return;
        
        try {
            const usuariosRes = await listarUsuariosPorMateria(confirmModal.id);
            const usuariosAsignados = usuariosRes.data;
            
            await Promise.all(
                usuariosAsignados.map(async (usuario: any) => {
                    const materiasRes = await listarMateriasPorUsuario(String(usuario.idUsuario));
                    const materiaToDelete = materiasRes.data.find((m: any) => 
                        m.nombreMateria === materias.find(mat => String(mat.idMateria) === confirmModal.id)?.nombreMateria
                    );
                    if (materiaToDelete) {
                        return eliminarAsociacion(String(materiaToDelete.idUsuarioXMateria));
                    }
                    return Promise.resolve();
                })
            );
            
            await eliminarMateria(confirmModal.id);
            setModal({open: true, message: 'Materia eliminada correctamente despues de desasignar usuarios', type: 'success'});
            fetchMaterias();
            fetchUsuarios();
        } catch (desasignarError: any) {
            console.error('Error al desasignar usuarios:', desasignarError);
            setModal({open: true, message: 'Error al desasignar usuarios: ' + (desasignarError.response?.data?.message || desasignarError.message), type: 'error'});
        } finally {
            setConfirmModal({open: false, action: null, id: null, message: ''});
        }
    };

    const getMateriasNombres = (usuario: UsuarioConMaterias): string => {
        if (!usuario.materiaIds || usuario.materiaIds.length === 0) {
            return 'Sin materias asignadas';
        }
        
        return usuario.materiaIds.join(', ');
    };

    return (
        <div className="space-y-8 p-4">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-[#003c71]">Gestión de Usuarios</h2>
                    <button
                        onClick={openNewUser}
                        className="flex items-center gap-2 text-white bg-[#003c71] px-4 py-2 rounded hover:bg-[#002f59]"
                    >
                        <Plus size={16} /> Nuevo usuario
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Buscar usuario..."
                    className="border rounded px-3 py-2 w-full"
                    value={searchUsuario}
                    onChange={e => { setSearchUsuario(e.target.value); setUserPage(1); }}
                />

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="px-3 py-2">Nombre</th>
                                <th className="px-3 py-2">Email</th>
                                <th className="px-3 py-2">Rol</th>
                                <th className="px-3 py-2">Código</th>
                                <th className="px-3 py-2">Materias</th>
                                <th className="px-3 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsuarios.map(u => (
                                <tr key={u.idUsuario} className="border-b hover:bg-gray-50">
                                    <td className="px-3 py-2">{u.nombre} {u.apellido}</td>
                                    <td className="px-3 py-2">{u.correo}</td>
                                    <td className="px-3 py-2">{u.rol}</td>
                                    <td className="px-3 py-2">{u.codigoUsuario}</td>
                                    <td className="px-3 py-2">
                                        {getMateriasNombres(u)}
                                    </td>
                                    <td className="px-3 py-2 flex gap-2">
                                        <button onClick={() => openEditUser(u)} className="text-blue-600"><Edit2 size={16} /></button>
                                        <button onClick={() => confirmDeleteUser(String(u.idUsuario))} className="text-red-600"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                            {paginatedUsuarios.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-4 text-center text-gray-500">
                                        No hay usuarios.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <span>Página {userPage} de {userPageCount}</span>
                    <div className="flex gap-2">
                        <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1}>Anterior</button>
                        <button onClick={() => setUserPage(p => Math.min(userPageCount, p + 1))} disabled={userPage === userPageCount}>Siguiente</button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-[#003c71]">Gestión de Materias</h2>
                    <button
                        onClick={openNewMat}
                        className="flex items-center gap-2 text-white bg-[#003c71] px-4 py-2 rounded hover:bg-[#002f59]"
                    >
                        <Plus size={16} /> Nueva materia
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Buscar materia..."
                    className="border rounded px-3 py-2 w-full"
                    value={searchMateria}
                    onChange={e => { setSearchMateria(e.target.value); setMatPage(1); }}
                />

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="px-3 py-2">Nombre</th>
                                <th className="px-3 py-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedMaterias.map(m => (
                                <tr key={m.idMateria} className="border-b hover:bg-gray-50">
                                    <td className="px-3 py-2">{m.nombreMateria}</td>
                                    <td className="px-3 py-2 flex gap-2">
                                        <button onClick={() => openEditMat(m)} className="text-blue-600"><Edit2 size={16} /></button>
                                        <button onClick={() => confirmDeleteMat(String(m.idMateria))} className="text-red-600"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                            {paginatedMaterias.length === 0 && (
                                <tr>
                                    <td colSpan={2} className="py-4 text-center text-gray-500">
                                        No hay materias.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-4">
                    <span>Página {matPage} de {matPageCount}</span>
                    <div className="flex gap-2">
                        <button onClick={() => setMatPage(p => Math.max(1, p - 1))} disabled={matPage === 1}>Anterior</button>
                        <button onClick={() => setMatPage(p => Math.min(matPageCount, p + 1))} disabled={matPage === matPageCount}>Siguiente</button>
                    </div>
                </div>
            </div>

            {modalUserOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
                        <button className="absolute top-3 right-3" onClick={() => setModalUserOpen(false)}><X /></button>
                        <h3 className="text-xl font-semibold mb-4">{editingUser ? 'Editar usuario' : 'Nuevo usuario'}</h3>
                        <form onSubmit={handleSubmitUser} className="space-y-3">
                            <input type="text" placeholder="Código de usuario" value={userForm.codigoUsuario} onChange={e => setUserForm(f => ({ ...f, codigoUsuario: e.target.value }))} required className="w-full border rounded px-3 py-2" />
                            <input type="text" placeholder="Nombre" value={userForm.nombre} onChange={e => setUserForm(f => ({ ...f, nombre: e.target.value }))} required className="w-full border rounded px-3 py-2" />
                            <input type="text" placeholder="Apellido" value={userForm.apellido} onChange={e => setUserForm(f => ({ ...f, apellido: e.target.value }))} required className="w-full border rounded px-3 py-2" />
                            <input type="email" placeholder="Email" value={userForm.correo} onChange={e => setUserForm(f => ({ ...f, correo: e.target.value }))} required className="w-full border rounded px-3 py-2" />
                            <select value={userForm.rol} onChange={e => setUserForm(f => ({ ...f, rol: e.target.value as any }))} className="w-full border rounded px-3 py-2">
                                <option value="ENCARGADO">Encargado</option>
                                <option value="INSTRUCTOR_NORMAL">Instructor Social</option>
                                <option value="INSTRUCTOR_REMUNERADO">Instructor Remunerado</option>
                            </select>
                            {!editingUser ? (
                                <input type="password" placeholder="Contraseña" value={userForm.contrasena} onChange={e => setUserForm(f => ({ ...f, contrasena: e.target.value }))} required className="w-full border rounded px-3 py-2" />
                            ) : (
                                <input type="password" placeholder="Nueva contraseña (opcional)" value={userForm.contrasena} onChange={e => setUserForm(f => ({ ...f, contrasena: e.target.value }))} className="w-full border rounded px-3 py-2" />
                            )}
                            <input
                                type="text"
                                placeholder="Buscar materia..."
                                value={materiaSearch}
                                onChange={(e) => setMateriaSearch(e.target.value)}
                                className="w-full border rounded px-3 py-2 mt-4"
                            />
                            <div className="max-h-40 overflow-y-auto border rounded p-2">
                                {materias.filter((m) =>
                                    m.nombreMateria.toLowerCase().includes(materiaSearch.toLowerCase())
                                ).map((m) => (
                                    <label key={m.idMateria} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedMaterias.includes(m.nombreMateria)}
                                            value={m.nombreMateria}
                                            onChange={e => handleMateriaCheckbox(e.currentTarget.value)}
                                        />
                                        <span>{m.nombreMateria}</span>
                                    </label>
                                ))}
                            </div>
                            {userError && <p className="text-red-600 text-sm">{userError}</p>}
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Guardar</button>
                        </form>
                    </div>
                </div>
            )}

            {modalMatOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm relative">
                        <button className="absolute top-3 right-3" onClick={() => setModalMatOpen(false)}><X /></button>
                        <h3 className="text-xl font-semibold mb-4">{editingMat ? 'Editar materia' : 'Nueva materia'}</h3>
                        <form onSubmit={handleSubmitMat} className="space-y-3">
                            <input type="text" placeholder="Nombre de la materia" value={matForm.nombreMateria} onChange={e => setMatForm({ nombreMateria: e.target.value })} required className="w-full border rounded px-3 py-2" />
                            {matError && <p className="text-red-600 text-sm">{matError}</p>}
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Guardar</button>
                        </form>
                    </div>
                </div>
            )}

            <Modal open={modal.open} message={modal.message} type={modal.type} onClose={() => setModal(m => ({...m, open: false}))} />

            {/* Modal de confirmacion para eliminar */}
            {confirmModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-6 min-w-[400px] max-w-[90vw] animate-fadeInUp">
                        <h3 className="text-lg font-bold mb-4 text-center">
                            Confirmar eliminacion
                        </h3>
                        
                        <div className="mb-4 text-center text-red-600">
                            {confirmModal.message}
                        </div>

                        <div className="flex justify-center gap-2 mt-4">
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                onClick={confirmModal.action === 'deleteUser' ? 
                                    (confirmModal.message.includes('materias asignadas') ? handleDeleteUserWithDesasignar : handleDeleteUser) :
                                    (confirmModal.message.includes('usuarios asignados') ? handleDeleteMatWithDesasignar : handleDeleteMat)
                                }
                            >
                                Eliminar
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
                                onClick={() => setConfirmModal({open: false, action: null, id: null, message: ''})}
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

export default DashboardEncargado;
