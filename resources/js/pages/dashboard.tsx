import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

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
    efectivo_usd: 'Efectivo USD (\$)',
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

export default function Dashboard({ metrics, arqueoCaja, productosBajoStock, ultimasVentas }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Resumen Operativo" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 md:p-6">
                
                {/* Encabezado */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">Resumen Operativo</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Métricas y ganancias calculadas en tiempo real por lotes FIFO.
                        </p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold">
                        Tasa Activa: {metrics?.tasa_ves > 0 ? `${metrics.tasa_ves} VES / USD` : 'Sin Tasa'}
                    </div>
                </div>

                {/* Tarjetas de Métricas Principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-neutral-900 p-4 border border-sidebar-border rounded-xl shadow-sm space-y-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">Ventas Totales Hoy</span>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                            \${(metrics?.ventas_usd_hoy || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Bs. {(metrics?.ventas_ves_hoy || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 p-4 border border-sidebar-border rounded-xl shadow-sm space-y-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">Ganancia Neta Hoy</span>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            \${(metrics?.ganancia_usd_hoy || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-500 font-medium">
                            Margen Real (Venta - Costo Lote)
                        </p>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 p-4 border border-sidebar-border rounded-xl shadow-sm space-y-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">Costo Mercancía Vendida</span>
                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                            \${(metrics?.costo_usd_hoy || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Inversión Lotes Repuestos
                        </p>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 p-4 border border-sidebar-border rounded-xl shadow-sm space-y-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">Transacciones POS</span>
                        <p className="text-2xl font-black text-gray-800 dark:text-gray-200">
                            {metrics?.total_transacciones_hoy || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Tickets procesados hoy
                        </p>
                    </div>
                </div>

                {/* Bloque Central: Arqueo de Caja y Alertas de Stock */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Arqueo de Caja */}
                    <div className="lg:col-span-6 bg-white dark:bg-neutral-900 border border-sidebar-border rounded-xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-sidebar-border pb-3">
                            <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Arqueo / Cierre de Caja Diario</h2>
                            <span className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-semibold">Hoy</span>
                        </div>

                        <div className="divide-y divide-sidebar-border text-xs">
                            {(!arqueoCaja || arqueoCaja.length === 0) ? (
                                <p className="text-gray-400 text-center py-6">No hay registros de caja para el día de hoy.</p>
                            ) : (
                                arqueoCaja.map((item) => (
                                    <div key={item.metodo_pago} className="py-2.5 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-gray-200">
                                                {METODOS_PAGO_LABEL[item.metodo_pago] || item.metodo_pago}
                                            </p>
                                            <p className="text-gray-400 text-[10px]">{item.transacciones} operaciones</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-extrabold text-gray-900 dark:text-white">\${item.total_usd.toFixed(2)}</p>
                                            {metrics?.tasa_ves > 0 && (
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                                                    Bs. {item.total_ves.toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Alertas de Bajo Stock */}
                    <div className="lg:col-span-6 bg-white dark:bg-neutral-900 border border-sidebar-border rounded-xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-sidebar-border pb-3">
                            <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-2">
                                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                                Alertas de Inventario Bajo
                            </h2>
                            <span className="text-xs bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 font-bold px-2 py-0.5 rounded">
                                {productosBajoStock?.length || 0} Productos
                            </span>
                        </div>

                        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 text-xs">
                            {(!productosBajoStock || productosBajoStock.length === 0) ? (
                                <p className="text-gray-400 text-center py-6">Todo el inventario se encuentra sobre el nivel mínimo.</p>
                            ) : (
                                productosBajoStock.map((p) => (
                                    <div key={p.id} className="p-2.5 border border-red-100 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-gray-200">{p.nombre}</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{p.categoria?.nombre || 'General'}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-black text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded">
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
                <div className="bg-white dark:bg-neutral-900 border border-sidebar-border rounded-xl p-5 shadow-sm space-y-3">
                    <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Últimas Transacciones Registradas</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 border-b border-sidebar-border">
                                <tr>
                                    <th className="p-2.5">Ticket N°</th>
                                    <th className="p-2.5">Fecha</th>
                                    <th className="p-2.5">Método Pago</th>
                                    <th className="p-2.5 text-right">Monto USD</th>
                                    <th className="p-2.5 text-right">Ganancia USD</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border">
                                {(!ultimasVentas || ultimasVentas.length === 0) ? (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-gray-400">Sin ventas en el sistema.</td>
                                    </tr>
                                ) : (
                                    ultimasVentas.map((v) => (
                                        <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50">
                                            <td className="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">{v.numero}</td>
                                            <td className="p-2.5 text-gray-500 dark:text-gray-400">{new Date(v.fecha_venta).toLocaleString()}</td>
                                            <td className="p-2.5 font-medium text-gray-800 dark:text-gray-200">{METODOS_PAGO_LABEL[v.metodo_pago] || v.metodo_pago}</td>
                                            <td className="p-2.5 text-right font-bold text-gray-900 dark:text-white">\${v.total_usd.toFixed(2)}</td>
                                            <td className="p-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">+\${v.ganancia_total_usd.toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}