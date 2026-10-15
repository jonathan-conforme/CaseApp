<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTasaCambioRequest;
use App\Models\TasaCambio;
use App\Services\TasaCambioService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TasaCambioController extends Controller
{
    protected TasaCambioService $tasaCambioService;

    public function __construct(TasaCambioService $tasaCambioService)
    {
        $this->tasaCambioService = $tasaCambioService;
    }

    public function index(): Response
    {
        $tasaActual = null;

        try {
            $tasaActual = $this->tasaCambioService->obtenerTasaActual();
        } catch (Exception $e) {
            // Si no hay tasa registrada, $tasaActual queda como null y la vista carga limpia
            $tasaActual = null;
        }

        return Inertia::render('TasasCambio/Index', [
            'tasaActual' => $tasaActual,
            'historial' => TasaCambio::with('creador')
                ->orderBy('fecha_vigencia', 'desc')
                ->get(),
        ]);
    }

    public function store(StoreTasaCambioRequest $request): RedirectResponse
    {
        $this->tasaCambioService->actualizarTasa(
            nuevoValorVes: (float) $request->validated('ves_por_usd'),
            notas: $request->validated('notas'),
            userId: auth()->id()
        );

        return redirect()->back()->with('message', 'Tasa de cambio registrada correctamente.');
    }

    public function activar(TasaCambio $tasaCambio): RedirectResponse
    {
        try {
            $this->tasaCambioService->activarTasa($tasaCambio);
            return redirect()->back()->with('message', 'Tasa de cambio activada exitosamente.');
        } catch (Exception $e) {
            return redirect()->back()->withErrors(['error' => 'No se pudo activar la tasa seleccionada.']);
        }
    }
}