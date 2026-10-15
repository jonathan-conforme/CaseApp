import React from 'react';

interface DetalleVenta {
    id: number;
    cantidad: number;
    precio_unitario_usd: number;
    subtotal_usd: number;
    producto?: {
        nombre: string;
    };
}

export interface VentaTicket {
    id: number;
    numero: string;
    fecha_venta: string;
    subtotal_usd: number;
    descuento_usd: number;
    total_usd: number;
    total_ves: number;
    tasa_cambio_ves_por_usd: number;
    metodo_pago: string;
    detalles: DetalleVenta[];
    creador?: {
        name: string;
    };
}

interface Props {
    venta: VentaTicket | null;
    onClose: () => void;
}

const METODOS_PAGO_LABEL: Record<string, string> = {
    efectivo_usd: 'Efectivo ($ USD)',
    efectivo_ves: 'Efectivo (Bs. VES)',
    pago_movil: 'Pago Móvil',
    zelle: 'Zelle',
    punto: 'Punto de Venta',
};

export default function TicketPrint({ venta, onClose }: Props) {
    if (!venta) return null;

    const handleImprimir = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Encabezado Modal (Oculto en Impresión) */}
                <div className="p-4 bg-gray-900 text-white flex justify-between items-center print:hidden">
                    <h3 className="font-bold text-sm">Comprobante de Venta</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handleImprimir}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded"
                        >
                            🖨️ Imprimir
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-bold px-2.5 py-1.5 rounded"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* AREA IMPRESA (Ticket 80mm) */}
                <div id="printable-ticket" className="p-4 overflow-y-auto text-black font-mono text-xs leading-tight space-y-3 bg-white">
                    {/* Datos de la Tienda */}
                    <div className="text-center space-y-1">
                        <h2 className="font-black text-base uppercase">TIENDA DE ESTUCHES</h2>
                        <p className="text-[10px]">RIF: J-00000000-0</p>
                        <p className="text-[10px]">Punto de Venta / POS</p>
                        <p className="text-[10px] border-b border-dashed border-black pb-2">
                            {new Date(venta.fecha_venta).toLocaleString()}
                        </p>
                    </div>

                    {/* Metadata Ticket */}
                    <div className="space-y-0.5 text-[11px]">
                        <p><span className="font-bold">Ticket N°:</span> {venta.numero}</p>
                        <p><span className="font-bold">Cajero:</span> {venta.creador?.name || 'Sistema'}</p>
                        <p><span className="font-bold">Pago:</span> {METODOS_PAGO_LABEL[venta.metodo_pago] || venta.metodo_pago}</p>
                    </div>

                    {/* Items */}
                    <div className="border-t border-b border-dashed border-black py-2 space-y-1">
                        <div className="flex justify-between font-bold text-[10px] uppercase">
                            <span>Cant x Item</span>
                            <span>Total $</span>
                        </div>
                        {venta.detalles?.map((d) => (
                            <div key={d.id} className="space-y-0.5">
                                <p className="font-bold truncate">{d.producto?.nombre}</p>
                                <div className="flex justify-between text-[11px] pl-2 text-gray-800">
                                    <span>{d.cantidad} x ${d.precio_unitario_usd.toFixed(2)}</span>
                                    <span className="font-bold">${d.subtotal_usd.toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Totales */}
                    <div className="space-y-1 text-right text-[11px]">
                        {venta.descuento_usd > 0 && (
                            <p>Descuento: <span className="font-bold">-${venta.descuento_usd.toFixed(2)}</span></p>
                        )}
                        <p className="text-sm font-black">
                            TOTAL USD: ${venta.total_usd.toFixed(2)}
                        </p>
                        {venta.tasa_cambio_ves_por_usd > 0 && (
                            <>
                                <p className="text-[10px] text-gray-700">Tasa: {venta.tasa_cambio_ves_por_usd} VES/USD</p>
                                <p className="text-xs font-bold text-black">
                                    TOTAL VES: Bs. {venta.total_ves.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Pie del ticket */}
                    <div className="text-center pt-3 border-t border-dashed border-black space-y-1 text-[10px]">
                        <p className="font-bold">¡Gracias por su compra!</p>
                        <p>Conserve este ticket para garantias</p>
                    </div>
                </div>

            </div>

            {/* Reglas CSS para aislar el ticket y formatear papel térmico */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #printable-ticket, #printable-ticket * {
                        visibility: visible !important;
                    }
                    #printable-ticket {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 80mm !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    @page {
                        size: 80mm auto;
                        margin: 0mm;
                    }
                }
            `}</style>
        </div>
    );
}