import React from 'react';
import { useForm, usePage, Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface TasaCambio {
    id: number;
    ves_por_usd: string | number;
    fecha_vigencia: string;
    es_actual: boolean;
    notas?: string;
    creador?: {
        name: string;
    };
}

interface Props {
    tasaActual: TasaCambio | null;
    historial: TasaCambio[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tasa de Cambio',
        href: '/tasas-cambio',
    },
];

export default function Index({ tasaActual, historial = [] }: Props) {
    const { flash, errors: pageErrors } = usePage().props as any;

    const { data, setData, post, processing, errors, reset } = useForm({
        ves_por_usd: '',
        notas: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tasas-cambio.store'), {
            onSuccess: () => reset(),
        });
    };

    const handleActivar = (id: number) => {
        router.patch(route('tasas-cambio.activar', id));
    };

    const valorTasaActual = tasaActual ? Number(tasaActual.ves_por_usd) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión Tasa de Cambio (USD / VES)" />

            <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
                
                {/* Encabezado Principal */}
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                        Gestión de Tasa de Cambio (USD / VES)
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Configuración y reactivación de tasas de cambio para operaciones en el POS y compras.
                    </p>
                </div>

                {/* Banners de Notificación */}
                {flash?.message && (
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-sm font-medium">
                        ✓ {flash.message}
                    </div>
                )}
                {pageErrors?.error && (
                    <div className="p-3 bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg text-sm font-medium">
                        ⚠️ {pageErrors.error}
                    </div>
                )}

                {/* Tarjeta Tasa Activa del Día */}
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                                Tasa Activa del Día
                            </span>
                        </div>
                        <p className="text-4xl font-black tracking-tight">
                            {tasaActual
                                ? `Bs. ${valorTasaActual.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} VES`
                                : 'Sin Tasa Configurada'}
                        </p>
                    </div>
                    {tasaActual && (
                        <div className="text-left sm:text-right bg-white/10 backdrop-blur-sm px-3.5 py-2 rounded-lg border border-white/20">
                            <p className="text-[10px] text-blue-100 font-medium uppercase">Vigencia Actual</p>
                            <p className="text-xs font-bold text-white">
                                {new Date(tasaActual.fecha_vigencia).toLocaleString('es-VE', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                })}
                            </p>
                        </div>
                    )}
                </div>

                {/* Formulario Nueva Tasa */}
                <form onSubmit={handleSubmit} className="p-6 bg-white dark:bg-neutral-900 border border-sidebar-border rounded-xl shadow-sm space-y-4">
                    <div>
                        <h2 className="text-base font-bold text-gray-800 dark:text-gray-200">Actualizar Tasa de Cambio</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Puedes ingresar una nueva tasa o hacer clic en <strong>Activar</strong> en el historial para reutilizar una anterior.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                                Nueva Tasa (VES por 1 USD) *
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                min="0.01"
                                placeholder="Ej: 88.50"
                                value={data.ves_por_usd}
                                onChange={(e) => setData('ves_por_usd', e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                required
                            />
                            {errors.ves_por_usd && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.ves_por_usd}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
                                Notas (Opcional)
                            </label>
                            <input
                                type="text"
                                placeholder="Ej: Tasa BCV mañana"
                                value={data.notas}
                                onChange={(e) => setData('notas', e.target.value)}
                                className="w-full rounded-lg border-gray-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing || !data.ves_por_usd}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg disabled:opacity-50 transition-all shadow-sm"
                    >
                        {processing ? 'Guardando...' : 'Guardar Nueva Tasa'}
                    </button>
                </form>

                {/* Tabla de Historial Inmutable con Botón de Activación */}
                <div className="bg-white dark:bg-neutral-900 border border-sidebar-border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-sidebar-border flex justify-between items-center">
                        <h2 className="font-bold text-sm text-gray-800 dark:text-gray-200">Historial de Tasas</h2>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {historial.length} Registros
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 border-b border-sidebar-border font-semibold uppercase">
                                <tr>
                                    <th className="p-3">Tasa (VES)</th>
                                    <th className="p-3">Fecha de Vigencia</th>
                                    <th className="p-3">Estado</th>
                                    <th className="p-3">Notas</th>
                                    <th className="p-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border">
                                {historial.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-6 text-center text-gray-400">
                                            No hay historial de tasas registrado.
                                        </td>
                                    </tr>
                                ) : (
                                    historial.map((tasa) => {
                                        const valor = Number(tasa.ves_por_usd);
                                        return (
                                            <tr
                                                key={tasa.id}
                                                className={`transition-colors ${
                                                    tasa.es_actual
                                                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 font-bold'
                                                        : 'hover:bg-gray-50 dark:hover:bg-neutral-800/50'
                                                }`}
                                            >
                                                <td className="p-3 text-sm font-extrabold text-gray-900 dark:text-white">
                                                    Bs. {valor.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} VES
                                                </td>
                                                <td className="p-3 text-gray-600 dark:text-gray-300">
                                                    {new Date(tasa.fecha_vigencia).toLocaleString('es-VE', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short',
                                                    })}
                                                </td>
                                                <td className="p-3">
                                                    {tasa.es_actual ? (
                                                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] rounded-full border border-emerald-300 dark:border-emerald-800">
                                                            Activa
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 text-[10px] rounded-full">
                                                            Inactiva
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-gray-500 dark:text-gray-400">
                                                    {tasa.notas || '-'}
                                                </td>
                                                <td className="p-3 text-right">
                                                    {!tasa.es_actual && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleActivar(tasa.id)}
                                                            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] rounded border border-indigo-200 dark:border-indigo-800 transition-all"
                                                        >
                                                            ⚡ Activar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}