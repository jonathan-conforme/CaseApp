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
        Schema::create('ventas', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 50)->unique();
            $table->timestamp('fecha_venta')->index();
            $table->foreignId('tasas_cambio_id')
                ->nullable()
                ->constrained('tasas_cambios')
                ->nullOnDelete();
            $table->decimal('tasa_cambio_ves_por_usd', 20, 6);
            $table->decimal('subtotal_usd', 14, 4)->default(0);
            $table->decimal('descuento_usd', 14, 4)->default(0);
            $table->decimal('total_usd', 14, 4)->default(0);
            $table->decimal('total_ves', 20, 4)->default(0);
            $table->decimal('costo_total_usd', 14, 4)->default(0);
            $table->decimal('ganancia_total_usd', 14, 4)->default(0);
            $table->string('metodo_pago', 40)->nullable();
            $table->string('estado', 30)->default('completado')->index();
            $table->text('notas')->nullable();
            $table->foreignId('creado_por')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            // Añadir este índice compuesto al final del metodo up():
            $table->index(['estado', 'fecha_venta']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ventas');
    }
};
