import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

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

interface Props {
    compras: Compra[];
    proveedores: Proveedor[];
    productos: Producto[];
    tasaVes: number;
}

export default function Index({ compras, proveedores, productos, tasaVes }: Props) {
    const { flash } = usePage().props as any;

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
            onSuccess: () => {
                reset();
                setItemActual({ producto_id: '', cantidad: 1, costo_unitario_usd: '' });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Compras e Inventario', href: '/compras' }]}>
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Registro de Compras (FIFO)</h1>
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
                    {/* Formulario de Compra */}
                    <div className="lg:col-span-2 bg-white border rounded-lg p-6 shadow-sm space-y-4">
                        <h2 className="text-lg font-semibold text-gray-700">Nueva Recepción de Mercancía</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Proveedor</label>
                                    <select
                                        value={data.proveedor_id}
                                        onChange={(e) => setData('proveedor_id', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        required
                                    >
                                        <option value="">Seleccione Proveedor</option>
                                        {proveedores.map((p) => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                    {errors.proveedor_id && <p className="text-red-500 text-xs mt-1">{errors.proveedor_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">N° Factura / Nota</label>
                                    <input
                                        type="text"
                                        value={data.factura_proveedor}
                                        onChange={(e) => setData('factura_proveedor', e.target.value)}
                                        placeholder="Opcional"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Fecha de Entrada</label>
                                    <input
                                        type="date"
                                        value={data.fecha_compra}
                                        onChange={(e) => setData('fecha_compra', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Fila para agregar ítem */}
                            <div className="p-3 bg-gray-50 border rounded-lg space-y-2">
                                <span className="text-xs font-bold text-gray-600 uppercase">Agregar Producto a la Compra</span>
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                                    <div className="sm:col-span-5">
                                        <select
                                            value={itemActual.producto_id}
                                            onChange={(e) => setItemActual({ ...itemActual, producto_id: e.target.value })}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 text-sm"
                                        >
                                            <option value="">Seleccione Producto</option>
                                            {productos.map((prod) => (
                                                <option key={prod.id} value={prod.id}>
                                                    {prod.nombre} {prod.sku ? `(${prod.sku})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={itemActual.cantidad}
                                            onChange={(e) => setItemActual({ ...itemActual, cantidad: Number(e.target.value) })}
                                            placeholder="Cant."
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                    <div className="sm:col-span-3">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={itemActual.costo_unitario_usd}
                                            onChange={(e) => setItemActual({ ...itemActual, costo_unitario_usd: e.target.value })}
                                            placeholder="Costo USD"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <button
                                            type="button"
                                            onClick={agregarItem}
                                            className="w-full py-2 bg-gray-800 text-white text-xs rounded-md hover:bg-gray-900 font-semibold"
                                        >
                                            + Agregar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tabla de ítems agregados */}
                            <table className="w-full text-left text-sm border">
                                <thead className="bg-gray-100 text-gray-600 border-b">
                                    <tr>
                                        <th className="p-2">Producto</th>
                                        <th className="p-2 text-center">Cant.</th>
                                        <th className="p-2 text-right">Costo USD</th>
                                        <th className="p-2 text-right">Subtotal</th>
                                        <th className="p-2 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-gray-400">
                                                No hay productos agregados a esta recepción.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.items.map((it, idx) => {
                                            const prodObj = productos.find((p) => String(p.id) === String(it.producto_id));
                                            const subtotal = it.cantidad * Number(it.costo_unitario_usd);
                                            return (
                                                <tr key={idx} className="border-b">
                                                    <td className="p-2 font-medium">{prodObj?.nombre}</td>
                                                    <td className="p-2 text-center">{it.cantidad}</td>
                                                    <td className="p-2 text-right">\${Number(it.costo_unitario_usd).toFixed(2)}</td>
                                                    <td className="p-2 text-right font-semibold">\${subtotal.toFixed(2)}</td>
                                                    <td className="p-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => eliminarItem(idx)}
                                                            className="text-red-600 hover:underline text-xs"
                                                        >
                                                            Quitar
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>

                            {/* Totales */}
                            <div className="flex justify-between items-center pt-2">
                                <div>
                                    {errors.items && <p className="text-red-500 text-xs">{errors.items}</p>}
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-sm text-gray-600">Subtotal: <span className="font-semibold">\${calcularSubtotalUsd().toFixed(2)}</span></p>
                                    <p className="text-lg font-bold text-indigo-700">Total USD: \${calcularTotalUsd().toFixed(2)}</p>
                                    {tasaVes > 0 && (
                                        <p className="text-xs text-gray-500 font-medium">
                                            ≈ Bs. {(calcularTotalUsd() * tasaVes).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || data.items.length === 0}
                                className="w-full py-2.5 bg-indigo-600 text-white rounded-md font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {processing ? 'Procesando Compra...' : 'Guardar Orden de Compra'}
                            </button>
                        </form>
                    </div>

                    {/* Historial Reciente */}
                    <div className="bg-white border rounded-lg p-4 shadow-sm h-fit space-y-3">
                        <h2 className="text-md font-semibold text-gray-700">Últimas Compras</h2>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {compras.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">No hay compras registradas.</p>
                            ) : (
                                compras.map((c) => (
                                    <div key={c.id} className="p-3 border rounded-md space-y-1 bg-gray-50 text-xs">
                                        <div className="flex justify-between font-bold text-gray-800">
                                            <span>{c.numero}</span>
                                            <span className="text-indigo-600">\${c.total_usd.toFixed(2)}</span>
                                        </div>
                                        <div className="text-gray-500">
                                            Proveedor: <span className="font-medium text-gray-700">{c.proveedor?.nombre}</span>
                                        </div>
                                       
                                        <div>
                                            Total VES: <span className="font-medium text-gray-700">{c.total_ves.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="text-gray-400">
                                            Fecha: {new Date(c.fecha_compra).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
