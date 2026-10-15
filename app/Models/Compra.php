<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Compra extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'compras';

    protected $fillable = [
        'numero',
        'proveedor_id',
        'factura_proveedor',
        'fecha_compra',
        'tasas_cambio_id',
        'tasa_cambio_ves_por_usd',
        'subtotal_usd',
        'descuento_usd',
        'total_usd',
        'total_ves',
        'estado',
        'notas',
        'creado_por',
    ];

    protected $casts = [
        'fecha_compra' => 'datetime',
        'tasa_cambio_ves_por_usd' => 'float',
        'subtotal_usd' => 'float',
        'descuento_usd' => 'float',
        'total_usd' => 'float',
        'total_ves' => 'float',
    ];

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class, 'proveedor_id');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleCompra::class, 'compra_id');
    }

    public function lotes(): HasMany
    {
        return $this->hasMany(LoteInventario::class, 'compra_id');
    }
}