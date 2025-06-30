import api from './api';
import endpoints from '../utils/endpoints';
import type { ValidacionDTO, Validacion } from '../types';

export const listarFormulariosPendientes = () =>
    api.get<any[]>(endpoints.pendientes);

export const listarValidacionesPorEncargado = (idEncargado: string) =>
    api.get<Validacion[]>(`${endpoints.validacionesByEnc}/${idEncargado}`);

export const crearValidacion = (data: ValidacionDTO) =>
    api.post<Validacion>(endpoints.validaciones, data);

export const actualizarValidacion = (id: string, data: Partial<ValidacionDTO>) =>
    api.put<Validacion>(`${endpoints.validaciones}/${id}`, data);

export const rechazarFormulario = (idFormulario: string, observacion: string) =>
    api.post(`${endpoints.validaciones}/rechazar?idFormulario=${idFormulario}&observacion=${encodeURIComponent(observacion)}`);

export const aprobarFormulario = (idFormulario: string) =>
    api.post(`${endpoints.validaciones}/aprobar?idFormulario=${idFormulario}`);
