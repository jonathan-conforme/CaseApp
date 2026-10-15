<?php

namespace App\Services;

use App\Models\Compra;
use App\Models\DetalleCompra;
use App\Models\LoteInventario;
use App\Models\Producto;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CompraService
{
    protected TasaCambioService $tasaCambioService;

    public function __construct(TasaCambioService $tasaCambioService)
    {
        $this->tasaCambioService = $tasaCambioService;
    }

    public function registrarCompra(array $datos, int $userId): Compra
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
                $subtotalUsd += $item['cantidad'] * $item['costo_unitario_usd'];
            }

            $descuentoUsd = $datos['descuento_usd'] ?? 0;
            $totalUsd = max(0, $subtotalUsd - $descuentoUsd);
            $totalVes = round($totalUsd * $tasaValor, 2);

            // 1. Crear la Compra
            $compra = Compra::create([
                'numero' => 'CMP-'.strtoupper(uniqid()),
                'proveedor_id' => $datos['proveedor_id'],
                'factura_proveedor' => $datos['factura_proveedor'] ?? null,
                'fecha_compra' => $datos['fecha_compra'] ?? now(),
                'tasas_cambio_id' => $tasaActual?->id,
                'tasa_cambio_ves_por_usd' => $tasaValor,
                'subtotal_usd' => $subtotalUsd,
                'descuento_usd' => $descuentoUsd,
                'total_usd' => $totalUsd,
                'total_ves' => $totalVes,
                'estado' => 'completado',
                'notas' => $datos['notas'] ?? null,
                'creado_por' => $userId,
            ]);

            // 2. Procesar ítems, crear Lotes FIFO y actualizar Stock
            foreach ($datos['items'] as $item) {
                $itemSubtotal = $item['cantidad'] * $item['costo_unitario_usd'];

                $detalle = DetalleCompra::create([
                    'compra_id' => $compra->id,
                    'producto_id' => $item['producto_id'],
                    'cantidad' => $item['cantidad'],
                    'costo_unitario_usd' => $item['costo_unitario_usd'],
                    'subtotal_usd' => $itemSubtotal,
                ]);

                // Generar código de lote único (ejemplo: LOT-20261015-A1B2)
                $codigoLote = 'LOT-'.date('Ymd').'-'.strtoupper(Str::random(4));

                // Dentro del foreach en registrarCompra():
                $codigoLote = 'LOT-'.date('Ymd').'-'.strtoupper(Str::random(4));

                LoteInventario::create([
                    'detalle_compra_id' => $detalle->id,
                    'producto_id' => $item['producto_id'],
                    'proveedor_id' => $datos['proveedor_id'],
                    'codigo_lote' => $codigoLote,
                    'cantidad_recibida' => $item['cantidad'],
                    'cantidad_disponible' => $item['cantidad'],
                    'costo_unitario_usd' => $item['costo_unitario_usd'],
                    'fecha_recepcion' => $datos['fecha_compra'] ?? now(),
                ]);

                // Incrementar stock global del producto
                $producto = Producto::findOrFail($item['producto_id']);
                $producto->increment('stock_actual', $item['cantidad']);

                // Sincronizar último costo en la relación con proveedores
                $producto->proveedores()->syncWithoutDetaching([
                    $datos['proveedor_id'] => [
                        'ultimo_costo_usd' => $item['costo_unitario_usd'],
                        'activo' => true,
                    ],
                ]);
            }

            return $compra;
        });
    }
}
