// Roles admitidos
export type Rol = 'ENCARGADO' | 'INSTRUCTOR_NORMAL' | 'INSTRUCTOR_REMUNERADO';

// DTO para crear/actualizar un usuario
export interface UsuarioDTO {
    codigoUsuario: string;
    nombre: string;
    apellido: string;
    correo: string;
    contrasena: string;
    rol: Rol;
}

// Usuario que viene de la API
export interface Usuario {
    idUsuario: string;
    codigoUsuario: string;
    nombre: string;
    apellido: string;
    correo: string;
    rol: Rol;
}

// Extiende Usuario con las materias asignadas (para el encargado)
export interface UsuarioConMaterias extends Usuario {
    materiaIds: string[];
}

// DTO para login
export interface UsuarioLoginDTO {
    email: string;
    password: string;
}

// Respuesta del login
export interface LoginResponse {
    token: string;
    usuario: Usuario;
}

// DTO para crear/actualizar una materia
export interface MateriaDTO {
    // El backend espera { nombre: string }
    nombreMateria: string;
}

// Materia que viene de la API
export interface Materia {
    idMateria: string;
    nombreMateria: string;
}

// Respuesta del servicio de materias por usuario
export interface MateriaUsuario {
    idUsuarioXMateria: string;
    nombreMateria: string;
    idMateria?: string;
}

// DTO para crear/actualizar una actividad
export interface ActividadDTO {
    nombreActividad: string;
    tipo: 'SOCIAL' | 'REMUNERADA';
}

// Actividad que viene de la API
export interface Actividad {
    idActividad: string;
    nombreActividad: string;
    tipo: 'SOCIAL' | 'REMUNERADA';
}

// DTO para formulario de horas (corregido según Postman)
export interface FormularioDTO {
    fechaCreacion: string;
    estado: 'PENDIENTE' | 'APROBADO' | 'DENEGADO';
    codigoUsuario: string;
    idMateria: number;
}

// Formulario que viene de la API
export interface Formulario {
    idFormulario: string;
    fechaCreacion: string;
    estado: 'PENDIENTE' | 'APROBADO' | 'DENEGADO';
    codigoUsuario: string;
    idMateria: number;
}

// DTO para registro de hora (corregido según Postman)
export interface RegistroDTO {
    fechaRegistro:  string;
    horaInicio:     string;
    horaFin:        string;
    horasEfectivas: number;
    aula:           string;
    codigoUsuario:  string;
    idFormulario:   number; // El backend siempre espera un número
    idActividad:    number;
}

// Registro de hora que viene de la API
export interface RegistroHora {
    idRegistro:     string;
    fechaRegistro:  string;
    horaInicio:     string;
    horaFin:        string;
    actividad:      string;
    aula:           string;
    horasEfectivas: number;
    estado:         'PENDIENTE' | 'APROBADO' | 'DENEGADO';
    nombreActividad:string;
    nombreMateria:  string;
    idFormulario:   string;
    codigoUsuario:  string;
    idActividad?:   string;
}

// DTO para validación de formulario
export interface ValidacionDTO {
    idFormulario: string;
    idEncargado:  string;
    estado:       'APROBADO' | 'DENEGADO';
    observacion?: string;
}

// Validación que viene de la API
export interface Validacion {
    idValidacion:   string;
    idFormulario:   string;
    idEncargado:    string;
    fechaValidacion:string;
    estado:         'APROBADO' | 'DENEGADO';
    observacion?:   string;
}
