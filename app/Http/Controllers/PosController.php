<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVentaRequest;
use App\Models\Producto;
use App\Services\TasaCambioService;
use App\Services\VentaService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    protected VentaService $ventaService;
    protected TasaCambioService $tasaCambioService;

    public function __construct(VentaService $ventaService, TasaCambioService $tasaCambioService)
    {
        $this->ventaService = $ventaService;
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

        return Inertia::render('Pos/Index', [
            'productos' => Producto::with('categoria')
                ->where('activo', true)
                ->where('stock_actual', '>', 0)
                ->orderBy('nombre')
                ->get(),
            'tasaVes' => (float) $tasaVes,
        ]);
    }

    public function store(StoreVentaRequest $request): RedirectResponse
{
    try {
        $venta = $this->ventaService->procesarVenta($request->validated(), auth()->id());

        // Cargar detalles y productos para el ticket de impresión
        $venta->load(['detalles.producto', 'creador']);

        return redirect()->back()->with([
            'message' => "Venta {$venta->numero} procesada exitosamente.",
            'ultimaVenta' => $venta, // Pass payload to frontend
        ]);
    } catch (Exception $e) {
        return redirect()->back()->withErrors(['error' => $e->getMessage()]);
    }
}
}
