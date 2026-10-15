<?php

namespace App\Services;

use App\Models\Categoria;
use Illuminate\Database\Eloquent\Collection;

class CategoriaService
{
    public function obtenerTodas(): Collection
    {
        return Categoria::withCount('productos')
            ->orderBy('nombre')
            ->get();
    }

    public function obtenerActivas(): Collection
    {
        return Categoria::where('activo', true)
            ->orderBy('nombre')
            ->get();
    }

    public function crear(array $datos): Categoria
    {
        return Categoria::create([
            'nombre' => $datos['nombre'],
            'descripcion' => $datos['descripcion'] ?? null,
            'activo' => $datos['activo'] ?? true,
        ]);
    }

    public function actualizar(Categoria $categoria, array $datos): Categoria
    {
        $categoria->update([
            'nombre' => $datos['nombre'],
            'descripcion' => $datos['descripcion'] ?? null,
            'activo' => $datos['activo'] ?? $categoria->activo,
        ]);

        return $categoria;
    }
}