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
    Trash2,
    CheckCircle2,
    AlertCircle,
    X,
    ShoppingBag,
    Building2,
    Calendar,
    DollarSign,
    Coins,
    Receipt,
    ChevronLeft,
    ChevronRight,
    Package,
} from 'lucide-react';

interface Proveedor {
    id: number;
    nombre: string;
}

interface Producto {
    id: number;
    nombre: string;
    sku?: string;
}

interface ItemCompra {
    producto_id: string;
    cantidad: number;
    costo_unitario_usd: string;
}

interface Compra {
    id: number;
    numero: string;
    factura_proveedor?: string;
    fecha_compra: string;
    total_usd: number;
    total_ves: number;
    proveedor?: Proveedor;
    detalles: Array<{
        id: number;
        cantidad: number;
        costo_unitario_usd: number;
        producto?: Producto;
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
    compras: PaginatedResponse<Compra>;
    proveedores: Proveedor[];
    productos: Producto[] | PaginatedResponse<Producto>;
    tasaVes: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Compras e Inventario', href: '/compras' },
];

export default function Index({ compras, proveedores = [], productos, tasaVes }: Props) {
    const { flash } = usePage().props as any;
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Normaliza la lista de productos (funciona con Array o PaginatedResponse)
    const listaProductos = useMemo<Producto[]>(() => {
        if (Array.isArray(productos)) return productos;
        if (productos && Array.isArray((productos as any).data)) return (productos as any).data;
        return [];
    }, [productos]);

    // Formulario de Inertia
    const { data, setData, post, processing, errors, reset } = useForm({
        proveedor_id: '',
        factura_proveedor: '',
        fecha_compra: new Date().toISOString().split('T')[0],
        descuento_usd: '0',
        notas: '',
        items: [] as ItemCompra[],
    });

    const [itemActual, setItemActual] = useState<ItemCompra>({
        producto_id: '',
        cantidad: 1,
        costo_unitario_usd: '',
    });

    const openCreateModal = () => {
        reset();
        setItemActual({ producto_id: '', cantidad: 1, costo_unitario_usd: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        reset();
        setItemActual({ producto_id: '', cantidad: 1, costo_unitario_usd: '' });
    };

    const agregarItem = () => {
        if (!itemActual.producto_id || !itemActual.costo_unitario_usd || itemActual.cantidad <= 0) return;

        setData('items', [...data.items, { ...itemActual }]);
        setItemActual({ producto_id: '', cantidad: 1, costo_unitario_usd: '' });
    };

    const eliminarItem = (index: number) => {
        const nuevosItems = data.items.filter((_, i) => i !== index);
        setData('items', nuevosItems);
    };

    const calcularSubtotalUsd = () => {
        return data.items.reduce((sum, item) => sum + (item.cantidad * Number(item.costo_unitario_usd) || 0), 0);
    };

    const calcularTotalUsd = () => {
        return Math.max(0, calcularSubtotalUsd() - (Number(data.descuento_usd) || 0));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('compras.store'), {
            onSuccess: () => handleCloseModal(),
        });
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.visit(url, { preserveState: true, preserveScroll: true });
        }
    };

    // Configuración de columnas para TanStack Table
    const columnHelper = createColumnHelper<Compra>();

    const columns = useMemo(
        () => [
            columnHelper.accessor('numero', {
                header: 'N° Recepción / Factura',
                cell: (info) => {
                    const compra = info.row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#253745] text-[#CCD0CF] shrink-0">
                                <Receipt className="w-4 h-4 text-[#9BA8AB]" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="font-bold text-sm text-[#CCD0CF]">
                                    {compra.numero}
                                </div>
                                <div className="text-[11px] text-[#9BA8AB] font-mono">
                                    Factura: {compra.factura_proveedor || 'Sin factura'}
                                </div>
                            </div>
                        </div>
                    );
                },
            }),
            columnHelper.accessor('proveedor', {
                header: 'Proveedor',
                cell: (info) => {
                    const provNombre = info.getValue()?.nombre || '-';
                    return (
                        <div className="flex items-center gap-1.5 text-xs text-[#CCD0CF]">
                            <Building2 className="w-3.5 h-3.5 text-[#4A5C6A] shrink-0" />
                            <span className="font-medium">{provNombre}</span>
                        </div>
                    );
                },
            }),
            columnHelper.accessor('fecha_compra', {
                header: 'Fecha Entrada',
                cell: (info) => (
                    <div className="flex items-center gap-1.5 text-xs text-[#9BA8AB]">
                        <Calendar className="w-3.5 h-3.5 text-[#4A5C6A] shrink-0" />
                        <span>
                            {new Date(info.getValue()).toLocaleDateString('es-VE', {
                                dateStyle: 'medium',
                            })}
                        </span>
                    </div>
                ),
            }),
            columnHelper.accessor('detalles', {
                header: 'Ítems Recibidos',
                cell: (info) => {
                    const count = info.getValue()?.length || 0;
                    return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#06141B] border border-[#253745] text-xs font-semibold text-[#CCD0CF]">
                            <Package className="w-3.5 h-3.5 text-[#4A5C6A]" />
                            <span>{count} {count === 1 ? 'producto' : 'productos'}</span>
                        </span>
                    );
                },
            }),
            columnHelper.accessor('total_usd', {
                header: 'Monto Total (USD / VES)',
                cell: (info) => {
                    const totalUsd = Number(info.getValue() || 0);
                    const totalVes = Number(info.row.original.total_ves || 0);
                    return (
                        <div className="space-y-0.5">
                            <div className="font-mono text-sm font-bold text-emerald-400 flex items-center gap-0.5">
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>{totalUsd.toFixed(2)}</span>
                            </div>
                            <div className="text-[11px] font-medium text-[#9BA8AB] font-mono">
                                Bs. {totalVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    );
                },
            }),
        ],
        []
    );

    // Instancia de TanStack Table
    const table = useReactTable({
        data: compras?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registro de Compras (FIFO)" />

            <div className="min-h-screen bg-[#06141B] text-[#CCD0CF] p-4 md:p-8">
                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Encabezado Principal */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#253745]">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-6 h-6 text-[#9BA8AB]" />
                                <h1 className="text-2xl font-black tracking-tight text-[#CCD0CF]">
                                    Registro de Compras (FIFO)
                                </h1>
                            </div>
                            <p className="text-xs text-[#9BA8AB]">
                                Control de entrada de mercancía, valorización de lotes e historial de recepciones.
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
                                Nueva Recepción
                            </button>
                        </div>
                    </div>

                    {/* Notificaciones */}
                    {flash?.message && (
                        <div className="flex items-center gap-3 p-3.5 bg-[#11212D] border border-emerald-500/30 text-emerald-300 rounded-xl text-sm font-medium shadow-sm">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>{flash.message}</span>
                        </div>
                    )}

                    {/* Tabla de Historial con TanStack Table */}
                    <div className="bg-[#11212D] border border-[#253745] rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-4 md:p-5 border-b border-[#253745] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-sm text-[#CCD0CF]">Historial de Recepciones</h2>
                                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#253745] text-[#9BA8AB]">
                                    {compras?.total || 0}
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
                                                No hay recepciones de compras registradas en el sistema.
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

                        {/* Paginación Servidor Inertia */}
                        {compras?.last_page > 1 && (
                            <div className="p-4 border-t border-[#253745] flex items-center justify-between text-xs text-[#9BA8AB]">
                                <span>
                                    Página {compras.current_page} de {compras.last_page} ({compras.total} recepciones)
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(compras.prev_page_url)}
                                        disabled={!compras.prev_page_url}
                                        className="p-1.5 rounded-lg border border-[#253745] bg-[#06141B] hover:bg-[#253745] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed text-[#CCD0CF]"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(compras.next_page_url)}
                                        disabled={!compras.next_page_url}
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

            {/* Modal de Nueva Recepción de Mercancía */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06141B]/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#11212D] border border-[#253745] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden space-y-6 p-6 relative max-h-[90vh] overflow-y-auto">

                        <div className="flex items-center justify-between border-b border-[#253745] pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-[#9BA8AB]" />
                                    Nueva Recepción de Mercancía
                                </h3>
                                <p className="text-xs text-[#9BA8AB] mt-0.5">
                                    Ingresa los detalles de la factura y agrega los lotes de productos.
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

                        <form onSubmit={handleSubmit} className="space-y-5">

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                        Proveedor *
                                    </label>
                                    <select
                                        value={data.proveedor_id}
                                        onChange={(e) => setData('proveedor_id', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#06141B] border border-[#253745] text-white text-xs focus:outline-hidden focus:border-[#4A5C6A] transition-all"
                                        required
                                    >
                                        <option value="" className="bg-[#11212D]">Seleccione Proveedor</option>
                                        {proveedores.map((p) => (
                                            <option key={p.id} value={p.id} className="bg-[#11212D]">
                                                {p.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.proveedor_id && (
                                        <p className="text-rose-400 text-xs font-medium flex items-center gap-1 mt-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.proveedor_id}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                        N° Factura / Nota
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: F-00948"
                                        value={data.factura_proveedor}
                                        onChange={(e) => setData('factura_proveedor', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#06141B] border border-[#253745] text-white text-xs focus:outline-hidden focus:border-[#4A5C6A] transition-all placeholder:text-[#4A5C6A]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-[#9BA8AB]">
                                        Fecha Entrada *
                                    </label>
                                    <input
                                        type="date"
                                        value={data.fecha_compra}
                                        onChange={(e) => setData('fecha_compra', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#06141B] border border-[#253745] text-white text-xs focus:outline-hidden focus:border-[#4A5C6A] transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-[#06141B] border border-[#253745] rounded-xl space-y-3">
                                <span className="block text-[11px] font-bold text-[#9BA8AB] uppercase tracking-wider">
                                    Agregar Producto a la Recepción
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                                    <div className="sm:col-span-5 space-y-1">
                                        <select
                                            value={itemActual.producto_id}
                                            onChange={(e) => setItemActual({ ...itemActual, producto_id: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg bg-[#11212D] border border-[#253745] text-white text-xs focus:outline-hidden focus:border-[#4A5C6A] transition-all"
                                        >
                                            <option value="" className="bg-[#11212D]">Seleccione Producto</option>
                                            {listaProductos.map((prod) => (
                                                <option key={prod.id} value={prod.id} className="bg-[#11212D]">
                                                    {prod.nombre} {prod.sku ? `(${prod.sku})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2 space-y-1">
                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Cantidad"
                                            value={itemActual.cantidad}
                                            onChange={(e) => setItemActual({ ...itemActual, cantidad: Number(e.target.value) })}
                                            className="w-full px-3 py-2 rounded-lg bg-[#11212D] border border-[#253745] text-white text-xs focus:outline-hidden focus:border-[#4A5C6A] transition-all"
                                        />
                                    </div>
                                    <div className="sm:col-span-3 space-y-1">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Precio Compra"
                                            value={itemActual.costo_unitario_usd}
                                            onChange={(e) => setItemActual({ ...itemActual, costo_unitario_usd: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg bg-[#11212D] border border-[#253745] text-white text-xs focus:outline-hidden focus:border-[#4A5C6A] transition-all placeholder:text-[#4A5C6A]"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <button
                                            type="button"
                                            onClick={agregarItem}
                                            className="w-full py-2 bg-[#253745] hover:bg-[#4A5C6A] text-white text-xs font-bold rounded-lg border border-[#4A5C6A]/60 transition-all cursor-pointer active:scale-95"
                                        >
                                            + Agregar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-[#253745] rounded-xl overflow-hidden">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-[#06141B] text-[#9BA8AB] border-b border-[#253745] uppercase font-semibold">
                                        <tr>
                                            <th className="p-3">Producto</th>
                                            <th className="p-3 text-center">Cant.</th>
                                            <th className="p-3 text-right">Costo USD</th>
                                            <th className="p-3 text-right">Subtotal</th>
                                            <th className="p-3 text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#253745]">
                                        {data.items.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-5 text-center text-[#9BA8AB]">
                                                    No hay productos cargados a esta orden.
                                                </td>
                                            </tr>
                                        ) : (
                                            data.items.map((it, idx) => {
                                                const prodObj = listaProductos.find((p) => String(p.id) === String(it.producto_id));
                                                const subtotal = it.cantidad * Number(it.costo_unitario_usd);
                                                return (
                                                    <tr key={idx} className="hover:bg-[#253745]/20">
                                                        <td className="p-3 font-semibold text-[#CCD0CF]">
                                                            {prodObj?.nombre || 'Producto no encontrado'}
                                                        </td>
                                                        <td className="p-3 text-center font-bold text-[#CCD0CF]">
                                                            {it.cantidad}
                                                        </td>
                                                        <td className="p-3 text-right font-mono text-[#9BA8AB]">
                                                            ${Number(it.costo_unitario_usd).toFixed(2)}
                                                        </td>
                                                        <td className="p-3 text-right font-mono font-bold text-white">
                                                            ${subtotal.toFixed(2)}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => eliminarItem(idx)}
                                                                className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-all cursor-pointer"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#253745]">
                                <div>
                                    {errors.items && (
                                        <p className="text-rose-400 text-xs font-medium flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            {errors.items}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-xs text-[#9BA8AB]">
                                        Subtotal: <span className="font-semibold text-[#CCD0CF] font-mono">${calcularSubtotalUsd().toFixed(2)}</span>
                                    </p>
                                    <p className="text-lg font-black text-emerald-400 font-mono">
                                        Total USD:${calcularTotalUsd().toFixed(2)}
                                    </p>
                                    {tasaVes > 0 && (
                                        <p className="text-xs text-[#9BA8AB] font-medium font-mono flex items-center justify-end gap-1">
                                            <Coins className="w-3.5 h-3.5 text-[#4A5C6A]" />
                                            ≈ Bs. {(calcularTotalUsd() * tasaVes).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VES
                                        </p>
                                    )}
                                </div>
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
                                    disabled={processing || data.items.length === 0 || !data.proveedor_id}
                                    className="px-5 py-2.5 rounded-xl bg-[#253745] hover:bg-[#4A5C6A] text-white font-bold text-xs tracking-wide border border-[#4A5C6A]/60 shadow-md disabled:opacity-40 transition-all cursor-pointer"
                                >
                                    {processing ? 'Procesando Compra...' : 'Guardar Orden de Compra'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
