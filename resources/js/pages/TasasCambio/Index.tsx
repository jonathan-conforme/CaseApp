import React, { useState, useMemo } from 'react';
import { useForm, usePage, Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import {
    Plus,
    Zap,
    CheckCircle2,
    AlertCircle,
    X,
    Calendar,
    TrendingUp,
    FileText,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    Coins,
} from 'lucide-react';

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
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Formulario gestionado por Inertia
    const { data, setData, post, processing, errors, reset } = useForm({
        ves_por_usd: '',
        notas: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('tasas-cambio.store'), {
            onSuccess: () => {
                reset();
                setIsModalOpen(false);
            },
        });
    };

    const handleActivar = (id: number) => {
        router.patch(route('tasas-cambio.activar', id));
    };

    const valorTasaActual = tasaActual ? Number(tasaActual.ves_por_usd) : 0;

    // Configuración de columnas para TanStack Table
    const columnHelper = createColumnHelper<TasaCambio>();

    const columns = useMemo(
        () => [
            columnHelper.accessor('ves_por_usd', {
                header: 'Tasa (VES)',
                cell: (info) => {
                    const valor = Number(info.getValue());
                    const isActual = info.row.original.es_actual;
                    return (
                        <div className="flex items-center gap-2.5">
                            <div
                                className={`p-2 rounded-lg ${
                                    isActual
                                        ? 'bg-[#253745] text-[#CCD0CF]'
                                        : 'bg-[#11212D] text-[#9BA8AB]'
                                }`}
                            >
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <span
                                className={`font-mono text-sm font-bold tracking-wide ${
                                    isActual ? 'text-white' : 'text-[#CCD0CF]'
                                }`}
                            >
                                Bs. {valor.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} VES
                            </span>
                        </div>
                    );
                },
            }),
            columnHelper.accessor('fecha_vigencia', {
                header: 'Fecha de Vigencia',
                cell: (info) => (
                    <div className="flex items-center gap-2 text-xs text-[#9BA8AB]">
                        <Calendar className="w-3.5 h-3.5 text-[#4A5C6A]" />
                        <span>
                            {new Date(info.getValue()).toLocaleString('es-VE', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })}
                        </span>
                    </div>
                ),
            }),
            columnHelper.accessor('es_actual', {
                header: 'Estado',
                cell: (info) =>
                    info.getValue() ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#253745] text-[#CCD0CF] border border-[#4A5C6A]/50">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Activa
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#06141B]/60 text-[#9BA8AB] border border-[#253745]">
                            Inactiva
                        </span>
                    ),
            }),
            columnHelper.accessor('notas', {
                header: 'Notas',
                cell: (info) => {
                    const notas = info.getValue();
                    return (
                        <span className="text-xs text-[#9BA8AB] italic flex items-center gap-1.5">
                            {notas ? (
                                <>
                                    <FileText className="w-3.5 h-3.5 text-[#4A5C6A] shrink-0" />
                                    <span>{notas}</span>
                                </>
                            ) : (
                                '-'
                            )}
                        </span>
                    );
                },
            }),
            columnHelper.display({
                id: 'acciones',
                header: () => <div className="text-right">Acción</div>,
                cell: (info) => {
                    const tasa = info.row.original;
                    if (tasa.es_actual) return null;
                    return (
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => handleActivar(tasa.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#253745] hover:bg-[#4A5C6A] text-[#CCD0CF] hover:text-white border border-[#4A5C6A]/40 transition-all shadow-xs active:scale-95 cursor-pointer"
                            >
                                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                                Activar
                            </button>
                        </div>
                    );
                },
            }),
        ],
        []
    );

    // Instancia de TanStack Table
    const table = useReactTable({
        data: historial,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 8,
            },
        },
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión Tasa de Cambio (USD / VES)" />

            <div className="min-h-screen bg-[#06141B] text-[#CCD0CF] p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Encabezado Principal & CTA Modal */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#253745]">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Coins className="w-6 h-6 text-[#9BA8AB]" />
                                <h1 className="text-2xl font-black tracking-tight text-[#CCD0CF]">
                                    Gestión de Tasa de Cambio
                                </h1>
                            </div>
                            <p className="text-xs text-[#9BA8AB]">
                                Configuración y reactivación de tasas de cambio para operaciones en el POS y compras.
                            </p>
                        </div>

                        {/* Botón Modal para Agregar Tasa */}
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#253745] hover:bg-[#4A5C6A] text-white font-bold text-xs tracking-wide border border-[#4A5C6A]/60 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
                        >
                            <Plus className="w-4 h-4 text-[#CCD0CF]" />
                            Nueva Tasa
                        </button>
                    </div>

                    {/* Notificaciones (Alertas) */}
                    {flash?.message && (
                        <div className="flex items-center gap-3 p-3.5 bg-[#11212D] border border-emerald-500/30 text-emerald-300 rounded-xl text-sm font-medium shadow-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>{flash.message}</span>
                        </div>
                    )}
                    {pageErrors?.error && (
                        <div className="flex items-center gap-3 p-3.5 bg-[#11212D] border border-rose-500/30 text-rose-300 rounded-xl text-sm font-medium shadow-sm">
                            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                            <span>{pageErrors.error}</span>
                        </div>
                    )}

                    {/* Tarjeta Destacada Tasa Activa del Día */}
                    <div className="relative overflow-hidden p-6 md:p-8 bg-[#11212D] border border-[#253745] rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#253745]/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="space-y-2 z-10">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest text-[#9BA8AB]">
                                    Tasa Activa en Sistema
                                </span>
                            </div>
                            <div className="flex items-baseline gap-3">
                                <p className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                    {tasaActual
                                        ? `Bs. ${valorTasaActual.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`
                                        : 'Sin Tasa Configurada'}
                                </p>
                                {tasaActual && <span className="text-sm font-semibold text-[#9BA8AB]">VES / USD</span>}
                            </div>
                        </div>

                        {tasaActual && (
                            <div className="z-10 bg-[#06141B]/80 backdrop-blur-md px-4 py-3 rounded-xl border border-[#253745] space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#9BA8AB]">
                                    <ArrowUpRight className="w-3.5 h-3.5 text-[#4A5C6A]" />
                                    <span>Vigencia Actual</span>
                                </div>
                                <p className="text-xs font-bold text-[#CCD0CF]">
                                    {new Date(tasaActual.fecha_vigencia).toLocaleString('es-VE', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Tabla del Historial con TanStack Table */}
                    <div className="bg-[#11212D] border border-[#253745] rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-4 md:p-5 border-b border-[#253745] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-sm text-[#CCD0CF]">Historial de Registro</h2>
                                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#253745] text-[#9BA8AB]">
                                    {historial.length}
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#06141B] text-[#9BA8AB] border-b border-[#253745] font-semibold uppercase tracking-wider">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th key={header.id} className="p-4">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column.columnDef.header,
                                                              header.getContext()
                                                          )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="divide-y divide-[#253745]/60">
                                    {table.getRowModel().rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length} className="p-8 text-center text-[#9BA8AB]">
                                                No hay registros de tasas en el historial.
                                            </td>
                                        </tr>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <tr
                                                key={row.id}
                                                className={`transition-colors hover:bg-[#253745]/30 ${
                                                    row.original.es_actual
                                                        ? 'bg-[#253745]/20 font-medium'
                                                        : ''
                                                }`}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <td key={cell.id} className="p-4">
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginador TanStack Table */}
                        {table.getPageCount() > 1 && (
                            <div className="p-4 border-t border-[#253745] flex items-center justify-between text-xs text-[#9BA8AB]">
                                <span>
                                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                        className="p-1.5 rounded-lg border border-[#253745] bg-[#06141B] hover:bg-[#253745] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-[#CCD0CF]"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                        className="p-1.5 rounded-lg border border-[#253745] bg-[#06141B] hover:bg-[#253745] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-[#CCD0CF]"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Modal para Agregar Nueva Tasa */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06141B]/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#11212D] border border-[#253745] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden space-y-6 p-6 relative">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-[#253745] pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Coins className="w-5 h-5 text-[#9BA8AB]" />
                                    Registrar Nueva Tasa
                                </h3>
                                <p className="text-xs text-[#9BA8AB] mt-0.5">
                                    Define la tasa de cambio vigente que aplicará para transacciones.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 rounded-lg text-[#9BA8AB] hover:text-white hover:bg-[#253745] transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Formulario Modal */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                    Nueva Tasa (VES por 1 USD) *
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.0001"
                                        min="0.01"
                                        placeholder="Ej: 88.50"
                                        value={data.ves_por_usd}
                                        onChange={(e) => setData('ves_por_usd', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06141B] border border-[#253745] text-white text-sm focus:outline-hidden focus:border-[#4A5C6A] focus:ring-1 focus:ring-[#4A5C6A] transition-all placeholder:text-[#4A5C6A]"
                                        required
                                    />
                                </div>
                                {errors.ves_por_usd && (
                                    <p className="text-rose-400 text-xs mt-1 font-medium flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.ves_por_usd}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                    Notas u Observaciones (Opcional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Tasa Oficial BCV publicado hoy"
                                    value={data.notas}
                                    onChange={(e) => setData('notas', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#06141B] border border-[#253745] text-white text-sm focus:outline-hidden focus:border-[#4A5C6A] focus:ring-1 focus:ring-[#4A5C6A] transition-all placeholder:text-[#4A5C6A]"
                                />
                            </div>

                            {/* Footer Modal Acciones */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#253745]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-[#253745] text-[#9BA8AB] hover:text-white hover:bg-[#253745] font-semibold text-xs transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !data.ves_por_usd}
                                    className="px-5 py-2 rounded-xl bg-[#253745] hover:bg-[#4A5C6A] text-white font-bold text-xs tracking-wide border border-[#4A5C6A]/60 shadow-md disabled:opacity-40 transition-all cursor-pointer"
                                >
                                    {processing ? 'Guardando...' : 'Guardar y Activar Tasa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
