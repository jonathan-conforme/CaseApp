<?php

namespace App\Services;

use App\Models\Proveedor;
use Illuminate\Database\Eloquent\Collection;

class ProveedorService
{
    public function listarActivos(): Collection
    {
        return Proveedor::where('activo', true)->orderBy('nombre')->get();
    }

    public function listarTodos(): Collection
    {
        return Proveedor::orderBy('nombre')->get();
    }

    public function crear(array $datos): Proveedor
    {
        return Proveedor::create($datos);
    }

    public function actualizar(Proveedor $proveedor, array $datos): Proveedor
    {
        $proveedor->update($datos);
        return $proveedor;
    }
}