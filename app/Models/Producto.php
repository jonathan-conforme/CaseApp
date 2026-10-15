<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Producto extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'productos';

    protected $fillable = [
        'categoria_id',
        'codigo_barras',
        'nombre',
        'descripcion',
        'precio_venta_usd',
        'stock_minimo',
        'stock_actual',
        'activo',
    ];

    protected $casts = [
        'precio_venta_usd' => 'float',
        'stock_minimo' => 'integer',
        'stock_actual' => 'integer',
        'activo' => 'boolean',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function proveedores(): BelongsToMany
    {
        return $this->belongsToMany(Proveedor::class, 'productos_proveedores')
                    ->withPivot('sku_proveedor', 'ultimo_costo_usd', 'activo')
                    ->withTimestamps();
    }
}