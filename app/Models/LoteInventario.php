<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoteInventario extends Model
{
    use HasFactory;

    protected $table = 'lotes_inventarios';

    protected $fillable = [
        'detalle_compra_id',
        'producto_id',
        'proveedor_id',
        'codigo_lote',
        'cantidad_recibida',
        'cantidad_disponible',
        'costo_unitario_usd',
        'fecha_recepcion',
    ];

    protected $casts = [
        'cantidad_recibida' => 'float',
        'cantidad_disponible' => 'float',
        'costo_unitario_usd' => 'float',
        'fecha_recepcion' => 'datetime',
    ];

    public function detalleCompra(): BelongsTo
    {
        return $this->belongsTo(DetalleCompra::class, 'detalle_compra_id');
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class, 'proveedor_id');
    }
}