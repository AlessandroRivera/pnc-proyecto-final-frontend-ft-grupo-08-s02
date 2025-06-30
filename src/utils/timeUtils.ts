/**
 * Calcula horas efectivas entre dos string "HH:MM".
 */
export function calcularHorasEfectivas(horaInicio: string, horaFin: string): number {
    const [h1, m1] = horaInicio.split(':').map(Number);
    const [h2, m2] = horaFin.split(':').map(Number);
    const inicio = h1 * 60 + m1;
    const fin = h2 * 60 + m2;
    return (fin - inicio) / 60;
}
