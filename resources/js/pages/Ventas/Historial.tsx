import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import {
    FileText,
    Search,
    DollarSign,
    TrendingUp,
    ShoppingBag,
    Receipt,
    Filter,
    RotateCcw,
    Eye,
    X,
    User,
    Coins,
    ArrowUpRight,
    Download,
    Building2,
    ChevronDown,
} from 'lucide-react';

interface Proveedor {
    id: number;
    nombre: string;
}

interface LoteInventario {
    id: number;
    proveedor?: Proveedor;
}

interface DetalleVentaLote {
    id: number;
    lote?: LoteInventario;
}

interface Producto {
    id: number;
    nombre: string;
}

interface DetalleVenta {
    id: number;
    cantidad: number;
    precio_unitario_usd: number;
    subtotal_usd: number;
    costo_total_usd: number;
    ganancia_usd: number;
    producto?: Producto;
    lotes_consumidos?: DetalleVentaLote[];
    lotesConsumidos?: DetalleVentaLote[];
}

interface Creador {
    id: number;
    name: string;
}

interface Venta {
    id: number;
    numero: string;
    created_at: string;
    fecha_venta?: string;
    subtotal_usd: number;
    descuento_usd: number;
    total_usd: number;
    total_ves: number;
    costo_total_usd: number;
    ganancia_total_usd: number;
    tasa_cambio_ves_por_usd: number;
    metodo_pago: string;
    creador?: Creador;
    detalles?: DetalleVenta[];
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface VentasPaginated {
    data: Venta[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
}

interface ResumenProps {
    total_ventas_usd: number;
    total_ventas_ves: number;
    costo_total_usd: number;
    ganancia_total_usd: number;
    cantidad_ventas: number;
}

interface FiltersProps {
    buscar?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    metodo_pago?: string;
}

interface Props {
    ventas: VentasPaginated;
    resumen: ResumenProps;
    filters: FiltersProps;
}

const METODOS_PAGO_LABEL: Record<string, string> = {
    efectivo_usd: 'Efectivo USD ($)',
    efectivo_ves: 'Efectivo VES (Bs)',
    pago_movil: 'Pago Móvil',
    zelle: 'Zelle',
    punto_venta: 'Punto de Venta',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Historial de Ventas', href: '/ventas/historial' },
];

export default function Historial({ ventas, resumen, filters }: Props) {
    const [formFiltros, setFormFiltros] = useState({
        buscar: filters?.buscar || '',
        fecha_inicio: filters?.fecha_inicio || '',
        fecha_fin: filters?.fecha_fin || '',
        metodo_pago: filters?.metodo_pago || '',
    });

    const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarMenuPdf, setMostrarMenuPdf] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormFiltros((prev) => ({ ...prev, [name]: value }));
    };

    const aplicarFiltros = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get('/ventas/historial', formFiltros, { preserveState: true, replace: true });
    };

    const limpiarFiltros = () => {
        const filtrosVacios = { buscar: '', fecha_inicio: '', fecha_fin: '', metodo_pago: '' };
        setFormFiltros(filtrosVacios);
        router.get('/ventas/historial', filtrosVacios, { preserveState: true, replace: true });
    };

    const abrirDetalle = (venta: Venta) => {
        setVentaSeleccionada(venta);
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setVentaSeleccionada(null);
    };

    // Extrae nombres de proveedores según los lotes FIFO
    const obtenerProveedoresDetalle = (item: DetalleVenta): string => {
        const lotes = item.lotes_consumidos || item.lotesConsumidos;
        if (!lotes || lotes.length === 0) return 'Sin Proveedor';

        const nombres = lotes
            .map((lc) => lc.lote?.proveedor?.nombre)
            .filter((nombre): nombre is string => Boolean(nombre));

        return nombres.length > 0 ? Array.from(new Set(nombres)).join(', ') : 'Sin Proveedor';
    };

    // Extrae todos los proveedores únicos de una venta completa
    const obtenerProveedoresVenta = (venta: Venta): string => {
        if (!venta.detalles || venta.detalles.length === 0) return 'Sin Proveedor';
        const proveedores = venta.detalles.map((d) => obtenerProveedoresDetalle(d)).filter((p) => p !== 'Sin Proveedor');
        return proveedores.length > 0 ? Array.from(new Set(proveedores)).join(', ') : 'Sin Proveedor';
    };

    // GENERACIÓN Y DESCARGA DIRECTA DE PDF VÍA CLIENTE JS (CON RESUMEN POR PROVEEDOR)
    const descargarPdfCliente = (periodoLabel: string) => {
        setMostrarMenuPdf(false);

        // 1. CALCULAR TOTAL DE ARTÍCULOS VENDIDOS POR PROVEEDOR (FIFO)
        const resumenProveedores: Record<string, { articulos: number; total_usd: number }> = {};

        ventas.data.forEach((v) => {
            v.detalles?.forEach((d) => {
                const lotes = d.lotes_consumidos || d.lotesConsumidos;

                if (lotes && lotes.length > 0) {
                    // Si hay lotes FIFO registrados, sumamos la cantidad exacta por proveedor
                    lotes.forEach((lc) => {
                        const nombreProv = lc.lote?.proveedor?.nombre || 'Sin Proveedor';
                        const cant = Number(lc.cantidad) || 0;
                        const precioUnit = Number(d.precio_unitario_usd) || 0;

                        if (!resumenProveedores[nombreProv]) {
                            resumenProveedores[nombreProv] = { articulos: 0, total_usd: 0 };
                        }
                        resumenProveedores[nombreProv].articulos += cant;
                        resumenProveedores[nombreProv].total_usd += cant * precioUnit;
                    });
                } else {
                    // Fallback si no hay registro de lote en la venta
                    const nombreProv = 'Sin Proveedor';
                    const cant = Number(d.cantidad) || 0;
                    const subtotal = Number(d.subtotal_usd) || 0;

                    if (!resumenProveedores[nombreProv]) {
                        resumenProveedores[nombreProv] = { articulos: 0, total_usd: 0 };
                    }
                    resumenProveedores[nombreProv].articulos += cant;
                    resumenProveedores[nombreProv].total_usd += subtotal;
                }
            });
        });

        // 2. CREAR EL CONTENEDOR HTML PARA EL PDF
        const contenedor = document.createElement('div');
        contenedor.style.padding = '24px';
        contenedor.style.fontFamily = 'Helvetica, Arial, sans-serif';
        contenedor.style.color = '#111827';
        contenedor.style.backgroundColor = '#ffffff';

        contenedor.innerHTML = `
            <!-- Encabezado -->
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
                <h2 style="margin: 0; color: #06141B; font-size: 20px; font-weight: 800;">Reporte de Ventas (${periodoLabel.toUpperCase()})</h2>
                <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 11px;">Generado el ${new Date().toLocaleString('es-VE')}</p>
            </div>

            <!-- Métricas Generales -->
            <table style="width: 100%; border-collapse: separate; border-spacing: 8px; margin-bottom: 20px;">
                <tr>
                    <td style="background: #f9fafb; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center;">
                        <div style="font-size: 9px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Ventas Totales USD</div>
                        <div style="font-size: 15px; font-weight: 800; color: #111827; margin-top: 4px;">$${(resumen?.total_ventas_usd || 0).toFixed(2)}</div>
                    </td>
                    <td style="background: #f9fafb; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center;">
                        <div style="font-size: 9px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Ventas Totales VES</div>
                        <div style="font-size: 15px; font-weight: 800; color: #2563eb; margin-top: 4px;">Bs. ${(resumen?.total_ventas_ves || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</div>
                    </td>
                    <td style="background: #f9fafb; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center;">
                        <div style="font-size: 9px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Ganancia Neta</div>
                        <div style="font-size: 15px; font-weight: 800; color: #059669; margin-top: 4px;">+$${(resumen?.ganancia_total_usd || 0).toFixed(2)}</div>
                    </td>
                    <td style="background: #f9fafb; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center;">
                        <div style="font-size: 9px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Transacciones</div>
                        <div style="font-size: 15px; font-weight: 800; color: #111827; margin-top: 4px;">${resumen?.cantidad_ventas || 0}</div>
                    </td>
                </tr>
            </table>

            <!-- NUEVA SECCIÓN: RESUMEN DE ARTÍCULOS POR PROVEEDOR -->
            <div style="margin-bottom: 24px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
                <h3 style="margin: 0 0 8px 0; color: #06141B; font-size: 12px; font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">
                    Resumen de Artículos Vendidos por Proveedor
                </h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                    <thead>
                        <tr style="color: #6b7280; text-transform: uppercase; border-bottom: 1px solid #e5e7eb;">
                            <th style="padding: 6px; text-align: left;">Proveedor</th>
                            <th style="padding: 6px; text-align: center;">Unidades Vendidas</th>
                            <th style="padding: 6px; text-align: right;">Total Recaudado (USD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(resumenProveedores).map(([prov, data]) => `
                            <tr style="border-bottom: 1px dashed #e5e7eb;">
                                <td style="padding: 6px; font-weight: 700; color: #1d4ed8;">${prov}</td>
                                <td style="padding: 6px; text-align: center; font-weight: 800; color: #111827;">${data.articulos} artículos</td>
                                <td style="padding: 6px; text-align: right; font-weight: 700; color: #059669;">$${data.total_usd.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Tabla de Transacciones -->
            <h3 style="margin: 0 0 8px 0; color: #06141B; font-size: 12px; font-weight: 800; text-transform: uppercase;">
                Detalle de Transacciones
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: left;">
                <thead>
                    <tr style="background: #06141B; color: #ffffff;">
                        <th style="padding: 8px; border: 1px solid #06141B;">Ticket N°</th>
                        <th style="padding: 8px; border: 1px solid #06141B;">Fecha</th>
                        <th style="padding: 8px; border: 1px solid #06141B;">Atendido por</th>
                        <th style="padding: 8px; border: 1px solid #06141B;">Proveedor(es)</th>
                        <th style="padding: 8px; border: 1px solid #06141B;">Método Pago</th>
                        <th style="padding: 8px; text-align: right; border: 1px solid #06141B;">Total USD</th>
                        <th style="padding: 8px; text-align: right; border: 1px solid #06141B;">Ganancia USD</th>
                    </tr>
                </thead>
                <tbody>
                    ${ventas.data.map((v, i) => `
                        <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f9fafb'}; border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 8px; font-weight: 700;">${v.numero}</td>
                            <td style="padding: 8px;">${new Date(v.created_at).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}</td>
                            <td style="padding: 8px;">${v.creador?.name || 'Sistema'}</td>
                            <td style="padding: 8px; color: #1d4ed8; font-weight: 600;">${obtenerProveedoresVenta(v)}</td>
                            <td style="padding: 8px;">${METODOS_PAGO_LABEL[v.metodo_pago] || v.metodo_pago}</td>
                            <td style="padding: 8px; text-align: right; font-weight: 700;">$${Number(v.total_usd).toFixed(2)}</td>
                            <td style="padding: 8px; text-align: right; font-weight: 800; color: #059669;">+$${Number(v.ganancia_total_usd).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        const opciones = {
            margin: 0.3,
            filename: `reporte_ventas_${periodoLabel.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
        };

        html2pdf().set(opciones).from(contenedor).save();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial y Reporte de Ventas" />

            <div className="min-h-screen bg-[#06141B] text-[#CCD0CF] p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Encabezado Principal */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#253745]">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <FileText className="w-6 h-6 text-[#9BA8AB]" />
                                <h1 className="text-2xl font-black tracking-tight text-[#CCD0CF]">
                                    Historial & Reporte de Ventas
                                </h1>
                            </div>
                            <p className="text-xs text-[#9BA8AB]">
                                Consulta transacciones finalizadas y descarga reportes PDF directamente en tu equipo.
                            </p>
                        </div>

                        {/* Menú Desplegable Descargar PDF (html2pdf.js) */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setMostrarMenuPdf(!mostrarMenuPdf)}
                                className="flex items-center cursor-pointer gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-lg shadow-emerald-950/40"
                            >
                                <Download className="w-4 h-4" />
                                <span>Descargar PDF</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {mostrarMenuPdf && (
                                <div className="absolute right-0 mt-2 w-52 bg-[#11212D] border border-[#253745] rounded-xl shadow-2xl z-50 py-1 font-medium text-xs">
                                    <button
                                        type="button"
                                        onClick={() => descargarPdfCliente('Hoy')}
                                        className="w-full text-left px-4 py-2 text-[#CCD0CF] hover:bg-[#253745] transition-colors"
                                    >
                                        Reporte de Hoy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => descargarPdfCliente('Semana')}
                                        className="w-full text-left px-4 py-2 text-[#CCD0CF] hover:bg-[#253745] transition-colors"
                                    >
                                        Reporte de la Semana
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => descargarPdfCliente('Mes')}
                                        className="w-full text-left px-4 py-2 text-[#CCD0CF] hover:bg-[#253745] transition-colors"
                                    >
                                        Reporte del Mes
                                    </button>
                                    <div className="border-t border-[#253745] my-1"></div>
                                    <button
                                        type="button"
                                        onClick={() => descargarPdfCliente('Filtros Activos')}
                                        className="w-full text-left px-4 py-2 text-emerald-400 hover:bg-[#253745] font-bold transition-colors"
                                    >
                                        PDF Tabla Actual
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tarjetas Métricas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="bg-[#11212D] p-5 border border-[#253745] rounded-2xl shadow-lg space-y-2 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#9BA8AB] uppercase tracking-wider">Ventas (USD)</span>
                                <div className="p-2 rounded-lg bg-[#253745] text-emerald-400"><DollarSign className="w-4 h-4" /></div>
                            </div>
                            <p className="text-2xl font-black text-white font-mono tracking-tight">${(resumen?.total_ventas_usd || 0).toFixed(2)}</p>
                        </div>

                        <div className="bg-[#11212D] p-5 border border-[#253745] rounded-2xl shadow-lg space-y-2 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#9BA8AB] uppercase tracking-wider">Ventas (VES)</span>
                                <div className="p-2 rounded-lg bg-[#253745] text-blue-400"><Coins className="w-4 h-4" /></div>
                            </div>
                            <p className="text-2xl font-black text-blue-400 font-mono tracking-tight">Bs. {(resumen?.total_ventas_ves || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</p>
                        </div>

                        <div className="bg-[#11212D] p-5 border border-[#253745] rounded-2xl shadow-lg space-y-2 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#9BA8AB] uppercase tracking-wider">Costo Lotes FIFO</span>
                                <div className="p-2 rounded-lg bg-[#253745] text-[#9BA8AB]"><ShoppingBag className="w-4 h-4" /></div>
                            </div>
                            <p className="text-2xl font-black text-[#CCD0CF] font-mono tracking-tight">${(resumen?.costo_total_usd || 0).toFixed(2)}</p>
                        </div>

                        <div className="bg-[#11212D] p-5 border border-[#253745] rounded-2xl shadow-lg space-y-2 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#9BA8AB] uppercase tracking-wider">Ganancia Neta</span>
                                <div className="p-2 rounded-lg bg-[#253745] text-emerald-400"><TrendingUp className="w-4 h-4" /></div>
                            </div>
                            <p className="text-2xl font-black text-emerald-400 font-mono tracking-tight">${(resumen?.ganancia_total_usd || 0).toFixed(2)}</p>
                        </div>

                        <div className="bg-[#11212D] p-5 border border-[#253745] rounded-2xl shadow-lg space-y-2 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#9BA8AB] uppercase tracking-wider">Transacciones</span>
                                <div className="p-2 rounded-lg bg-[#253745] text-[#CCD0CF]"><Receipt className="w-4 h-4" /></div>
                            </div>
                            <p className="text-2xl font-black text-white font-mono tracking-tight">{resumen?.cantidad_ventas || 0}</p>
                        </div>
                    </div>

                    {/* Barra de Filtros */}
                    <form onSubmit={aplicarFiltros} className="bg-[#11212D] border border-[#253745] rounded-2xl p-5 shadow-lg space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-[#253745]">
                            <Filter className="w-4 h-4 text-emerald-400" />
                            <h2 className="font-bold text-[#CCD0CF] text-xs uppercase tracking-wider">Filtros de Búsqueda</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-[#9BA8AB] uppercase tracking-wider">N° Ticket</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="buscar"
                                        value={formFiltros.buscar}
                                        onChange={handleChange}
                                        placeholder="Ej: VEN-2026..."
                                        className="w-full bg-[#06141B] border border-[#253745] rounded-xl px-3 py-2 text-xs text-[#CCD0CF] placeholder-[#9BA8AB]/50 focus:outline-none font-mono"
                                    />
                                    <Search className="w-3.5 h-3.5 text-[#9BA8AB] absolute right-3 top-2.5" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-[#9BA8AB] uppercase tracking-wider">Fecha Desde</label>
                                <input
                                    type="date"
                                    name="fecha_inicio"
                                    value={formFiltros.fecha_inicio}
                                    onChange={handleChange}
                                    className="w-full bg-[#06141B] border border-[#253745] rounded-xl px-3 py-2 text-xs text-[#CCD0CF] focus:outline-none font-mono"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-[#9BA8AB] uppercase tracking-wider">Fecha Hasta</label>
                                <input
                                    type="date"
                                    name="fecha_fin"
                                    value={formFiltros.fecha_fin}
                                    onChange={handleChange}
                                    className="w-full bg-[#06141B] border border-[#253745] rounded-xl px-3 py-2 text-xs text-[#CCD0CF] focus:outline-none font-mono"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-[#9BA8AB] uppercase tracking-wider">Método de Pago</label>
                                <select
                                    name="metodo_pago"
                                    value={formFiltros.metodo_pago}
                                    onChange={handleChange}
                                    className="cursor-pointer w-full bg-[#06141B] border border-[#253745] rounded-xl px-3 py-2 text-xs text-[#CCD0CF] focus:outline-none"
                                >

                                    <option value="">Todos los métodos</option>
                                    <option value="efectivo_usd">Efectivo USD ($)</option>
                                    <option value="efectivo_ves">Efectivo VES (Bs)</option>
                                    <option value="pago_movil">Pago Móvil</option>
                                    <option value="punto_venta">Punto de Venta</option>
                                    <option value="zelle">Zelle</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-[#253745]/60">
                            <button
                                type="button"
                                onClick={limpiarFiltros}
                                className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#CCD0CF] bg-[#253745] hover:bg-[#253745]/80 rounded-xl transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Limpiar
                            </button>
                            <button
                                type="submit"
                                className="cursor-pointer flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-lg shadow-emerald-950/40"
                            >
                                <Filter className="w-3.5 h-3.5" /> Aplicar Filtros
                            </button>
                        </div>
                    </form>

                    {/* Tabla de Ventas */}
                    <div className="bg-[#11212D] border border-[#253745] rounded-2xl shadow-lg overflow-hidden space-y-4 p-5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#06141B] text-[#9BA8AB] border-b border-[#253745] font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="p-3.5">Ticket N°</th>
                                        <th className="p-3.5">Fecha</th>
                                        <th className="p-3.5">Atendido por</th>
                                        <th className="p-3.5">Método Pago</th>
                                        <th className="p-3.5 text-right">Monto USD</th>
                                        <th className="p-3.5 text-right">Monto VES</th>
                                        <th className="p-3.5 text-right">Ganancia</th>
                                        <th className="p-3.5 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#253745]/60">
                                    {(!ventas?.data || ventas.data.length === 0) ? (
                                        <tr>
                                            <td colSpan={8} className="p-8 text-center text-[#9BA8AB]">
                                                No se encontraron ventas que coincidan con los criterios.
                                            </td>
                                        </tr>
                                    ) : (
                                        ventas.data.map((venta) => (
                                            <tr key={venta.id} className="transition-colors hover:bg-[#253745]/30">
                                                <td className="p-3.5 font-bold font-mono text-white">{venta.numero}</td>
                                                <td className="p-3.5 text-[#9BA8AB]">
                                                    {new Date(venta.created_at || venta.fecha_venta || '').toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                                <td className="p-3.5 text-[#CCD0CF]">
                                                    <span className="flex items-center gap-1.5"><User className="w-3 h-3 text-[#9BA8AB]" />{venta.creador?.name || 'Sistema'}</span>
                                                </td>
                                                <td className="p-3.5 font-medium text-[#CCD0CF]">
                                                    <span className="px-2.5 py-1 text-[10px] rounded-full bg-[#253745] text-[#CCD0CF] font-semibold">
                                                        {METODOS_PAGO_LABEL[venta.metodo_pago] || venta.metodo_pago}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 text-right font-bold text-white font-mono">${(Number(venta.total_usd) || 0).toFixed(2)}</td>
                                                <td className="p-3.5 text-right font-mono text-blue-400 font-medium">Bs. {(Number(venta.total_ves) || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                                                <td className="p-3.5 text-right font-extrabold text-emerald-400 font-mono">+${(Number(venta.ganancia_total_usd) || 0).toFixed(2)}</td>
                                                <td className="p-3.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => abrirDetalle(venta)}
                                                        className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 bg-[#253745] hover:bg-emerald-950/40 border border-emerald-500/30 rounded-lg transition-colors"
                                                    >
                                                        <Eye className="w-3 h-3" /> Detalle
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación */}
                        <div className="pt-3 border-t border-[#253745] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9BA8AB]">
                            <p>Mostrando <span className="font-bold text-white font-mono">{ventas?.from || 0}</span> a <span className="font-bold text-white font-mono">{ventas?.to || 0}</span> de <span className="font-bold text-white font-mono">{ventas?.total || 0}</span> resultados</p>
                            <div className="flex gap-1 flex-wrap">
                                {ventas?.links?.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                            link.active ? 'bg-emerald-600 text-white shadow-md' : link.url ? 'bg-[#253745] text-[#CCD0CF] hover:bg-[#253745]/80' : 'text-[#9BA8AB]/40 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Modal Detalle de Venta */}
                    {mostrarModal && ventaSeleccionada && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                            <div className="bg-[#11212D] border border-[#253745] rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex justify-between items-center border-b border-[#253745] pb-3">
                                    <div className="space-y-0.5">
                                        <h3 className="text-lg font-black text-white font-mono flex items-center gap-2">
                                            <Receipt className="w-5 h-5 text-emerald-400" />
                                            Venta {ventaSeleccionada.numero}
                                        </h3>
                                        <p className="text-xs text-[#9BA8AB]">
                                            Desglose de productos e identificación de proveedor por lotes FIFO.
                                        </p>
                                    </div>
                                    <button type="button" onClick={cerrarModal} className="p-1.5 text-[#9BA8AB] hover:text-white hover:bg-[#253745] rounded-xl transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3 text-xs bg-[#06141B] p-3.5 rounded-xl border border-[#253745]">
                                        <div>
                                            <span className="text-[#9BA8AB] block text-[10px] uppercase font-bold">Atendido Por</span>
                                            <span className="font-semibold text-white">{ventaSeleccionada.creador?.name || 'Sistema'}</span>
                                        </div>
                                        <div>
                                            <span className="text-[#9BA8AB] block text-[10px] uppercase font-bold">Tasa Aplicada</span>
                                            <span className="font-mono font-semibold text-emerald-400">
                                                {ventaSeleccionada.tasa_cambio_ves_por_usd ? `${ventaSeleccionada.tasa_cambio_ves_por_usd} VES / USD` : 'Sin Tasa'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tabla de Productos con Proveedores */}
                                    <div className="overflow-x-auto rounded-xl border border-[#253745]">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-[#06141B] text-[#9BA8AB] uppercase text-[10px] font-bold tracking-wider">
                                                <tr>
                                                    <th className="p-3">Producto</th>
                                                    <th className="p-3">Proveedor Lote</th>
                                                    <th className="p-3 text-center">Cant.</th>
                                                    <th className="p-3 text-right">P. Unit USD</th>
                                                    <th className="p-3 text-right">Subtotal USD</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#253745]/60 bg-[#11212D]">
                                                {ventaSeleccionada.detalles?.map((item) => (
                                                    <tr key={item.id} className="hover:bg-[#253745]/20">
                                                        <td className="p-3 font-medium text-[#CCD0CF]">
                                                            {item.producto?.nombre || 'Producto'}
                                                        </td>
                                                        <td className="p-3 text-[#CCD0CF]">
                                                            <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                                                                <Building2 className="w-3.5 h-3.5 text-[#9BA8AB]" />
                                                                {obtenerProveedoresDetalle(item)}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center font-mono font-bold text-white">
                                                            {item.cantidad}
                                                        </td>
                                                        <td className="p-3 text-right font-mono text-[#CCD0CF]">
                                                            ${(Number(item.precio_unitario_usd) || 0).toFixed(2)}
                                                        </td>
                                                        <td className="p-3 text-right font-mono font-bold text-white">
                                                            ${(Number(item.subtotal_usd) || 0).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="border-t border-[#253745] pt-3 space-y-1 text-right text-xs">
                                        <p className="text-[#9BA8AB]">Subtotal: <span className="font-mono text-white font-semibold">${(Number(ventaSeleccionada.subtotal_usd) || 0).toFixed(2)}</span></p>
                                        <p className="text-[#9BA8AB]">Descuento: <span className="font-mono text-white font-semibold">${(Number(ventaSeleccionada.descuento_usd) || 0).toFixed(2)}</span></p>
                                        <div className="pt-2 flex justify-between items-center text-sm">
                                            <span className="text-emerald-400 text-xs font-bold font-mono">
                                                Ganancia: +${(Number(ventaSeleccionada.ganancia_total_usd) || 0).toFixed(2)} USD
                                            </span>
                                            <span className="text-lg font-black text-white font-mono">
                                                Total: ${(Number(ventaSeleccionada.total_usd) || 0).toFixed(2)} USD
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2 border-t border-[#253745]">
                                    <button type="button" onClick={cerrarModal} className="cursor-pointer px-4 py-2 bg-[#253745] text-white hover:bg-[#253745]/80 rounded-xl text-xs font-bold transition-colors">
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
