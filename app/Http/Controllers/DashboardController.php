<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Venta;
use App\Services\TasaCambioService;
use Exception;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    protected TasaCambioService $tasaCambioService;

    public function __construct(TasaCambioService $tasaCambioService)
    {
        $this->tasaCambioService = $tasaCambioService;
    }

    public function index(): Response
    {
        $hoy = now()->toDateString();

        $tasaVes = 0;
        try {
            $tasaVes = $this->tasaCambioService->obtenerTasaActual()->ves_por_usd;
        } catch (Exception $e) {
            $tasaVes = 0;
        }

        // 1. Métricas de ventas de hoy
        $ventasHoy = Venta::whereDate('fecha_venta', $hoy)
            ->where('estado', 'completado')
            ->get();

        $totalVentasUsdHoy = $ventasHoy->sum('total_usd');
        $totalVentasVesHoy = $ventasHoy->sum('total_ves');
        $costoTotalUsdHoy = $ventasHoy->sum('costo_total_usd');
        $gananciaNetaUsdHoy = $ventasHoy->sum('ganancia_total_usd');

        // 2. Desglose de caja por método de pago (Arqueo de hoy)
        $arqueoCaja = Venta::whereDate('fecha_venta', $hoy)
            ->where('estado', 'completado')
            ->select('metodo_pago', DB::raw('SUM(total_usd) as total_usd'), DB::raw('SUM(total_ves) as total_ves'), DB::raw('COUNT(*) as transacciones'))
            ->groupBy('metodo_pago')
            ->get();

        // 3. Productos con bajo stock (Alertas)
        $productosBajoStock = Producto::with('categoria')
            ->whereColumn('stock_actual', '<=', 'stock_minimo')
            ->where('activo', true)
            ->orderBy('stock_actual', 'asc')
            ->get();

        // 4. Últimas 10 ventas registradas
        $ultimasVentas = Venta::with('creador')
            ->where('estado', 'completado')
            ->orderBy('fecha_venta', 'desc')
            ->take(10)
            ->get();

        return Inertia::render('dashboard', [
            'metrics' => [
                'ventas_usd_hoy' => (float) $totalVentasUsdHoy,
                'ventas_ves_hoy' => (float) $totalVentasVesHoy,
                'costo_usd_hoy' => (float) $costoTotalUsdHoy,
                'ganancia_usd_hoy' => (float) $gananciaNetaUsdHoy,
                'total_transacciones_hoy' => $ventasHoy->count(),
                'tasa_ves' => (float) $tasaVes,
            ],
            'arqueoCaja' => $arqueoCaja,
            'productosBajoStock' => $productosBajoStock,
            'ultimasVentas' => $ultimasVentas,
        ]);
    }
}