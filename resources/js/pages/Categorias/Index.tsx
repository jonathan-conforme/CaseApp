import React, { useState, useMemo } from 'react';
import { useForm, usePage, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import {
    Plus,
    Pencil,
    CheckCircle2,
    AlertCircle,
    X,
    Tag,
    Package,
    ChevronLeft,
    ChevronRight,
    FileText,
    Layers,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';

interface Categoria {
    id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
    productos_count?: number;
}

interface Props {
    categorias: Categoria[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Categorías', href: '/categorias' },
];

export default function Index({ categorias = [] }: Props) {
    const { flash } = usePage<{ flash?: { message?: string } }>().props;
    const [editando, setEditando] = useState<Categoria | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Formulario de Inertia
    const { data, setData, post, put, processing, errors, reset } = useForm({
        id: null as number | null,
        nombre: '',
        descripcion: '',
        activo: true,
    });

    // Abrir modal en modo Creación
    const openCreateModal = () => {
        setEditando(null);
        reset();
        setIsModalOpen(true);
    };

    // Abrir modal en modo Edición
    const handleEdit = (cat: Categoria) => {
        setEditando(cat);
        setData({
            id: cat.id,
            nombre: cat.nombre,
            descripcion: cat.descripcion || '',
            activo: cat.activo,
        });
        setIsModalOpen(true);
    };

    // Cerrar modal y limpiar
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditando(null);
        reset();
    };

    // Envío del formulario (Crear / Actualizar)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando && data.id) {
            put(route('categorias.update', data.id), {
                onSuccess: () => handleCloseModal(),
            });
        } else {
            post(route('categorias.store'), {
                onSuccess: () => handleCloseModal(),
            });
        }
    };

    // Definición de columnas para TanStack Table
    const columnHelper = createColumnHelper<Categoria>();

    const columns = useMemo(
        () => [
            columnHelper.accessor('nombre', {
                header: 'Categoría',
                cell: (info) => (
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-[#253745] text-[#CCD0CF]">
                            <Tag className="w-4 h-4 text-[#9BA8AB]" />
                        </div>
                        <span className="font-bold text-sm text-[#CCD0CF]">
                            {info.getValue()}
                        </span>
                    </div>
                ),
            }),
            columnHelper.accessor('descripcion', {
                header: 'Descripción',
                cell: (info) => {
                    const desc = info.getValue();
                    return (
                        <div className="flex items-center gap-1.5 text-xs text-[#9BA8AB] max-w-xs truncate">
                            {desc ? (
                                <>
                                    <FileText className="w-3.5 h-3.5 text-[#4A5C6A] shrink-0" />
                                    <span className="truncate">{desc}</span>
                                </>
                            ) : (
                                '-'
                            )}
                        </div>
                    );
                },
            }),
            columnHelper.accessor('productos_count', {
                header: 'Productos',
                cell: (info) => (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#06141B] border border-[#253745] text-xs font-semibold text-[#CCD0CF]">
                        <Package className="w-3.5 h-3.5 text-[#4A5C6A]" />
                        <span>{info.getValue() ?? 0}</span>
                    </div>
                ),
            }),
            columnHelper.accessor('activo', {
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
            columnHelper.display({
                id: 'acciones',
                header: () => <div className="text-right">Acción</div>,
                cell: (info) => (
                    <div className="text-right">
                        <button
                            type="button"
                            onClick={() => handleEdit(info.row.original)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#253745] hover:bg-[#4A5C6A] text-[#CCD0CF] hover:text-white border border-[#4A5C6A]/40 transition-all cursor-pointer active:scale-95"
                        >
                            <Pencil className="w-3.5 h-3.5 text-[#9BA8AB]" />
                            Editar
                        </button>
                    </div>
                ),
            }),
        ],
        []
    );

    // Instancia de TanStack Table
    const table = useReactTable({
        data: categorias,
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
            <Head title="Categorías de Productos" />

            <div className="min-h-screen bg-[#06141B] text-[#CCD0CF] p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Header Principal con CTA */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#253745]">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Layers className="w-6 h-6 text-[#9BA8AB]" />
                                <h1 className="text-2xl font-black tracking-tight text-[#CCD0CF]">
                                    Categorías de Productos
                                </h1>
                            </div>
                            <p className="text-xs text-[#9BA8AB]">
                                Organiza y gestiona las agrupaciones para el catálogo de inventario y punto de venta.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#253745] hover:bg-[#4A5C6A] text-white font-bold text-xs tracking-wide border border-[#4A5C6A]/60 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
                        >
                            <Plus className="w-4 h-4 text-[#CCD0CF]" />
                            Nueva Categoría
                        </button>
                    </div>

                    {/* Alertas de Notificación */}
                    {flash?.message && (
                        <div className="flex items-center gap-3 p-3.5 bg-[#11212D] border border-emerald-500/30 text-emerald-300 rounded-xl text-sm font-medium shadow-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>{flash.message}</span>
                        </div>
                    )}

                    {/* Tabla Principal con TanStack Table */}
                    <div className="bg-[#11212D] border border-[#253745] rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-4 md:p-5 border-b border-[#253745] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-sm text-[#CCD0CF]">Catálogo de Categorías</h2>
                                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#253745] text-[#9BA8AB]">
                                    {categorias.length}
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
                                                No hay categorías registradas en el sistema.
                                            </td>
                                        </tr>
                                    ) : (
                                        table.getRowModel().rows.map((row) => (
                                            <tr
                                                key={row.id}
                                                className="transition-colors hover:bg-[#253745]/30"
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

                        {/* Paginación */}
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

            {/* Modal para Crear y Editar Categoría */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06141B]/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#11212D] border border-[#253745] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden space-y-6 p-6 relative">
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-[#253745] pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-[#9BA8AB]" />
                                    {editando ? 'Editar Categoría' : 'Nueva Categoría'}
                                </h3>
                                <p className="text-xs text-[#9BA8AB] mt-0.5">
                                    {editando
                                        ? 'Modifica los datos de la categoría seleccionada.'
                                        : 'Completa la información para dar de alta una categoría.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="p-1.5 rounded-lg text-[#9BA8AB] hover:text-white hover:bg-[#253745] transition-all cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Formulario Modal */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                    Nombre de la Categoría *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Fundas Antigolpes"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#06141B] border border-[#253745] text-white text-sm focus:outline-hidden focus:border-[#4A5C6A] focus:ring-1 focus:ring-[#4A5C6A] transition-all placeholder:text-[#4A5C6A]"
                                    required
                                />
                                {errors.nombre && (
                                    <p className="text-rose-400 text-xs mt-1 font-medium flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.nombre}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                    Descripción (Opcional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Detalles sobre los productos de esta categoría..."
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#06141B] border border-[#253745] text-white text-sm focus:outline-hidden focus:border-[#4A5C6A] focus:ring-1 focus:ring-[#4A5C6A] transition-all placeholder:text-[#4A5C6A] resize-none"
                                />
                                {errors.descripcion && (
                                    <p className="text-rose-400 text-xs mt-1 font-medium flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.descripcion}
                                    </p>
                                )}
                            </div>

                            {/* Toggle Estado Activo */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setData('activo', !data.activo)}
                                    className="flex items-center justify-between w-full p-3 rounded-xl bg-[#06141B] border border-[#253745] text-left cursor-pointer hover:border-[#4A5C6A]/60 transition-all"
                                >
                                    <div className="space-y-0.5">
                                        <span className="block text-xs font-bold text-[#CCD0CF]">
                                            Categoría Activa
                                        </span>
                                        <span className="block text-[11px] text-[#9BA8AB]">
                                            Permite asignar productos a esta categoría en el POS
                                        </span>
                                    </div>
                                    {data.activo ? (
                                        <ToggleRight className="w-7 h-7 text-emerald-400 shrink-0" />
                                    ) : (
                                        <ToggleLeft className="w-7 h-7 text-[#4A5C6A] shrink-0" />
                                    )}
                                </button>
                            </div>

                            {/* Acciones Modal */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#253745]">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 rounded-xl border border-[#253745] text-[#9BA8AB] hover:text-white hover:bg-[#253745] font-semibold text-xs transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || !data.nombre}
                                    className="px-5 py-2 rounded-xl bg-[#253745] hover:bg-[#4A5C6A] text-white font-bold text-xs tracking-wide border border-[#4A5C6A]/60 shadow-md disabled:opacity-40 transition-all cursor-pointer"
                                >
                                    {processing
                                        ? 'Guardando...'
                                        : editando
                                        ? 'Actualizar Categoría'
                                        : 'Guardar Categoría'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
