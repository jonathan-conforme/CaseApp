import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

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

interface Props {
    productos: Producto[];
    categorias: Categoria[];
    proveedores: Proveedor[];
    tasaVes: number;
}

export default function Index({ productos, categorias, proveedores, tasaVes }: Props) {
    const { flash } = usePage().props as any;
    const [editando, setEditando] = useState<Producto | null>(null);

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
    };

    const handleCancel = () => {
        setEditando(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editando && data.id) {
            put(route('productos.update', data.id), {
                onSuccess: () => handleCancel(),
            });
        } else {
            post(route('productos.store'), {
                onSuccess: () => reset(),
            });
        }
    };

    const calcularVes = (montoUsd: number) => {
        return (montoUsd * tasaVes).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Productos', href: '/productos' }]}>
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Catálogo de Productos</h1>
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                        Tasa Activa: {tasaVes > 0 ? `${tasaVes} VES/USD` : 'Sin configurar'}
                    </div>
                </div>

                {flash?.message && (
                    <div className="p-4 bg-green-100 text-green-800 border border-green-200 rounded-lg">
                        {flash.message}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulario */}
                    <div className="bg-white border rounded-lg p-6 shadow-sm h-fit space-y-4">
                        <h2 className="text-lg font-semibold text-gray-700">
                            {editando ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                                <select
                                    value={data.categoria_id}
                                    onChange={(e) => setData('categoria_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    required
                                >
                                    <option value="">Seleccione una categoría</option>
                                    {categorias.map((c) => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                                {errors.categoria_id && <p className="text-red-500 text-xs mt-1">{errors.categoria_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre del Producto / Modelo</label>
                                <input
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    placeholder="Ej: Funda MagSafe iPhone 15 Pro"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    required
                                />
                                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Código de Barras</label>
                                    <input
                                        type="text"
                                        value={data.codigo_barras}
                                        onChange={(e) => setData('codigo_barras', e.target.value)}
                                        placeholder="Opcional"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Stock Mínimo</label>
                                    <input
                                        type="number"
                                        value={data.stock_minimo}
                                        onChange={(e) => setData('stock_minimo', Number(e.target.value))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Precio Venta (USD)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.precio_venta_usd}
                                    onChange={(e) => setData('precio_venta_usd', e.target.value)}
                                    placeholder="10.00"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    required
                                />
                                {data.precio_venta_usd && tasaVes > 0 && (
                                    <p className="text-xs text-indigo-600 mt-1 font-medium">
                                        ≈ {calcularVes(Number(data.precio_venta_usd))} VES
                                    </p>
                                )}
                                {errors.precio_venta_usd && <p className="text-red-500 text-xs mt-1">{errors.precio_venta_usd}</p>}
                            </div>

                            <div className="flex space-x-2 pt-2">
                                {editando && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="w-1/2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`${editando ? 'w-1/2' : 'w-full'} px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50`}
                                >
                                    {processing ? 'Guardando...' : editando ? 'Actualizar' : 'Guardar Producto'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Listado */}
                    <div className="lg:col-span-2 bg-white border rounded-lg overflow-hidden shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b text-gray-600">
                                <tr>
                                    <th className="p-3">Producto</th>
                                    <th className="p-3">Categoría</th>
                                    <th className="p-3">Precio (USD / VES)</th>
                                    <th className="p-3">Stock</th>
                                    <th className="p-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-gray-500">
                                            No hay productos registrados en el catálogo.
                                        </td>
                                    </tr>
                                ) : (
                                    productos.map((p) => (
                                        <tr key={p.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <div className="font-semibold text-gray-800">{p.nombre}</div>
                                                <div className="text-xs text-gray-400">{p.codigo_barras || 'Sin código'}</div>
                                            </td>
                                            <td className="p-3 text-gray-600">{p.categoria?.nombre || '-'}</td>
                                            <td className="p-3 font-medium">
                                                <div>\${p.precio_venta_usd.toFixed(2)}</div>
                                                {tasaVes > 0 && (
                                                    <div className="text-xs text-gray-500">
                                                        Bs. {calcularVes(p.precio_venta_usd)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${p.stock_actual <= p.stock_minimo ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {p.stock_actual} unids.
                                                </span>
                                            </td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => handleEdit(p)}
                                                    className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold"
                                                >
                                                    Editar
                                                </button>
                                            </td>
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