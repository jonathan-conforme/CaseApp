<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TasaCambio extends Model
{
    use HasFactory;

    protected $table = 'tasas_cambios';

    protected $fillable = [
        'ves_por_usd',
        'fecha_vigencia',
        'es_actual',
        'creado_por',
        'notas',
    ];

    protected $casts = [
        'ves_por_usd' => 'decimal:6',
        'fecha_vigencia' => 'datetime',
        'es_actual' => 'boolean',
    ];

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por');
    }
}
