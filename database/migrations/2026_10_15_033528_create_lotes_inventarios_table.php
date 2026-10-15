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
        Schema::create('lotes_inventarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('detalle_compra_id')
                ->nullable()
                ->constrained('detalles_compras')
                ->nullOnDelete();
            $table->foreignId('producto_id')
                ->constrained('productos')
                ->restrictOnDelete();
            $table->foreignId('proveedor_id')
                ->constrained('proveedores')
                ->restrictOnDelete();
            $table->string('codigo_lote', 80)->unique();
            $table->decimal('cantidad_recibida', 14, 3);
            $table->decimal('cantidad_disponible', 14, 3);
            $table->decimal('costo_unitario_usd', 14, 4);
            $table->timestamp('fecha_recepcion')->index();
            $table->timestamps();

            $table->index(['producto_id', 'cantidad_disponible']);
            $table->index(['proveedor_id', 'producto_id']);
            $table->index(['producto_id', 'fecha_recepcion']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lotes_inventarios');
    }
};
