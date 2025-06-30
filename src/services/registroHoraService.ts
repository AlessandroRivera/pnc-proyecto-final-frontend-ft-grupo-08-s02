import api from './api';
import endpoints from '../utils/endpoints';
import type { RegistroDTO, RegistroHora } from '../types';

export const listarRegistros = () =>
    api.get<RegistroHora[]>(endpoints.registros);

export const listarRegistrosPorUsuarioYFechas = (
    codigoUsuario: string,
    fechaInicio: string,
    fechaFin: string
) =>
    api.get<RegistroHora[]>(
        `${endpoints.registrosByUsuarioFecha}?codigoUsuario=${codigoUsuario}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );

export const obtenerRegistro = (id: string) =>
    api.get<RegistroHora>(`${endpoints.registros}/${id}`);

export const crearRegistroHora = (data: RegistroDTO) =>
    api.post<RegistroHora>(endpoints.registros, data);

export const actualizarRegistroHora = (id: string, data: Partial<RegistroDTO>) =>
    api.put<RegistroHora>(`${endpoints.registros}/${id}`, data);

export const eliminarRegistro = (id: string) =>
    api.delete<void>(`${endpoints.registros}/${id}`);

// Nuevos endpoints para el flujo de validaciones
export const listarRegistrosPendientes = () =>
    api.get<RegistroHora[]>(`${endpoints.registros}/pendientes`);

export const listarRegistrosValidados = () =>
    api.get<RegistroHora[]>(`${endpoints.registros}/horas/validados`);

export const aprobarRegistro = (idRegistro: string) =>
    api.put<RegistroHora>(`${endpoints.registros}/${idRegistro}/aprobar`);

export const denegarRegistro = (idRegistro: string, observacion?: string) =>
    api.put<RegistroHora>(`${endpoints.registros}/${idRegistro}/denegar`, { observacion });

export const listarRegistrosPorEstado = (estado: 'PENDIENTE' | 'APROBADO' | 'DENEGADO') =>
    api.get<RegistroHora[]>(`${endpoints.registros}/estado/${estado}`);
