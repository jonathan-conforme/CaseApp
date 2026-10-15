import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import TicketPrint, { VentaTicket } from '@/components/TicketPrint';

interface Categoria {
    id: number;
    nombre: string;
}

interface Producto {
    id: number;
    nombre: string;
    sku?: string;
    codigo_barras?: string;
    precio_venta_usd: number;
    stock_actual: number;
    categoria?: Categoria;
}

interface ItemCarrito {
    producto_id: number;
    nombre: string;
    sku?: string;
    cantidad: number;
    precio_unitario_usd: number;
    stock_actual: number;
}

interface Props {
    productos: Producto[];
    tasaVes: number;
}

export default function Index({ productos, tasaVes }: Props) {
    const { flash, errors: pageErrors } = usePage().props as any;
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [ticketActivo, setTicketActivo] = useState<VentaTicket | null>(null);

    const [busqueda, setBusqueda] = useState('');
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

    const { data, setData, post, processing, reset } = useForm({
        metodo_pago: 'efectivo_usd',
        descuento_usd: '0',
        notas: '',
        items: [] as Array<{ producto_id: number; cantidad: number; precio_unitario_usd: number }>,
    });

    // Mantener sincronizado el arreglo del formulario con el carrito visual
    useEffect(() => {
        setData('items', carrito.map((i) => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad,
            precio_unitario_usd: i.precio_unitario_usd,
        })));
    }, [carrito]);

    // Disparar ticket al recibir confirmación de venta
    useEffect(() => {
        if (flash?.ultimaVenta) {
            setTicketActivo(flash.ultimaVenta);
            setTimeout(() => {
                window.print();
            }, 300);
        }
    }, [flash]);

    // Filtrar productos por búsqueda
    const productosFiltrados = useMemo(() => {
        if (!busqueda.trim()) return productos;
        const q = busqueda.toLowerCase();
        return productos.filter(
            (p) =>
                p.nombre.toLowerCase().includes(q) ||
                (p.sku && p.sku.toLowerCase().includes(q)) ||
                (p.codigo_barras && p.codigo_barras.toLowerCase().includes(q))
        );
    }, [busqueda, productos]);

    // Agregar producto al carrito
    const agregarAlCarrito = (producto: Producto) => {
        setCarrito((prev) => {
            const existente = prev.find((item) => item.producto_id === producto.id);
            if (existente) {
                if (existente.cantidad >= producto.stock_actual) return prev;
                return prev.map((item) =>
                    item.producto_id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            return [
                ...prev,
                {
                    producto_id: producto.id,
                    nombre: producto.nombre,
                    sku: producto.sku,
                    cantidad: 1,
                    precio_unitario_usd: producto.precio_venta_usd,
                    stock_actual: producto.stock_actual,
                },
            ];
        });
    };

    // Auto-agregar al presionar Enter si hay coincidencia exacta con código de barras / SKU
    const handleKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const coincidenciaExacta = productos.find(
                (p) => p.codigo_barras === busqueda || p.sku === busqueda
            );
            if (coincidenciaExacta) {
                agregarAlCarrito(coincidenciaExacta);
                setBusqueda('');
            }
        }
    };

    const actualizarCantidad = (productoId: number, nuevaCantidad: number) => {
        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(productoId);
            return;
        }
        setCarrito((prev) =>
            prev.map((item) => {
                if (item.producto_id === productoId) {
                    const cantFinal = Math.min(nuevaCantidad, item.stock_actual);
                    return { ...item, cantidad: cantFinal };
                }
                return item;
            })
        );
    };

    const eliminarDelCarrito = (productoId: number) => {
        setCarrito((prev) => prev.filter((item) => item.producto_id !== productoId));
    };

    // Cálculos de totales
    const subtotalUsd = useMemo(() => {
        return carrito.reduce((sum, item) => sum + item.cantidad * item.precio_unitario_usd, 0);
    }, [carrito]);

    const totalUsd = useMemo(() => {
        return Math.max(0, subtotalUsd - (Number(data.descuento_usd) || 0));
    }, [subtotalUsd, data.descuento_usd]);

    const totalVes = useMemo(() => {
        return totalUsd * tasaVes;
    }, [totalUsd, tasaVes]);

    const handleProcesarVenta = (e: React.FormEvent) => {
        e.preventDefault();
        if (carrito.length === 0) return;

        post(route('pos.store'), {
            onSuccess: () => {
                setCarrito([]);
                reset();
                if (searchInputRef.current) searchInputRef.current.focus();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Punto de Venta (POS)', href: '/pos' }]}>
            <div className="p-4 max-w-[1600px] mx-auto h-[calc(100vh-80px)] flex flex-col gap-4">
                
                {/* Banner de Errores o Mensajes */}
                {pageErrors?.error && (
                    <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm">
                        {pageErrors.error}
                    </div>
                )}
                {flash?.message && (
                    <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-lg text-sm">
                        {flash.message}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
                    
                    {/* PANEL IZQUIERDO: Catálogo de Productos y Buscador */}
                    <div className="lg:col-span-7 flex flex-col bg-white border rounded-lg p-4 shadow-sm overflow-hidden">
                        
                        {/* Buscador */}
                        <div className="mb-4">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                onKeyDown={handleKeyDownSearch}
                                placeholder="Buscar por producto, modelo, SKU o escanear código de barras..."
                                className="w-full text-base px-4 py-2.5 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                                autoFocus
                            />
                        </div>

                        {/* Parrilla de Productos */}
                        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pr-1">
                            {productosFiltrados.length === 0 ? (
                                <div className="col-span-full text-center py-12 text-gray-400">
                                    No se encontraron productos disponibles.
                                </div>
                            ) : (
                                productosFiltrados.map((prod) => (
                                    <button
                                        key={prod.id}
                                        type="button"
                                        onClick={() => agregarAlCarrito(prod)}
                                        className="flex flex-col justify-between p-3 border rounded-xl text-left bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 transition-all group h-32"
                                    >
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-gray-400 block truncate">
                                                {prod.categoria?.nombre || 'General'}
                                            </span>
                                            <h3 className="font-semibold text-gray-800 text-xs line-clamp-2 leading-tight group-hover:text-indigo-600">
                                                {prod.nombre}
                                            </h3>
                                        </div>
                                        <div className="mt-2 flex justify-between items-end">
                                            <div>
                                                <p className="text-sm font-extrabold text-indigo-700">
                                                    ${prod.precio_venta_usd.toFixed(2)}
                                                </p>
                                                {tasaVes > 0 && (
                                                    <p className="text-[10px] text-gray-500 font-medium">
                                                        Bs. {(prod.precio_venta_usd * tasaVes).toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-gray-200 text-gray-700">
                                                Stock: {prod.stock_actual}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* PANEL DERECHO: Carrito de Compras y Cobro */}
                    <div className="lg:col-span-5 flex flex-col bg-white border rounded-lg shadow-sm overflow-hidden">
                        
                        <div className="p-3 bg-gray-800 text-white flex justify-between items-center">
                            <h2 className="font-bold text-sm tracking-wide">TICKET DE VENTA</h2>
                            <div className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-200">
                                Tasa: <span className="font-bold text-green-400">{tasaVes > 0 ? `${tasaVes} VES` : 'Sin Tasa'}</span>
                            </div>
                        </div>

                        {/* Listado de Ítems en el Carrito */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 border-b">
                            {carrito.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                                    <svg className="w-12 h-12 stroke-current opacity-50" fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                                    </svg>
                                    <p className="text-sm">Carrito vacío. Selecciona productos a la izquierda.</p>
                                </div>
                            ) : (
                                carrito.map((item) => (
                                    <div key={item.producto_id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border text-xs">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <p className="font-bold text-gray-800 truncate">{item.nombre}</p>
                                            <p className="text-gray-400">${item.precio_unitario_usd.toFixed(2)} c/u</p>
                                        </div>

                                        {/* Controles Cantidad */}
                                        <div className="flex items-center space-x-1">
                                            <button
                                                type="button"
                                                onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                                                className="w-6 h-6 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-bold text-sm">{item.cantidad}</span>
                                            <button
                                                type="button"
                                                onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                                                className="w-6 h-6 bg-gray-200 text-gray-800 rounded font-bold hover:bg-gray-300"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="w-20 text-right font-extrabold text-indigo-700 text-sm">
                                            ${(item.cantidad * item.precio_unitario_usd).toFixed(2)}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => eliminarDelCarrito(item.producto_id)}
                                            className="ml-2 text-red-500 hover:text-red-700 font-bold p-1"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Formulario de Checkout */}
                        <form onSubmit={handleProcesarVenta} className="p-4 space-y-3 bg-gray-50">
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600">Método de Pago</label>
                                    <select
                                        value={data.metodo_pago}
                                        onChange={(e) => setData('metodo_pago', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-xs font-medium focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                        <option value="efectivo_usd">Efectivo ($ USD)</option>
                                        <option value="efectivo_ves">Efectivo (Bs. VES)</option>
                                        <option value="pago_movil">Pago Móvil</option>
                                        <option value="zelle">Zelle</option>
                                        <option value="punto">Punto de Venta</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600">Descuento ($ USD)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.descuento_usd}
                                        onChange={(e) => setData('descuento_usd', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-xs focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Resumen Totales */}
                            <div className="bg-white p-3 rounded-lg border space-y-1">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Subtotal:</span>
                                    <span>${subtotalUsd.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-black text-gray-900 border-t pt-1">
                                    <span>TOTAL USD:</span>
                                    <span className="text-indigo-600">${totalUsd.toFixed(2)}</span>
                                </div>
                                {tasaVes > 0 && (
                                    <div className="flex justify-between text-xs font-bold text-green-700 pt-0.5">
                                        <span>TOTAL VES:</span>
                                        <span>Bs. {totalVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || carrito.length === 0}
                                className="w-full py-3 bg-emerald-600 text-white font-black text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md"
                            >
                                {processing ? 'PROCESANDO VENTA...' : 'COBRAR / PROCESAR VENTA'}
                            </button>
                        </form>
                    </div>

                </div>
            </div>

            {/* Componente Ticket Modal */}
            {ticketActivo && (
                <TicketPrint
                    venta={ticketActivo}
                    onClose={() => setTicketActivo(null)}
                />
            )}
        </AppLayout>
    );
}