import api from './api';
import endpoints from '../utils/endpoints';
import type { Usuario, UsuarioDTO } from '../types';

// Obtener todos los usuarios
export const listarUsuarios = () => {
    return api.get<Usuario[]>(endpoints.usuarios);
};

// Crear usuario
export const crearUsuario = (dto: UsuarioDTO) => {
    return api.post<Usuario>(endpoints.saveUsuario, dto);
};

// Actualizar usuario
export const actualizarUsuario = (idUsuario: string, dto: UsuarioDTO) => {
    return api.put<Usuario>(`${endpoints.updateUsuario}/${idUsuario}`, dto);
};

// Eliminar usuario
export const eliminarUsuario = (idUsuario: string) => {
    return api.delete<void>(`${endpoints.deleteUsuario}/${idUsuario}`);
};
