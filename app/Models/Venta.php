<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Venta extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'ventas';

    protected $fillable = [
        'numero',
        'fecha venta',
        'tasas_cambio_id',
        'tasa_cambio_ves_por_usd',
        'subtotal_usd',
        'descuento_usd',
        'total_usd',
        'total_ves',
        'costo_total_usd',
        'ganancia_total_usd',
        'metodo_pago',
        'estado',
        'notas',
        'creado_por',
    ];

    protected $casts = [
        'tasa_cambio_ves_por_usd' => 'float',
        'subtotal_usd' => 'float',
        'descuento_usd' => 'float',
        'total_usd' => 'float',
        'total_ves' => 'float',
        'costo_total_usd' => 'float',
        'ganancia_total_usd' => 'float',
    ];

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleVenta::class, 'venta_id');
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por');
    }
}
