<?php

namespace App\Services;

use App\Models\Producto;
use Illuminate\Database\Eloquent\Collection;

class ProductoService
{
    public function obtenerTodos(): Collection
    {
        return Producto::with(['categoria', 'proveedores'])
            ->orderBy('nombre')
            ->get();
    }

    public function crear(array $datos): Producto
    {
        $producto = Producto::create([
            'categoria_id' => $datos['categoria_id'],
            'sku' => $datos['sku'] ?? null,
            'codigo_barras' => $datos['codigo_barras'] ?? null,
            'nombre' => $datos['nombre'],
            'descripcion' => $datos['descripcion'] ?? null,
            'precio_venta_usd' => $datos['precio_venta_usd'],
            'stock_minimo' => $datos['stock_minimo'] ?? 5,
            'activo' => $datos['activo'] ?? true,
        ]);

        if (!empty($datos['proveedores'])) {
            $syncData = [];
            foreach ($datos['proveedores'] as $p) {
                $syncData[$p['proveedor_id']] = [
                    'sku_proveedor' => $p['sku_proveedor'] ?? null,
                    'ultimo_costo_usd' => $p['ultimo_costo_usd'] ?? 0.00,
                ];
            }
            $producto->proveedores()->sync($syncData);
        }

        return $producto;
    }

    public function actualizar(Producto $producto, array $datos): Producto
    {
        $producto->update([
            'categoria_id' => $datos['categoria_id'],
            'sku' => $datos['sku'] ?? null,
            'codigo_barras' => $datos['codigo_barras'] ?? null,
            'nombre' => $datos['nombre'],
            'descripcion' => $datos['descripcion'] ?? null,
            'precio_venta_usd' => $datos['precio_venta_usd'],
            'stock_minimo' => $datos['stock_minimo'],
            'activo' => $datos['activo'] ?? $producto->activo,
        ]);

        if (isset($datos['proveedores'])) {
            $syncData = [];
            foreach ($datos['proveedores'] as $p) {
                $syncData[$p['proveedor_id']] = [
                    'sku_proveedor' => $p['sku_proveedor'] ?? null,
                    'ultimo_costo_usd' => $p['ultimo_costo_usd'] ?? 0.00,
                ];
            }
            $producto->proveedores()->sync($syncData);
        }

        return $producto;
    }
}