import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, Filter, Calendar, Search, Download } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { listarRegistrosPorUsuarioYFechas } from '../../services/registroHoraService';
import { listarFormulariosPorUsuario } from '../../services/formularioService';
import { listarMaterias } from '../../services/materiaService';
import type { RegistroHora, Formulario, Materia } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Modal from '../../layout/Modal';

interface Filtros {
    estado: 'APROBADO' | 'DENEGADO' | 'TODOS';
    materia: string;
    fechaInicio: string;
    fechaFin: string;
}

const RegistrosPage: React.FC = () => {
  const { user } = useAuth();
    const userCode = user?.codigoUsuario ?? '';
    const canFilter = /(?:INSTRUCTOR_NORMAL|INSTRUCTOR_REMUNERADO)/i.test(user?.rol ?? '');

    const [registros, setRegistros] = useState<RegistroHora[]>([]);
    const [formularios, setFormularios] = useState<Formulario[]>([]);
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState<Filtros>({
        estado: 'TODOS',
        materia: '',
        fechaInicio: '',
        fechaFin: ''
    });

    const printableRef = useRef<HTMLDivElement>(null);
    const [info, setInfo] = useState({
        nombre: user?.nombre || '',
        carrera: 'Ingenieria Informatica',
        carnet: userCode,
        telefono: '',
        proyecto: '',
        institucion: '',
        inicio: '',
    });

    const [modal, setModal] = useState<{open: boolean, message: string, type?: 'success' | 'error'}>({open: false, message: '', type: 'error'});

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [regRes, formRes, matRes] = await Promise.all([
                listarRegistrosPorUsuarioYFechas(userCode, '1900-01-01', '2099-12-31'),
                listarFormulariosPorUsuario(String(user?.idUsuario)),
                listarMaterias()
            ]);

            const registrosConEstado = regRes.data.map(reg => {
                const form = formRes.data.find(f => String(f.idFormulario) === String(reg.idFormulario));
                return { ...reg, estado: form?.estado ?? 'PENDIENTE' } as RegistroHora;
            }).filter(r => r.estado === 'APROBADO' || r.estado === 'DENEGADO');

            setRegistros(registrosConEstado);
            setFormularios(formRes.data);
            setMaterias(matRes.data);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    }, [userCode, user]);

    useEffect(() => { loadData(); }, [loadData]);

    const getMateriaNombre = (reg: RegistroHora) => {
        const form = formularios.find(f => String(f.idFormulario) === String(reg.idFormulario));
        const idMat = form?.idMateria;
        const mat = materias.find(m => String(m.idMateria) === String(idMat));
        return mat?.nombreMateria ?? 'Sin materia';
    };

    const registrosFiltrados = registros.filter(reg => {
        if (filtros.estado !== 'TODOS' && reg.estado !== filtros.estado) return false;
        if (filtros.materia && getMateriaNombre(reg) !== filtros.materia) return false;
        if (filtros.fechaInicio && reg.fechaRegistro < filtros.fechaInicio) return false;
        if (filtros.fechaFin && reg.fechaRegistro > filtros.fechaFin) return false;
        return true;
    });

    const registrosAprobados = registrosFiltrados.filter(r => r.estado === 'APROBADO');
    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('es-ES') : '--/--/----';
    const formatTime = (t: string) => t ? t.substring(0,5) : '--:--';
    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'APROBADO': return 'bg-green-100 text-green-800';
            case 'DENEGADO': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const downloadPdf = async () => {
        if (!printableRef.current) return;
        const printableElement = printableRef.current;
        const originalDisplay = printableElement.style.display;
        printableElement.style.display = 'block';
        printableElement.style.position = 'absolute';
        printableElement.style.left = '-9999px';

        try {
            // Incluir scale para controlar resolución
            const options = {
                scale: 0.75, 
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: printableElement.scrollWidth,
                height: printableElement.scrollHeight,
                scrollX: 0,
                scrollY: 0,
                windowWidth: document.documentElement.offsetWidth,
                windowHeight: document.documentElement.offsetHeight
            } as any;
            const canvas = await html2canvas(printableElement, options);

            printableElement.style.display = originalDisplay;
            printableElement.style.position = '';
            printableElement.style.left = '';

            const pdf = new jsPDF('l', 'mm', 'a4');
            const imgWidth = 297;
            const pageHeight = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`Registro_Asistencia_${info.carnet}_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error generando PDF:', error);
            setModal({open: true, message: 'Error al generar el PDF. Por favor, inténtalo de nuevo.', type: 'error'});

            printableElement.style.display = 'none';
            printableElement.style.position = '';
            printableElement.style.left = '';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Cargando registros...</span>
            </div>
        );
    }

  return (
    <>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Registros Validados</h1>
                <p className="text-gray-600">Historial de registros aprobados y rechazados</p>
            </div>
            {canFilter && registrosAprobados.length > 0 && (
                <button
                    onClick={downloadPdf}
                    className="bg-[#003c71] hover:bg-[#002f59] text-white px-4 py-2 rounded flex items-center shadow"
                >
                    <Download className="mr-2" size={16} />
                    Descargar PDF
                </button>
            )}
        </div>

        {/* Formulario instructores */}
        {canFilter && (
            <section className="bg-white p-5 rounded-xl shadow space-y-4">
                <h2 className="text-xl font-semibold text-[#003c71]">Información para Control de Asistencia</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        ['Carrera',       info.carrera,      true],
                        ['Carnet',        info.carnet,       true],
                        ['Teléfono',      info.telefono,     false],
                        ['Proyecto',      info.proyecto,     false],
                        ['Responsable',   info.institucion,  false],
                        ['Fecha inicio',  info.inicio,       false, 'date'],
                    ].map(([label, val, ro, type], i) => (
                        <div key={i} className="flex flex-col">
                            <label className="text-sm font-medium">{label}</label>
                            <input
                                type={(type as string) || 'text'}
                                value={val as string}
                                readOnly={ro as boolean}
                                onChange={e => {
                                    const v = e.target.value;
                                    const key = ((['carrera','carnet','telefono','proyecto','institucion','inicio'][i]) as keyof typeof info);
                                    setInfo(info => ({ ...info, [key]: v }));
                                }}
                                className={`w-full border rounded px-3 py-2 ${
                                    ro ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                            />
                        </div>
                    ))}
                </div>
            </section>
        )}

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-4">
            <div className="flex items-center flex-1 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#003c71]">
                <Filter className="text-gray-400 mr-2" />
                <select
                    value={filtros.estado}
                    onChange={e => setFiltros(f => ({ ...f, estado: e.target.value as any }))}
                    className="w-full bg-transparent border-none focus:outline-none"
                >
                    <option value="TODOS">Todos</option>
                    <option value="APROBADO">Aprobados</option>
                    <option value="DENEGADO">Rechazados</option>
                </select>
            </div>
            <div className="flex items-center flex-1 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#003c71]">
                <Search className="text-gray-400 mr-2" />
                <select
                    value={filtros.materia}
                    onChange={e => setFiltros(f => ({ ...f, materia: e.target.value }))}
                    className="w-full bg-transparent border-none focus:outline-none"
                >
                    <option value="">Todas las materias</option>
                    {materias.map(m => (
                        <option key={m.idMateria} value={m.nombreMateria}>{m.nombreMateria}</option>
                    ))}
                </select>
            </div>
            <div className="flex items-center flex-1 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#003c71]">
                <Calendar className="text-gray-400 mr-2" />
                <div className="flex flex-col w-full">
                    <label className="text-xs text-gray-500">Desde</label>
                    <input type="date" value={filtros.fechaInicio} onChange={e => setFiltros(f => ({ ...f, fechaInicio: e.target.value }))} className="w-full border-none focus:outline-none" />
                </div>
            </div>
            <div className="flex items-center flex-1 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#003c71]">
                <Calendar className="text-gray-400 mr-2" />
                <div className="flex flex-col w-full">
                    <label className="text-xs text-gray-500">Hasta</label>
                    <input type="date" value={filtros.fechaFin} onChange={e => setFiltros(f => ({ ...f, fechaFin: e.target.value }))} className="w-full border-none focus:outline-none" />
                </div>
            </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            {registrosFiltrados.length === 0 ? (
                <div className="p-8 text-center">
                    <CheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">No hay registros que coincidan con los filtros</p>
                </div>
            ) : (
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700">
                                <th className="px-4 py-2">Fecha</th>
                                <th className="px-4 py-2">Horario</th>
                                <th className="px-4 py-2">Materia</th>
                                <th className="px-4 py-2">Actividad</th>
                                <th className="px-4 py-2">Aula</th>
                                <th className="px-4 py-2">Horas</th>
                                <th className="px-4 py-2">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrosFiltrados.map(reg => (
                                <tr key={reg.idRegistro} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2">{formatDate(reg.fechaRegistro)}</td>
                                    <td className="px-4 py-2">{formatTime(reg.horaInicio)} - {formatTime(reg.horaFin)}</td>
                                    <td className="px-4 py-2">{getMateriaNombre(reg)}</td>
                                    <td className="px-4 py-2">{reg.nombreActividad}</td>
                                    <td className="px-4 py-2">{reg.aula}</td>
                                    <td className="px-4 py-2">{reg.horasEfectivas}h</td>
                                    <td className="px-4 py-2">
                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(reg.estado)}`}> 
                                            {reg.estado === 'APROBADO' ? <CheckCircle className="mr-1" size={12} /> : <XCircle className="mr-1" size={12} />} 
                                            {reg.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
            )}
        </div>

        {/* Zona imprimible (oculta) */}
        <div
            ref={printableRef}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            style={{ display: 'none', maxWidth: '800px', margin: '0 auto', fontSize: '11px' }}
        >
            {/* Encabezado del documento */}
            <div className="bg-[#003c71] text-white px-4 py-3 text-center" style={{fontSize: '18px'}}>
                <h1 className="font-bold mb-1" style={{fontSize: '22px'}}>UNIVERSIDAD CENTROAMERICANA</h1>
                <h2 className="font-semibold mb-0.5" style={{fontSize: '15px'}}>Registro de Asistencia y Actividades</h2>
                <p className="text-xs opacity-90" style={{fontSize: '11px'}}>Control de Horas de Servicio Social</p>
            </div>

            {/* Información del estudiante */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-20">Nombre:</span>
                            <span className="text-gray-900">{info.nombre}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-20">Carrera:</span>
                            <span className="text-gray-900">{info.carrera}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-20">Carnet:</span>
                            <span className="text-gray-900">{info.carnet}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-20">Teléfono:</span>
                            <span className="text-gray-900">{info.telefono || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-20">Proyecto:</span>
                            <span className="text-gray-900">{info.proyecto || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-20">Responsable:</span>
                            <span className="text-gray-900">{info.institucion || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-20">Fecha inicio:</span>
                            <span className="text-gray-900">{info.inicio || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-20">Materia:</span>
                            <span className="text-gray-900">{filtros.materia || 'Todas las materias'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información del período */}
            <div className="px-4 py-2 bg-white border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-600">
                        <span className="font-semibold">Período:</span> 
                        {filtros.fechaInicio && filtros.fechaFin 
                            ? ` ${new Date(filtros.fechaInicio).toLocaleDateString('es-ES')} - ${new Date(filtros.fechaFin).toLocaleDateString('es-ES')}`
                            : ' Todos los registros aprobados'
                        }
                    </div>
                    <div className="text-xs text-gray-600">
                        <span className="font-semibold">Total de horas:</span> 
                        {registrosAprobados.reduce((total, reg) => total + reg.horasEfectivas, 0)} horas
                    </div>
                </div>
            </div>

            {/* Tabla de Registros */}
            <div className="px-4 py-3">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300" style={{fontSize: '10px'}}>
                        <thead>
                            <tr className="bg-[#003c71] text-white">
                                <th className="border border-gray-300 px-2 py-1 text-left font-semibold">Fecha</th>
                                <th className="border border-gray-300 px-2 py-1 text-left font-semibold">Hora Inicio</th>
                                <th className="border border-gray-300 px-2 py-1 text-left font-semibold">Hora Fin</th>
                                <th className="border border-gray-300 px-2 py-1 text-left font-semibold">Actividad Realizada</th>
                                <th className="border border-gray-300 px-2 py-1 text-left font-semibold">Aula/Lugar</th>
                                <th className="border border-gray-300 px-2 py-1 text-center font-semibold">Horas</th>
                                <th className="border border-gray-300 px-2 py-1 text-center font-semibold">Firma Encargado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrosAprobados.length ? registrosAprobados.map((r, index) => (
                                <tr key={r.idRegistro} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="border border-gray-300 px-2 py-1 text-xs text-gray-900">{formatDate(r.fechaRegistro)}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs text-gray-900">{formatTime(r.horaInicio)}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs text-gray-900">{formatTime(r.horaFin)}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs text-gray-900">{r.nombreActividad}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs text-gray-900">{r.aula}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs text-gray-900 font-semibold text-center">{r.horasEfectivas}</td>
                                    <td className="border border-gray-300 px-2 py-1 text-xs text-gray-500 text-center">________________</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="border border-gray-300 px-2 py-4 text-center text-gray-500">
                                        No hay registros aprobados para mostrar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pie de página */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="border-t border-gray-300 pt-2">
                            <p className="text-xs text-gray-600 text-center">Firma del Estudiante</p>
                        </div>
                        <div className="border-t border-gray-300 pt-2">
                            <p className="text-xs text-gray-600 text-center">Firma del Responsable</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-xs text-gray-600">
                            <p><strong>Observaciones:</strong></p>
                            <div className="border border-gray-300 h-10 mt-1 p-1 bg-white"></div>
                        </div>
                        <div className="text-[10px] text-gray-500">
                            <p><strong>Nota:</strong> Este documento debe ser presentado al finalizar el período de servicio social.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <Modal open={modal.open} message={modal.message} type={modal.type} onClose={() => setModal(m => ({...m, open: false}))} />
  </>
  );
};

export default RegistrosPage;
