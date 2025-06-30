import api from './api';
import endpoints from '../utils/endpoints';
import type { Rol } from '../types';

export const listarRoles = () =>
    api.get<Rol[]>(endpoints.roles);

export const obtenerRol = (name: string) =>
    api.get<Rol>(`${endpoints.roles}/${name}`);
