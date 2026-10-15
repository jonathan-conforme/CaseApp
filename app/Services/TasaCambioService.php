<?php

namespace App\Services;

use App\Models\TasaCambio;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TasaCambioService
{
    /**
     * Obtiene la tasa de cambio activa actualmente.
     */
    public function obtenerTasaActual(): TasaCambio
    {
        $tasa = TasaCambio::where('es_actual', true)->first();

        if (!$tasa) {
            throw new Exception("No hay ninguna tasa de cambio activa configurada.");
        }

        return $tasa;
    }

    /**
     * Convierte un monto en USD a Bolívares (VES) según la tasa indicada o la actual.
     */
    public function convertirUsdAVes(float $montoUsd, ?float $tasaVes = null): float
    {
        $tasa = $tasaVes ?? $this->obtenerTasaActual()->ves_por_usd;
        return round($montoUsd * $tasa, 2);
    }

    /**
     * Registra una nueva tasa y desactiva la anterior.
     */
    public function actualizarTasa(float $nuevoValorVes, ?string $notas = null, ?int $userId = null): TasaCambio
    {
        TasaCambio::where('es_actual', true)->update(['es_actual' => false]);

        return TasaCambio::create([
            'ves_por_usd' => $nuevoValorVes,
            'fecha_vigencia' => now(),
            'es_actual' => true,
            'creado_por' => $userId,
            'notas' => $notas,
        ]);


    }
    /**
     * Reactiva una tasa existente del historial y desactiva la actual.
     */
    public function activarTasa(TasaCambio $tasa): TasaCambio
    {
        return DB::transaction(function () use ($tasa) {
            TasaCambio::where('es_actual', true)->update(['es_actual' => false]);

            $tasa->update([
                'es_actual' => true,
                'fecha_vigencia' => now(), // Se actualiza la vigencia al momento de reactivación
            ]);

            return $tasa;
        });
    }
}
