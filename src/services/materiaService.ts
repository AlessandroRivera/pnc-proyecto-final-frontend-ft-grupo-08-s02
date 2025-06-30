import api from './api';
import endpoints from '../utils/endpoints';
import type { MateriaDTO, Materia } from '../types';

// Obtener todas las materias
export const listarMaterias = () => {
    return api.get<Materia[]>(endpoints.materias);
};

// Crear materia
export const crearMateria = (nombreMateria: string) => {
    return api.post<Materia>(endpoints.materias, { nombreMateria });
};

// Actualizar materia
export const actualizarMateria = (id: string, nombreMateria: string) => {
    return api.put<Materia>(`${endpoints.updateMateria}/${id}`, { nombreMateria });
};

// Eliminar materia
export const eliminarMateria = (id: string) => {
    return api.delete<void>(`${endpoints.deleteMateria}/${id}`);
};
