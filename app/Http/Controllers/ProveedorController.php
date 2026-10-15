<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProveedorRequest;
use App\Http\Requests\UpdateProveedorRequest;
use App\Models\Proveedor;
use App\Services\ProveedorService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class ProveedorController extends Controller
{
    protected ProveedorService $proveedorService;

    public function __construct(ProveedorService $proveedorService)
    {
        $this->proveedorService = $proveedorService;
    }

    public function index(): Response
    {
        return Inertia::render('Proveedores/Index', [
            'proveedores' => $this->proveedorService->listarTodos(),
        ]);
    }

    public function store(StoreProveedorRequest $request): RedirectResponse
    {
        $this->proveedorService->crear($request->validated());
        return redirect()->back()->with('message', 'Proveedor registrado exitosamente.');
    }

    public function update(UpdateProveedorRequest $request, Proveedor $proveedor): RedirectResponse
    {
        $this->proveedorService->actualizar($proveedor, $request->validated());
        return redirect()->back()->with('message', 'Proveedor actualizado correctamente.');
    }
}