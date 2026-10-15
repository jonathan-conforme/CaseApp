<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleVentaLote extends Model
{
    use HasFactory;

    protected $table = 'detalle_venta_lotes';

    protected $fillable = [
        'detalle_venta_id',
        'lote_inventario_id',
        'cantidad',
        'costo_unitario_usd',
    ];

    public function lote(): BelongsTo
    {
        return $this->belongsTo(LoteInventario::class, 'lote_inventario_id');
    }
}