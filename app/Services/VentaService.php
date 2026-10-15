<?php

namespace App\Services;

use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\DetalleVentaLote;
use App\Models\LoteInventario;
use App\Models\Producto;
use Illuminate\Support\Facades\DB;
use Exception;

class VentaService
{
    protected TasaCambioService $tasaCambioService;

    public function __construct(TasaCambioService $tasaCambioService)
    {
        $this->tasaCambioService = $tasaCambioService;
    }

    public function procesarVenta(array $datos, int $userId): Venta
    {
        return DB::transaction(function () use ($datos, $userId) {
            $tasaActual = null;
            $tasaValor = 0;

            try {
                $tasaActual = $this->tasaCambioService->obtenerTasaActual();
                $tasaValor = $tasaActual->ves_por_usd;
            } catch (Exception $e) {
                $tasaValor = 0;
            }

            $subtotalUsd = 0;
            foreach ($datos['items'] as $item) {
                $subtotalUsd += $item['cantidad'] * $item['precio_unitario_usd'];
            }

            $descuentoUsd = $datos['descuento_usd'] ?? 0;
            $totalUsd = max(0, $subtotalUsd - $descuentoUsd);
            $totalVes = round($totalUsd * $tasaValor, 2);

            // 1. Crear Venta vacía inicialmente
            $venta = Venta::create([
                'numero' => 'VEN-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4)),
                'fecha_venta' => now(),
                'tasas_cambio_id' => $tasaActual?->id,
                'tasa_cambio_ves_por_usd' => $tasaValor,
                'subtotal_usd' => $subtotalUsd,
                'descuento_usd' => $descuentoUsd,
                'total_usd' => $totalUsd,
                'total_ves' => $totalVes,
                'costo_total_usd' => 0,
                'ganancia_total_usd' => 0,
                'metodo_pago' => $datos['metodo_pago'] ?? 'efectivo_usd',
                'estado' => 'completado',
                'notas' => $datos['notas'] ?? null,
                'creado_por' => $userId,
            ]);

            $costoAcumuladoVentaUsd = 0;

            // 2. Procesar deducción FIFO por producto
            foreach ($datos['items'] as $item) {
                $producto = Producto::findOrFail($item['producto_id']);
                $cantidadRequerida = (int) $item['cantidad'];

                if ($producto->stock_actual < $cantidadRequerida) {
                    throw new Exception("Stock insuficiente para el producto: {$producto->nombre}. Disponible: {$producto->stock_actual}");
                }

                // Buscar lotes activos ordenados por la fecha de recepción más antigua (FIFO)
                $lotes = LoteInventario::where('producto_id', $producto->id)
                    ->where('cantidad_disponible', '>', 0)
                    ->orderBy('fecha_recepcion', 'asc')
                    ->get();

                $cantidadPendiente = $cantidadRequerida;
                $costoDetalleUsd = 0;
                $lotesAfectados = [];

                foreach ($lotes as $lote) {
                    if ($cantidadPendiente <= 0) break;

                    $tomarDeEsteLote = min((int)$lote->cantidad_disponible, $cantidadPendiente);
                    $costoDetalleUsd += $tomarDeEsteLote * $lote->costo_unitario_usd;

                    // Descontar del lote
                    $lote->cantidad_disponible -= $tomarDeEsteLote;
                    $lote->save();

                    $lotesAfectados[] = [
                        'lote_inventario_id' => $lote->id,
                        'cantidad' => $tomarDeEsteLote,
                        'costo_unitario_usd' => $lote->costo_unitario_usd,
                    ];

                    $cantidadPendiente -= $tomarDeEsteLote;
                }

                if ($cantidadPendiente > 0) {
                    throw new Exception("Inconsistencia en lotes FIFO para el producto: {$producto->nombre}. Faltan lotes asignados.");
                }

                $subtotalItem = $item['cantidad'] * $item['precio_unitario_usd'];
                $gananciaItem = $subtotalItem - $costoDetalleUsd;

                // Crear Detalle de Venta
                $detalle = DetalleVenta::create([
                    'venta_id' => $venta->id,
                    'producto_id' => $producto->id,
                    'cantidad' => $item['cantidad'],
                    'precio_unitario_usd' => $item['precio_unitario_usd'],
                    'subtotal_usd' => $subtotalItem,
                    'costo_total_usd' => $costoDetalleUsd,
                    'ganancia_usd' => $gananciaItem,
                ]);

                // Guardar relación de lotes consumidos
                foreach ($lotesAfectados as $loteAfectado) {
                    DetalleVentaLote::create([
                        'detalle_venta_id' => $detalle->id,
                        'lote_inventario_id' => $loteAfectado['lote_inventario_id'],
                        'cantidad' => $loteAfectado['cantidad'],
                        'costo_unitario_usd' => $loteAfectado['costo_unitario_usd'],
                    ]);
                }

                // Descontar del stock global del producto
                $producto->decrement('stock_actual', $cantidadRequerida);

                $costoAcumuladoVentaUsd += $costoDetalleUsd;
            }

            // 3. Actualizar costos y ganancias finales de la venta
            $gananciaTotalUsd = $venta->total_usd - $costoAcumuladoVentaUsd;
            $venta->update([
                'costo_total_usd' => $costoAcumuladoVentaUsd,
                'ganancia_total_usd' => $gananciaTotalUsd,
            ]);

            return $venta;
        });
    }
}
