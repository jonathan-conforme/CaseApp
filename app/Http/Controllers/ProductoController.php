<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductoRequest;
use App\Models\Producto;
use App\Services\CategoriaService;
use App\Services\ProductoService;
use App\Services\ProveedorService;
use App\Services\TasaCambioService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductoController extends Controller
{
    protected ProductoService $productoService;
    protected CategoriaService $categoriaService;
    protected ProveedorService $proveedorService;
    protected TasaCambioService $tasaCambioService;

    public function __construct(
        ProductoService $productoService,
        CategoriaService $categoriaService,
        ProveedorService $proveedorService,
        TasaCambioService $tasaCambioService
    ) {
        $this->productoService = $productoService;
        $this->categoriaService = $categoriaService;
        $this->proveedorService = $proveedorService;
        $this->tasaCambioService = $tasaCambioService;
    }

    public function index(): Response
    {
        $tasaVes = 0;
        try {
            $tasaVes = $this->tasaCambioService->obtenerTasaActual()->ves_por_usd;
        } catch (Exception $e) {
            $tasaVes = 0;
        }

        return Inertia::render('Productos/Index', [
            'productos' => $this->productoService->obtenerTodos(),
            'categorias' => $this->categoriaService->obtenerActivas(),
            'proveedores' => $this->proveedorService->listarActivos(),
            'tasaVes' => (float) $tasaVes,
        ]);
    }

    public function store(StoreProductoRequest $request): RedirectResponse
    {
        $this->productoService->crear($request->validated());

        return redirect()->back()->with('message', 'Producto registrado correctamente.');
    }

    public function update(StoreProductoRequest $request, Producto $producto): RedirectResponse
    {
        $this->productoService->actualizar($producto, $request->validated());

        return redirect()->back()->with('message', 'Producto actualizado correctamente.');
    }
}