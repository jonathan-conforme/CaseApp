import React, { useState, useMemo } from 'react';
import { useForm, usePage, Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import {
    Plus,
    Pencil,
    CheckCircle2,
    AlertCircle,
    X,
    Package,
    Barcode,
    Tag,
    DollarSign,
    Boxes,
    ChevronLeft,
    ChevronRight,
    Coins,
    AlertTriangle,
} from 'lucide-react';

interface Categoria {
    id: number;
    nombre: string;
}

interface Proveedor {
    id: number;
    nombre: string;
}

interface Producto {
    id: number;
    categoria_id: number;
    codigo_barras?: string;
    nombre: string;
    descripcion?: string;
    precio_venta_usd: number;
    stock_minimo: number;
    stock_actual: number;
    activo: boolean;
    categoria?: Categoria;
    proveedores?: Array<{
        id: number;
        pivot: {
            sku_proveedor?: string;
            ultimo_costo_usd: number;
        };
    }>;
}

interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    productos: PaginatedResponse<Producto>;
    categorias: Categoria[];
    proveedores: Proveedor[];
    tasaVes: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Productos', href: '/productos' },
];

export default function Index({ productos, categorias = [], proveedores = [], tasaVes }: Props) {
    const { flash } = usePage().props as any;
    const [editando, setEditando] = useState<Producto | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        id: null as number | null,
        categoria_id: '',
        codigo_barras: '',
        nombre: '',
        descripcion: '',
        precio_venta_usd: '',
        stock_minimo: 5,
        activo: true,
        proveedores: [] as Array<{ proveedor_id: number; sku_proveedor: string; ultimo_costo_usd: number }>,
    });

    const openCreateModal = () => {
        setEditando(null);
        reset();
        setIsModalOpen(true);
    };

    const handleEdit = (p: Producto) => {
        setEditando(p);
        setData({
            id: p.id,
            categoria_id: String(p.categoria_id),
            codigo_barras: p.codigo_barras || '',
            nombre: p.nombre,
            descripcion: p.descripcion || '',
            precio_venta_usd: String(p.precio_venta_usd),
            stock_minimo: p.stock_minimo,
            activo: p.activo,
            proveedores: p.proveedores?.map((pr) => ({
                proveedor_id: pr.id,
                sku_proveedor: pr.pivot.sku_proveedor || '',
                ultimo_costo_usd: pr.pivot.ultimo_costo_usd,
            })) || [],
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditando(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando && data.id) {
            put(route('productos.update', data.id), {
                onSuccess: () => handleCloseModal(),
            });
        } else {
            post(route('productos.store'), {
                onSuccess: () => handleCloseModal(),
            });
        }
    };

    const calcularVes = (montoUsd: number) => {
        return (montoUsd * tasaVes).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.visit(url, { preserveState: true, preserveScroll: true });
        }
    };

    const columnHelper = createColumnHelper<Producto>();

    const columns = useMemo(
        () => [
            columnHelper.accessor('nombre', {
                header: 'Producto / Modelo',
                cell: (info) => {
                    const prod = info.row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#253745] text-[#CCD0CF] shrink-0">
                                <Package className="w-4 h-4 text-[#9BA8AB]" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="font-bold text-sm text-[#CCD0CF]">
                                    {prod.nombre}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-[#9BA8AB] font-mono">
                                    <Barcode className="w-3 h-3 text-[#4A5C6A]" />
                                    <span>{prod.codigo_barras || 'Sin código'}</span>
                                </div>
                            </div>
                        </div>
                    );
                },
            }),
            columnHelper.accessor('categoria', {
                header: 'Categoría',
                cell: (info) => {
                    const catNombre = info.getValue()?.nombre || '-';
                    return (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#06141B] border border-[#253745] text-xs text-[#9BA8AB]">
                            <Tag className="w-3 h-3 text-[#4A5C6A]" />
                            <span>{catNombre}</span>
                        </div>
                    );
                },
            }),
            columnHelper.accessor('precio_venta_usd', {
                header: 'Precio (USD / VES)',
                cell: (info) => {
                    const precioUsd = Number(info.getValue());
                    return (
                        <div className="space-y-0.5">
                            <div className="font-mono text-sm font-bold text-white flex items-center gap-0.5">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                <span>{precioUsd.toFixed(2)}</span>
                            </div>
                            {tasaVes > 0 && (
                                <div className="text-[11px] font-medium text-[#9BA8AB] font-mono">
                                    Bs. {calcularVes(precioUsd)}
                                </div>
                            )}
                        </div>
                    );
                },
            }),
            columnHelper.accessor('stock_actual', {
                header: 'Inventario',
                cell: (info) => {
                    const stock = info.getValue();
                    const stockMin = info.row.original.stock_minimo;
                    const esBajo = stock <= stockMin;

                    return (
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                    esBajo
                                        ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                                        : 'bg-[#253745] text-[#CCD0CF] border-[#4A5C6A]/50'
                                }`}
                            >
                                {esBajo ? (
                                    <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                                ) : (
                                    <Boxes className="w-3 h-3 text-[#9BA8AB] shrink-0" />
                                )}
                                <span>{stock} unids.</span>
                            </span>
                        </div>
                    );
                },
            }),
            columnHelper.display({
                id: 'acciones',
                header: () => <div className="text-right">Acciones</div>,
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
        [tasaVes]
    );

    const table = useReactTable({
        data: productos?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catálogo de Productos" />

            <div className="min-h-screen bg-[#06141B] text-[#CCD0CF] p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-6">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#253745]">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Package className="w-6 h-6 text-[#9BA8AB]" />
                                <h1 className="text-2xl font-black tracking-tight text-[#CCD0CF]">
                                    Catálogo de Productos
                                </h1>
                            </div>
                            <p className="text-xs text-[#9BA8AB]">
                                Control de inventario, código de barras y precios multimoneda en tiempo real.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#11212D] border border-[#253745] text-xs font-semibold text-[#CCD0CF]">
                                <Coins className="w-4 h-4 text-[#9BA8AB]" />
                                <span>Tasa Activa:</span>
                                <span className="text-white font-mono font-bold">
                                    {tasaVes > 0 ? `${tasaVes} VES/USD` : 'Sin configurar'}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#253745] hover:bg-[#4A5C6A] text-white font-bold text-xs tracking-wide border border-[#4A5C6A]/60 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
                            >
                                <Plus className="w-4 h-4 text-[#CCD0CF]" />
                                Nuevo Producto
                            </button>
                        </div>
                    </div>

                    {flash?.message && (
                        <div className="flex items-center gap-3 p-3.5 bg-[#11212D] border border-emerald-500/30 text-emerald-300 rounded-xl text-sm font-medium shadow-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>{flash.message}</span>
                        </div>
                    )}

                    <div className="bg-[#11212D] border border-[#253745] rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-4 md:p-5 border-b border-[#253745] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-sm text-[#CCD0CF]">Inventario General</h2>
                                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#253745] text-[#9BA8AB]">
                                    {productos?.total || 0}
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
                                                No hay productos registrados en el catálogo.
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

                        {/* Paginador Servidor Inertia */}
                        {productos?.last_page > 1 && (
                            <div className="p-4 border-t border-[#253745] flex items-center justify-between text-xs text-[#9BA8AB]">
                                <span>
                                    Página {productos.current_page} de {productos.last_page} ({productos.total} productos)
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(productos.prev_page_url)}
                                        disabled={!productos.prev_page_url}
                                        className="p-1.5 rounded-lg border border-[#253745] bg-[#06141B] hover:bg-[#253745] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-[#CCD0CF]"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(productos.next_page_url)}
                                        disabled={!productos.next_page_url}
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

            {/* Modal para Crear y Editar Producto */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06141B]/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#11212D] border border-[#253745] rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden space-y-6 p-6 relative max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#253745] pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Package className="w-5 h-5 text-[#9BA8AB]" />
                                    {editando ? 'Editar Producto' : 'Nuevo Producto'}
                                </h3>
                                <p className="text-xs text-[#9BA8AB] mt-0.5">
                                    {editando
                                        ? 'Modifica los parámetros y precios del producto en catálogo.'
                                        : 'Registra un nuevo artículo en la base de datos de inventario.'}
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

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                    Categoría *
                                </label>
                                <select
                                    value={data.categoria_id}
                                    onChange={(e) => setData('categoria_id', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#06141B] border border-[#253745] text-white text-sm focus:outline-hidden focus:border-[#4A5C6A] focus:ring-1 focus:ring-[#4A5C6A] transition-all"
                                    required
                                >
                                    <option value="" className="bg-[#11212D]">Seleccione una categoría</option>
                                    {categorias.map((c) => (
                                        <option key={c.id} value={c.id} className="bg-[#11212D]">
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>
                                {errors.categoria_id && (
                                    <p className="text-rose-400 text-xs mt-1 font-medium flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.categoria_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                    Nombre del Producto / Modelo *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Funda MagSafe iPhone 15 Pro"
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                        Código de Barras
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Opcional"
                                        value={data.codigo_barras}
                                        onChange={(e) => setData('codigo_barras', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06141B] border border-[#253745] text-white text-sm focus:outline-hidden focus:border-[#4A5C6A] focus:ring-1 focus:ring-[#4A5C6A] transition-all placeholder:text-[#4A5C6A]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                        Stock Mínimo *
                                    </label>
                                    <input
                                        type="number"
                                        value={data.stock_minimo}
                                        onChange={(e) => setData('stock_minimo', Number(e.target.value))}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06141B] border border-[#253745] text-white text-sm focus:outline-hidden focus:border-[#4A5C6A] focus:ring-1 focus:ring-[#4A5C6A] transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                    Precio Venta (USD) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="10.00"
                                    value={data.precio_venta_usd}
                                    onChange={(e) => setData('precio_venta_usd', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#06141B] border border-[#253745] text-white text-sm focus:outline-hidden focus:border-[#4A5C6A] focus:ring-1 focus:ring-[#4A5C6A] transition-all placeholder:text-[#4A5C6A]"
                                    required
                                />
                                {data.precio_venta_usd && tasaVes > 0 && (
                                    <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                                        <Coins className="w-3.5 h-3.5" />
                                        ≈ {calcularVes(Number(data.precio_venta_usd))} VES
                                    </p>
                                )}
                                {errors.precio_venta_usd && (
                                    <p className="text-rose-400 text-xs mt-1 font-medium flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {errors.precio_venta_usd}
                                    </p>
                                )}
                            </div>

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
                                    disabled={processing || !data.nombre || !data.categoria_id || !data.precio_venta_usd}
                                    className="px-5 py-2 rounded-xl bg-[#253745] hover:bg-[#4A5C6A] text-white font-bold text-xs tracking-wide border border-[#4A5C6A]/60 shadow-md disabled:opacity-40 transition-all cursor-pointer"
                                >
                                    {processing
                                        ? 'Guardando...'
                                        : editando
                                        ? 'Actualizar Producto'
                                        : 'Guardar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
