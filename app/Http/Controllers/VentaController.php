<?php

namespace App\Http\Controllers;

use App\Models\Venta;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VentaController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Venta::query()
            ->where('estado', 'completado')
            ->with([
                'creador:id,name',
                'detalles.producto:id,nombre',
                'detalles.lotesConsumidos.lote.proveedor:id,nombre',
            ]);

        if ($request->filled('buscar')) {
            $query->where('numero', 'like', '%' . trim($request->buscar) . '%');
        }

        if ($request->filled('fecha_inicio')) {
            $query->whereDate('created_at', '>=', $request->fecha_inicio);
        }

        if ($request->filled('fecha_fin')) {
            $query->whereDate('created_at', '<=', $request->fecha_fin);
        }

        if ($request->filled('metodo_pago')) {
            $query->where('metodo_pago', $request->metodo_pago);
        }

        $resumen = [
            'total_ventas_usd'   => (float) (clone $query)->sum('total_usd'),
            'total_ventas_ves'   => (float) (clone $query)->sum('total_ves'),
            'costo_total_usd'    => (float) (clone $query)->sum('costo_total_usd'),
            'ganancia_total_usd' => (float) (clone $query)->sum('ganancia_total_usd'),
            'cantidad_ventas'    => (int)   (clone $query)->count(),
        ];

        $ventas = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Ventas/Historial', [
            'ventas'  => $ventas,
            'resumen' => $resumen,
            'filters' => $request->only(['buscar', 'fecha_inicio', 'fecha_fin', 'metodo_pago']),
        ]);
    }
}
