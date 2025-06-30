import api from './api';
import endpoints from '../utils/endpoints';
import type { FormularioDTO, Formulario } from '../types';

export const listarFormulariosPorUsuario = (idUsuario: string) =>
    api.get<Formulario[]>(`${endpoints.formulariosByUsuario}/${idUsuario}`);

export const obtenerFormulario = (id: string) =>
    api.get<Formulario>(`${endpoints.formularios}/${id}`);

export const crearFormulario = (data: FormularioDTO) =>
    api.post<Formulario>(endpoints.formularios, data);

export const actualizarFormulario = (id: string, data: FormularioDTO) =>
    api.put<Formulario>(`${endpoints.formularios}/${id}`, data);

export const eliminarFormulario = (id: string) =>
    api.delete<void>(`${endpoints.formularios}/${id}`);

export const listarFormularios = () =>
    api.get<Formulario[]>(endpoints.formularios);

