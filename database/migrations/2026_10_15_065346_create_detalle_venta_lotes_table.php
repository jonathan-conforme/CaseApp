<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('detalle_venta_lotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('detalle_venta_id')
                ->constrained('detalle_ventas') // Apunta a la tabla 'detalle_ventas'
                ->cascadeOnDelete();
            $table->foreignId('lote_inventario_id')
                ->constrained('lotes_inventarios') // Apunta a 'lotes_inventarios'
                ->restrictOnDelete();
            $table->decimal('cantidad', 14, 3);
            $table->decimal('costo_unitario_usd', 14, 4);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detalle_venta_lotes');
    }
};
