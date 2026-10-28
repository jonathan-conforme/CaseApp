<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DetalleVenta extends Model
{
    use HasFactory;

    protected $table = 'detalle_ventas';

    protected $fillable = [
        'venta_id',
        'producto_id',
        'cantidad',
        'precio_unitario_usd',
        'subtotal_usd',
        'costo_total_usd',
        'ganancia_usd',
    ];

    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class, 'venta_id');
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }

    public function lotesConsumidos(): HasMany
    {
        return $this->hasMany(DetalleVentaLote::class, 'detalle_venta_id');
    }
    // app/Models/DetalleVenta.php

    public function loteInventario()
    {
        return $this->belongsTo(LoteInventario::class, 'lote_inventario_id');
    }
}
