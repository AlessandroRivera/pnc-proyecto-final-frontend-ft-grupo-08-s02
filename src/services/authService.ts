import api from './api';
import endpoints from '../utils/endpoints';
import type { UsuarioLoginDTO, LoginResponse } from '../types';

interface LoginResponseAPI {
  state: boolean;
  message: string;
  result: string;      
}

export function login(creds: UsuarioLoginDTO) {
  return api.post<LoginResponseAPI>(endpoints.auth, creds);
}


