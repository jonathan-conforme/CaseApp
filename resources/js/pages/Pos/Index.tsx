import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, usePage, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import TicketPrint, { VentaTicket } from '@/components/TicketPrint';
import {
    Search,
    Barcode,
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    Coins,
    CreditCard,
    DollarSign,
    CheckCircle2,
    AlertCircle,
    X,
    Tag,
    Boxes,
    Zap,
    Banknote,
    QrCode,
    Smartphone,
} from 'lucide-react';

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

interface PaginatedResponse<T> {
    data: T[];
    total: number;
}

interface Props {
    productos: Producto[] | PaginatedResponse<Producto>;
    tasaVes: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Punto de Venta (POS)', href: '/pos' },
];

export default function Index({ productos, tasaVes }: Props) {
    const { flash, errors: pageErrors } = usePage().props as any;
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [ticketActivo, setTicketActivo] = useState<VentaTicket | null>(null);

    const [busqueda, setBusqueda] = useState('');
    const [carrito, setCarrito] = useState<ItemCarrito[]>([]);

    // Normaliza 'productos' para evitar errores si viene de un paginate()
    const listaProductos = useMemo<Producto[]>(() => {
        if (Array.isArray(productos)) return productos;
        if (productos && Array.isArray((productos as any).data)) return (productos as any).data;
        return [];
    }, [productos]);

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
        if (!busqueda.trim()) return listaProductos;
        const q = busqueda.toLowerCase();
        return listaProductos.filter(
            (p) =>
                p.nombre.toLowerCase().includes(q) ||
                (p.sku && p.sku.toLowerCase().includes(q)) ||
                (p.codigo_barras && p.codigo_barras.toLowerCase().includes(q))
        );
    }, [busqueda, listaProductos]);

    // Agregar producto al carrito
    const agregarAlCarrito = (producto: Producto) => {
        if (producto.stock_actual <= 0) return;

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
                    precio_unitario_usd: Number(producto.precio_venta_usd),
                    stock_actual: producto.stock_actual,
                },
            ];
        });
    };

    // Auto-agregar al presionar Enter si hay coincidencia exacta con código de barras / SKU
    const handleKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const coincidenciaExacta = listaProductos.find(
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Punto de Venta (POS)" />

            <div className="min-h-[calc(100vh-80px)] bg-[#06141B] text-[#CCD0CF] p-3 md:p-6 flex flex-col gap-4">

               

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">

                    {/* PANEL IZQUIERDO: Catálogo de Productos y Buscador */}
                    <div className="lg:col-span-7 flex flex-col bg-[#11212D] border border-[#253745] rounded-2xl p-4 shadow-xl overflow-hidden">

                        {/* Buscador Interactivo para Escáner o Teclado */}
                        <div className="relative mb-4">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9BA8AB]">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                onKeyDown={handleKeyDownSearch}
                                placeholder="Buscar por producto, modelo, SKU o escanear código de barras..."
                                className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#06141B] border border-[#253745] text-white text-xs md:text-sm focus:outline-hidden focus:border-[#4A5C6A] focus:ring-1 focus:ring-[#4A5C6A] transition-all placeholder:text-[#4A5C6A]"
                                autoFocus
                            />
                            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#4A5C6A]">
                                <Barcode className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Parrilla de Productos */}
                        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pr-1 max-h-[calc(100vh-230px)]">
                            {productosFiltrados.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-16 text-[#9BA8AB] space-y-2">
                                    <Boxes className="w-10 h-10 text-[#253745]" />
                                    <p className="text-xs">No se encontraron productos disponibles.</p>
                                </div>
                            ) : (
                                productosFiltrados.map((prod) => {
                                    const sinStock = prod.stock_actual <= 0;
                                    return (
                                        <button
                                            key={prod.id}
                                            type="button"
                                            disabled={sinStock}
                                            onClick={() => agregarAlCarrito(prod)}
                                            className={`group relative flex flex-col justify-between p-3.5 rounded-xl text-left border transition-all cursor-pointer h-36 ${
                                                sinStock
                                                    ? 'bg-[#06141B]/40 border-[#253745]/40 opacity-40 cursor-not-allowed'
                                                    : 'bg-[#06141B] border-[#253745] hover:border-[#4A5C6A] hover:bg-[#253745]/30 active:scale-95'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-1 mb-1">
                                                    <span className="text-[10px] uppercase font-bold text-[#9BA8AB] truncate flex items-center gap-1">
                                                        <Tag className="w-3 h-3 text-[#4A5C6A]" />
                                                        {prod.categoria?.nombre || 'General'}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-[#CCD0CF] text-xs line-clamp-2 leading-snug group-hover:text-white transition-colors">
                                                    {prod.nombre}
                                                </h3>
                                            </div>

                                            <div className="mt-2 flex items-end justify-between border-t border-[#253745]/50 pt-2">
                                                <div>
                                                    <p className="text-sm font-black font-mono text-emerald-400 flex items-center">
                                                        <DollarSign className="w-3.5 h-3.5" />
                                                        {Number(prod.precio_venta_usd).toFixed(2)}
                                                    </p>
                                                    {tasaVes > 0 && (
                                                        <p className="text-[10px] text-[#9BA8AB] font-mono font-medium">
                                                            Bs. {(prod.precio_venta_usd * tasaVes).toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                                        sinStock
                                                            ? 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                                                            : 'bg-[#253745] text-[#CCD0CF] border-[#4A5C6A]/50'
                                                    }`}
                                                >
                                                    {prod.stock_actual}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* PANEL DERECHO: Carrito de Compras y Cobro */}
                    <div className="lg:col-span-5 flex flex-col bg-[#11212D] border border-[#253745] rounded-2xl shadow-xl overflow-hidden">

                        {/* Header Ticket */}
                        <div className="p-4 bg-[#06141B] border-b border-[#253745] flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-[#9BA8AB]" />
                                <h2 className="font-extrabold text-xs tracking-wider uppercase text-white">
                                    Ticket de Venta
                                </h2>
                            </div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#11212D] border border-[#253745] text-[11px] text-[#9BA8AB] font-semibold">
                                <Coins className="w-3.5 h-3.5 text-[#4A5C6A]" />
                                <span>Tasa:</span>
                                <span className="text-emerald-400 font-mono font-bold">
                                    {tasaVes > 0 ? `${tasaVes} VES` : 'Sin Tasa'}
                                </span>
                            </div>
                        </div>

                        {/* Listado de Ítems en el Carrito */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[calc(100vh-380px)] min-h-[180px]">
                            {carrito.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-[#9BA8AB] space-y-2 py-10">
                                    <ShoppingCart className="w-10 h-10 text-[#253745]" />
                                    <p className="text-xs">Carrito vacío. Selecciona productos a la izquierda.</p>
                                </div>
                            ) : (
                                carrito.map((item) => (
                                    <div
                                        key={item.producto_id}
                                        className="flex items-center justify-between bg-[#06141B] p-3 rounded-xl border border-[#253745] text-xs gap-2"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-[#CCD0CF] truncate">{item.nombre}</p>
                                            <p className="text-[11px] text-[#9BA8AB] font-mono">
                                                ${item.precio_unitario_usd.toFixed(2)} c/u
                                            </p>
                                        </div>

                                        {/* Controles Cantidad */}
                                        <div className="flex items-center gap-1 bg-[#11212D] p-1 rounded-lg border border-[#253745]">
                                            <button
                                                type="button"
                                                onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-[#253745] hover:bg-[#4A5C6A] text-white rounded-md transition-colors cursor-pointer"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-7 text-center font-bold text-xs text-white font-mono">
                                                {item.cantidad}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-[#253745] hover:bg-[#4A5C6A] text-white rounded-md transition-colors cursor-pointer"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <div className="w-20 text-right font-black font-mono text-emerald-400 text-xs">
                                            ${ (item.cantidad * item.precio_unitario_usd).toFixed(2) }
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => eliminarDelCarrito(item.producto_id)}
                                            className="p-1 text-[#9BA8AB] hover:text-rose-400 transition-colors cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Formulario Checkout */}
                        <form onSubmit={handleProcesarVenta} className="p-4 space-y-4 bg-[#06141B] border-t border-[#253745]">

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9BA8AB]">
                                        Método de Pago
                                    </label>
                                    <select
                                        value={data.metodo_pago}
                                        onChange={(e) => setData('metodo_pago', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#11212D] border border-[#253745] text-white text-xs font-medium focus:outline-hidden focus:border-[#4A5C6A] transition-all"
                                    >
                                        <option value="efectivo_usd" className="bg-[#11212D]">Efectivo ($ USD)</option>
                                        <option value="efectivo_ves" className="bg-[#11212D]">Efectivo (Bs. VES)</option>
                                        <option value="pago_movil" className="bg-[#11212D]">Pago Móvil</option>
                                        <option value="zelle" className="bg-[#11212D]">Zelle</option>
                                        <option value="punto" className="bg-[#11212D]">Punto de Venta</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9BA8AB]">
                                        Descuento ($ USD)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.descuento_usd}
                                        onChange={(e) => setData('descuento_usd', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[#11212D] border border-[#253745] text-white text-xs font-mono focus:outline-hidden focus:border-[#4A5C6A] transition-all"
                                    />
                                </div>
                            </div>

                            {/* Resumen Totales */}
                            <div className="bg-[#11212D] p-3.5 rounded-xl border border-[#253745] space-y-1.5">
                                <div className="flex justify-between text-xs text-[#9BA8AB]">
                                    <span>Subtotal:</span>
                                    <span className="font-mono font-semibold text-[#CCD0CF]">${subtotalUsd.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-baseline text-lg font-black text-white border-t border-[#253745] pt-1.5">
                                    <span className="text-xs uppercase tracking-wider text-[#9BA8AB]">Total USD:</span>
                                    <span className="font-mono text-emerald-400 text-xl">${totalUsd.toFixed(2)}</span>
                                </div>
                                {tasaVes > 0 && (
                                    <div className="flex justify-between items-center text-xs font-bold text-[#CCD0CF] pt-0.5">
                                        <span className="text-[10px] uppercase text-[#9BA8AB]">Total VES:</span>
                                        <span className="font-mono">
                                            Bs. {totalVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || carrito.length === 0}
                                className="w-full py-3.5 rounded-xl bg-[#253745] hover:bg-[#4A5C6A] text-white font-black text-xs uppercase tracking-wider border border-[#4A5C6A]/60 shadow-lg disabled:opacity-40 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
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
