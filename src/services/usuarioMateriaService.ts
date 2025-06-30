import api from './api';
import endpoints from '../utils/endpoints';
import type { MateriaUsuario } from '../types';

export const asociarUsuarioConMateria = (codigoUsuario: string, nombreMateria: string) =>
    api.post<void>(endpoints.usuarioMateria, { codigoUsuario, nombreMateria });

export const eliminarAsociacion = (id: string) =>
    api.delete<void>(`${endpoints.usuarioMateria}/${id}`);

export const listarMateriasPorUsuario = (idUsuario: string) =>
    api.get<MateriaUsuario[]>(`${endpoints.usuarioMateria}/usuario/${idUsuario}`);

export const listarUsuariosPorMateria = (idMateria: string) =>
    api.get<any[]>(`${endpoints.usuarioMateria}/materia/${idMateria}`);
