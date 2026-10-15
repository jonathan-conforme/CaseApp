import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    LayoutDashboard,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Receipt,
    Coins,
    AlertTriangle,
    Wallet,
    CreditCard,
    ArrowUpRight,
    Boxes,
    FileText,
    BarChart3,
    PieChart,
    LineChart as LineChartIcon,
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Registro de componentes necesarios de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface MetricProps {
    ventas_usd_hoy: number;
    ventas_ves_hoy: number;
    costo_usd_hoy: number;
    ganancia_usd_hoy: number;
    total_transacciones_hoy: number;
    tasa_ves: number;
}

interface ArqueoItem {
    metodo_pago: string;
    total_usd: number;
    total_ves: number;
    transacciones: number;
}

interface ProductoAlert {
    id: number;
    nombre: string;
    stock_actual: number;
    stock_minimo: number;
    categoria?: { nombre: string };
}

interface VentaItem {
    id: number;
    numero: string;
    fecha_venta: string;
    total_usd: number;
    total_ves: number;
    ganancia_total_usd: number;
    metodo_pago: string;
}

interface Props {
    metrics: MetricProps;
    arqueoCaja: ArqueoItem[];
    productosBajoStock: ProductoAlert[];
    ultimasVentas: VentaItem[];
}

const METODOS_PAGO_LABEL: Record<string, string> = {
    efectivo_usd: 'Efectivo USD ($)',
    efectivo_ves: 'Efectivo VES (Bs)',
    pago_movil: 'Pago Móvil',
    zelle: 'Zelle',
    punto: 'Punto de Venta',
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ metrics, arqueoCaja = [], productosBajoStock = [], ultimasVentas = [] }: Props) {

    // ----------------------------------------------------
    // Configuración Gráfica 1: Estructura Financiera (Bar)
    // ----------------------------------------------------
    const barData = {
        labels: ['Ventas Totales', 'Costo Lotes (FIFO)', 'Ganancia Neta'],
        datasets: [
            {
                label: 'Monto USD ($)',
                data: [
                    metrics?.ventas_usd_hoy || 0,
                    metrics?.costo_usd_hoy || 0,
                    metrics?.ganancia_usd_hoy || 0,
                ],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.85)', // Emerald
                    'rgba(99, 102, 241, 0.85)', // Indigo
                    'rgba(52, 211, 153, 0.95)', // Mint Green
                ],
                borderColor: ['#10b981', '#6366f1', '#34d399'],
                borderWidth: 1.5,
                borderRadius: 8,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1200,
            easing: 'easeOutQuart' as const,
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#11212D',
                titleColor: '#CCD0CF',
                bodyColor: '#10b981',
                borderColor: '#253745',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: (context: any) => ` $${context.raw.toFixed(2)} USD`,
                },
            },
        },
        scales: {
            x: {
                grid: { color: 'rgba(37, 55, 69, 0.4)' },
                ticks: { color: '#9BA8AB', font: { size: 11 } },
            },
            y: {
                grid: { color: 'rgba(37, 55, 69, 0.4)' },
                ticks: {
                    color: '#9BA8AB',
                    font: { size: 11 },
                    callback: (value: any) => `$${value}`,
                },
            },
        },
    };

    // ----------------------------------------------------
    // Configuración Gráfica 2: Arqueo por Método de Pago (Doughnut)
    // ----------------------------------------------------
    const doughnutData = {
        labels: arqueoCaja.map((i) => METODOS_PAGO_LABEL[i.metodo_pago] || i.metodo_pago),
        datasets: [
            {
                data: arqueoCaja.map((i) => i.total_usd),
                backgroundColor: [
                    '#10b981', // Emerald
                    '#3b82f6', // Blue
                    '#8b5cf6', // Violet
                    '#f59e0b', // Amber
                    '#ec4899', // Pink
                ],
                borderColor: '#11212D',
                borderWidth: 3,
                hoverOffset: 6,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            animateScale: true,
            animateRotate: true,
            duration: 1400,
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#9BA8AB',
                    boxWidth: 12,
                    padding: 12,
                    font: { size: 11 },
                },
            },
            tooltip: {
                backgroundColor: '#11212D',
                titleColor: '#CCD0CF',
                bodyColor: '#CCD0CF',
                borderColor: '#253745',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: (context: any) => ` $${context.raw.toFixed(2)} USD`,
                },
            },
        },
        cutout: '68%',
    };

    // ----------------------------------------------------
    // Configuración Gráfica 3: Tendencia Ventas vs Ganancia (Line)
    // ----------------------------------------------------
    const ventasReversadas = [...ultimasVentas].reverse();
    const lineData = {
        labels: ventasReversadas.map((v) => v.numero),
        datasets: [
            {
                label: 'Monto Venta ($)',
                data: ventasReversadas.map((v) => v.total_usd),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
            },
            {
                label: 'Ganancia ($)',
                data: ventasReversadas.map((v) => v.ganancia_total_usd),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                fill: true,
                tension: 0.35,
                pointRadius: 4,
                pointBackgroundColor: '#10b981',
            },
        ],
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1300,
            easing: 'easeInOutCubic' as const,
        },
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'end' as const,
                labels: {
                    color: '#9BA8AB',
                    boxWidth: 10,
                    font: { size: 11 },
                },
            },
            tooltip: {
                backgroundColor: '#11212D',
                titleColor: '#CCD0CF',
                bodyColor: '#10b981',
                borderColor: '#253745',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: (context: any) => ` ${context.dataset.label}: $${context.raw.toFixed(2)}`,
                },
            },
        },
        scales: {
            x: {
                grid: { color: 'rgba(37, 55, 69, 0.4)' },
                ticks: { color: '#9BA8AB', font: { size: 10 } },
            },
            y: {
                grid: { color: 'rgba(37, 55, 69, 0.4)' },
                ticks: {
                    color: '#9BA8AB',
                    font: { size: 11 },
                    callback: (value: any) => `$${value}`,
                },
            },
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Resumen Operativo" />

            <div className="min-h-screen bg-[#06141B] text-[#CCD0CF] p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Encabezado Principal */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#253745]">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <LayoutDashboard className="w-6 h-6 text-[#9BA8AB]" />
                                <h1 className="text-2xl font-black tracking-tight text-[#CCD0CF]">
                                    Resumen Operativo
                                </h1>
                            </div>
                            <p className="text-xs text-[#9BA8AB]">
                                Métricas y ganancias calculadas en tiempo real por lotes FIFO.
                            </p>
                        </div>

                        {/* Indicador Tasa Activa */}
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#11212D] border border-[#253745] text-xs font-semibold text-[#CCD0CF]">
                            <Coins className="w-4 h-4 text-[#9BA8AB]" />
                            <span>Tasa Activa:</span>
                            <span className="text-emerald-400 font-mono font-bold">
                                {metrics?.tasa_ves > 0 ? `${metrics.tasa_ves} VES / USD` : 'Sin Tasa'}
                            </span>
                        </div>
                    </div>

                    {/* Tarjetas de Métricas Principales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* Ventas Totales */}
                        <div className="bg-[#11212D] p-5 border border-[#253745] rounded-2xl shadow-lg space-y-2 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#9BA8AB] uppercase tracking-wider">
                                    Ventas Totales Hoy
                                </span>
                                <div className="p-2 rounded-lg bg-[#253745] text-[#CCD0CF]">
                                    <DollarSign className="w-4 h-4 text-emerald-400" />
                                </div>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-white font-mono tracking-tight">
                                    ${(metrics?.ventas_usd_hoy || 0).toFixed(2)}
                                </p>
                                <p className="text-[11px] text-[#9BA8AB] font-mono font-medium mt-1">
                                    Bs. {(metrics?.ventas_ves_hoy || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        {/* Ganancia Neta */}
                        <div className="bg-[#11212D] p-5 border border-[#253745] rounded-2xl shadow-lg space-y-2 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#9BA8AB] uppercase tracking-wider">
                                    Ganancia Neta Hoy
                                </span>
                                <div className="p-2 rounded-lg bg-[#253745] text-emerald-400">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                                    ${(metrics?.ganancia_usd_hoy || 0).toFixed(2)}
                                </p>
                                <p className="text-[11px] text-emerald-400/80 font-medium mt-1 flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" />
                                    Margen Real (Venta - Costo Lote)
                                </p>
                            </div>
                        </div>

                        {/* Costo Mercancía */}
                        <div className="bg-[#11212D] p-5 border border-[#253745] rounded-2xl shadow-lg space-y-2 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#9BA8AB] uppercase tracking-wider">
                                    Costo Mercancía Vendida
                                </span>
                                <div className="p-2 rounded-lg bg-[#253745] text-[#CCD0CF]">
                                    <ShoppingBag className="w-4 h-4 text-[#9BA8AB]" />
                                </div>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-[#CCD0CF] font-mono tracking-tight">
                                    ${(metrics?.costo_usd_hoy || 0).toFixed(2)}
                                </p>
                                <p className="text-[11px] text-[#9BA8AB] font-medium mt-1">
                                    Inversión Lotes Repuestos
                                </p>
                            </div>
                        </div>

                        {/* Transacciones POS */}
                        <div className="bg-[#11212D] p-5 border border-[#253745] rounded-2xl shadow-lg space-y-2 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#9BA8AB] uppercase tracking-wider">
                                    Transacciones POS
                                </span>
                                <div className="p-2 rounded-lg bg-[#253745] text-[#CCD0CF]">
                                    <Receipt className="w-4 h-4 text-[#9BA8AB]" />
                                </div>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-white font-mono tracking-tight">
                                    {metrics?.total_transacciones_hoy || 0}
                                </p>
                                <p className="text-[11px] text-[#9BA8AB] font-medium mt-1">
                                    Tickets procesados hoy
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* ------------------------------------------------- */}
                    {/* SECCIÓN ANALÍTICA: 3 GRÁFICAS ANIMADAS CON CHART.JS */}
                    {/* ------------------------------------------------- */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Gráfica 1: Estructura Financiera */}
                        <div className="lg:col-span-4 bg-[#11212D] border border-[#253745] rounded-2xl p-5 shadow-lg space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-[#253745]">
                                <BarChart3 className="w-4 h-4 text-emerald-400" />
                                <h2 className="font-bold text-[#CCD0CF] text-xs uppercase tracking-wider">
                                    Estructura Financiera (Hoy)
                                </h2>
                            </div>
                            <div className="h-60 relative">
                                <Bar data={barData} options={barOptions} />
                            </div>
                        </div>

                        {/* Gráfica 2: Métodos de Pago */}
                        <div className="lg:col-span-4 bg-[#11212D] border border-[#253745] rounded-2xl p-5 shadow-lg space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-[#253745]">
                                <PieChart className="w-4 h-4 text-blue-400" />
                                <h2 className="font-bold text-[#CCD0CF] text-xs uppercase tracking-wider">
                                    Mezcla Métodos de Pago
                                </h2>
                            </div>
                            <div className="h-60 relative flex items-center justify-center">
                                {arqueoCaja.length === 0 ? (
                                    <p className="text-[#9BA8AB] text-xs">Sin transacciones registradas.</p>
                                ) : (
                                    <Doughnut data={doughnutData} options={doughnutOptions} />
                                )}
                            </div>
                        </div>

                        {/* Gráfica 3: Tendencia de Ventas */}
                        <div className="lg:col-span-4 bg-[#11212D] border border-[#253745] rounded-2xl p-5 shadow-lg space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-[#253745]">
                                <LineChartIcon className="w-4 h-4 text-violet-400" />
                                <h2 className="font-bold text-[#CCD0CF] text-xs uppercase tracking-wider">
                                    Evolución Ventas vs Ganancia
                                </h2>
                            </div>
                            <div className="h-60 relative">
                                {ultimasVentas.length === 0 ? (
                                    <p className="text-[#9BA8AB] text-xs text-center pt-24">Sin ventas recientes para proyectar.</p>
                                ) : (
                                    <Line data={lineData} options={lineOptions} />
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Bloque Central: Arqueo de Caja y Alertas de Stock */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Arqueo de Caja */}
                        <div className="lg:col-span-6 bg-[#11212D] border border-[#253745] rounded-2xl p-5 shadow-lg space-y-4">
                            <div className="flex justify-between items-center border-b border-[#253745] pb-3">
                                <h2 className="font-bold text-[#CCD0CF] text-sm flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-[#9BA8AB]" />
                                    Arqueo / Cierre de Caja Diario
                                </h2>
                                <span className="text-[11px] bg-[#253745] text-[#9BA8AB] px-2.5 py-0.5 rounded-full font-bold">
                                    Hoy
                                </span>
                            </div>

                            <div className="divide-y divide-[#253745]/60 text-xs">
                                {(!arqueoCaja || arqueoCaja.length === 0) ? (
                                    <p className="text-[#9BA8AB] text-center py-8">
                                        No hay registros de caja para el día de hoy.
                                    </p>
                                ) : (
                                    arqueoCaja.map((item) => (
                                        <div key={item.metodo_pago} className="py-3 flex justify-between items-center">
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-[#CCD0CF] flex items-center gap-2">
                                                    <CreditCard className="w-3.5 h-3.5 text-[#4A5C6A]" />
                                                    {METODOS_PAGO_LABEL[item.metodo_pago] || item.metodo_pago}
                                                </p>
                                                <p className="text-[#9BA8AB] text-[10px]">
                                                    {item.transacciones} {item.transacciones === 1 ? 'operación' : 'operaciones'}
                                                </p>
                                            </div>
                                            <div className="text-right space-y-0.5">
                                                <p className="font-extrabold text-white font-mono text-sm">
                                                    ${item.total_usd.toFixed(2)}
                                                </p>
                                                {metrics?.tasa_ves > 0 && (
                                                    <p className="text-[10px] text-[#9BA8AB] font-mono font-medium">
                                                        Bs. {item.total_ves.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Alertas de Bajo Stock */}
                        <div className="lg:col-span-6 bg-[#11212D] border border-[#253745] rounded-2xl p-5 shadow-lg space-y-4">
                            <div className="flex justify-between items-center border-b border-[#253745] pb-3">
                                <h2 className="font-bold text-[#CCD0CF] text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                                    Alertas de Inventario Bajo
                                </h2>
                                <span className="text-[11px] bg-rose-950/50 text-rose-300 border border-rose-800/50 font-bold px-2.5 py-0.5 rounded-full">
                                    {productosBajoStock?.length || 0} Productos
                                </span>
                            </div>

                            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 text-xs">
                                {(!productosBajoStock || productosBajoStock.length === 0) ? (
                                    <p className="text-[#9BA8AB] text-center py-8">
                                        Todo el inventario se encuentra sobre el nivel mínimo.
                                    </p>
                                ) : (
                                    productosBajoStock.map((p) => (
                                        <div
                                            key={p.id}
                                            className="p-3 border border-rose-800/40 bg-rose-950/20 rounded-xl flex justify-between items-center"
                                        >
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-[#CCD0CF]">{p.nombre}</p>
                                                <p className="text-[10px] text-[#9BA8AB] flex items-center gap-1">
                                                    <Boxes className="w-3 h-3 text-[#4A5C6A]" />
                                                    {p.categoria?.nombre || 'General'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[11px] font-black text-rose-300 bg-rose-950/60 border border-rose-800/60 px-2.5 py-1 rounded-lg">
                                                    {p.stock_actual} / Mín: {p.stock_minimo}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Últimas Ventas */}
                    <div className="bg-[#11212D] border border-[#253745] rounded-2xl p-5 shadow-lg space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-[#253745]">
                            <FileText className="w-4 h-4 text-[#9BA8AB]" />
                            <h2 className="font-bold text-[#CCD0CF] text-sm">
                                Últimas Transacciones Registradas
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#06141B] text-[#9BA8AB] border-b border-[#253745] font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="p-3.5">Ticket N°</th>
                                        <th className="p-3.5">Fecha</th>
                                        <th className="p-3.5">Método Pago</th>
                                        <th className="p-3.5 text-right">Monto USD</th>
                                        <th className="p-3.5 text-right">Ganancia USD</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#253745]/60">
                                    {(!ultimasVentas || ultimasVentas.length === 0) ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-[#9BA8AB]">
                                                Sin ventas registradas en el sistema.
                                            </td>
                                        </tr>
                                    ) : (
                                        ultimasVentas.map((v) => (
                                            <tr key={v.id} className="transition-colors hover:bg-[#253745]/30">
                                                <td className="p-3.5 font-bold font-mono text-[#CCD0CF]">
                                                    {v.numero}
                                                </td>
                                                <td className="p-3.5 text-[#9BA8AB]">
                                                    {new Date(v.fecha_venta).toLocaleString('es-VE', {
                                                        dateStyle: 'short',
                                                        timeStyle: 'short',
                                                    })}
                                                </td>
                                                <td className="p-3.5 font-medium text-[#CCD0CF]">
                                                    {METODOS_PAGO_LABEL[v.metodo_pago] || v.metodo_pago}
                                                </td>
                                                <td className="p-3.5 text-right font-bold text-white font-mono">
                                                    ${v.total_usd.toFixed(2)}
                                                </td>
                                                <td className="p-3.5 text-right font-extrabold text-emerald-400 font-mono">
                                                    +${v.ganancia_total_usd.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
