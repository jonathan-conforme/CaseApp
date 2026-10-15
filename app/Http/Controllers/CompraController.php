<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCompraRequest;
use App\Models\Compra;
use App\Services\CompraService;
use App\Services\ProductoService;
use App\Services\ProveedorService;
use App\Services\TasaCambioService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CompraController extends Controller
{
    protected CompraService $compraService;
    protected ProveedorService $proveedorService;
    protected ProductoService $productoService;
    protected TasaCambioService $tasaCambioService;

    public function __construct(
        CompraService $compraService,
        ProveedorService $proveedorService,
        ProductoService $productoService,
        TasaCambioService $tasaCambioService
    ) {
        $this->compraService = $compraService;
        $this->proveedorService = $proveedorService;
        $this->productoService = $productoService;
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

        return Inertia::render('Compras/Index', [
            'compras' => Compra::with(['proveedor', 'detalles.producto'])
                ->orderBy('fecha_compra', 'desc')
                ->get(),
            'proveedores' => $this->proveedorService->listarActivos(),
            'productos' => $this->productoService->obtenerTodos(),
            'tasaVes' => (float) $tasaVes,
        ]);
    }

    public function store(StoreCompraRequest $request): RedirectResponse
    {
        $this->compraService->registrarCompra(
            datos: $request->validated(),
            userId: auth()->id()
        );

        return redirect()->back()->with('message', 'Orden de compra registrada y lotes creados exitosamente.');
    }
}