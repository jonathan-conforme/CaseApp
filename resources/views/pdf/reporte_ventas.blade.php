<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{{ $titulo }}</title>
    <style>
        body { font-family: sans-serif; font-size: 11px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h2 { margin: 0; color: #06141B; }
        .header p { margin: 2px 0; color: #666; font-size: 10px; }
        .cards { width: 100%; margin-bottom: 15px; border-collapse: collapse; }
        .card { background: #f4f6f8; padding: 8px; border-radius: 5px; text-align: center; border: 1px solid #ddd; }
        .card-title { font-size: 8px; text-transform: uppercase; color: #666; font-weight: bold; }
        .card-val { font-size: 12px; font-weight: bold; margin-top: 3px; }
        table.data { width: 100%; border-collapse: collapse; margin-top: 10px; }
        table.data th { background: #11212D; color: #fff; text-align: left; padding: 6px; font-size: 9px; text-transform: uppercase; }
        table.data td { padding: 6px; border-bottom: 1px solid #eee; font-size: 10px; }
        .text-right { text-align: right; }
        .emerald { color: #10b981; font-weight: bold; }
    </style>
</head>
<body>
    
    <div class="header">
        <h2>{{ $titulo }}</h2>
        <p>Generado el {{ now()->format('d/m/Y H:i A') }}</p>
    </div>

    <table class="cards">
        <tr>
            <td class="card"><div class="card-title">Ventas USD</div><div class="card-val">${{ number_format($resumen['total_usd'], 2) }}</div></td>
            <td class="card"><div class="card-title">Ventas VES</div><div class="card-val">Bs. {{ number_format($resumen['total_ves'], 2) }}</div></td>
            <td class="card"><div class="card-title">Costo Mercancía</div><div class="card-val">${{ number_format($resumen['costo_usd'], 2) }}</div></td>
            <td class="card"><div class="card-title">Ganancia Neta</div><div class="card-val emerald">${{ number_format($resumen['ganancia_usd'], 2) }}</div></td>
            <td class="card"><div class="card-title">Transacciones</div><div class="card-val">{{ $resumen['cantidad'] }}</div></td>
        </tr>
    </table>

    <table class="data">
        <thead>
            <tr>
                <th>Ticket N°</th>
                <th>Fecha</th>
                <th>Atendido por</th>
                <th>Proveedor(es)</th>
                <th>Método Pago</th>
                <th class="text-right">Total USD</th>
                <th class="text-right">Ganancia USD</th>
            </tr>
        </thead>
        <tbody>
            @foreach($ventas as $v)
            <tr>
                <td><b>{{ $v->numero }}</b></td>
                <td>{{ \Carbon\Carbon::parse($v->created_at)->format('d/m/Y h:i A') }}</td>
                <td>{{ $v->creador?->name ?? 'Sistema' }}</td>
                <td>
                    @php
                        $proveedores = $v->detalles->flatMap(function($d) {
                            return $d->lotesConsumidos->map(function($lc) {
                                return $lc->lote?->proveedor?->nombre;
                            });
                        })->filter()->unique()->join(', ');
                    @endphp
                    {{ $proveedores ?: 'Sin Proveedor' }}
                </td>
                <td>{{ strtoupper(str_replace('_', ' ', $v->metodo_pago)) }}</td>
                <td class="text-right">${{ number_format($v->total_usd, 2) }}</td>
                <td class="text-right emerald">+${{ number_format($v->ganancia_total_usd, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
