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
        Schema::create('compras', function (Blueprint $table) {
            $table->id();
            $table->string('numero', 50)->unique();
            $table->foreignId('proveedor_id')
                ->constrained('proveedores')
                ->restrictOnDelete();
            $table->string('factura_proveedor', 100)->nullable()->index();
            $table->timestamp('fecha_compra')->index();
            $table->foreignId('tasas_cambio_id')
                ->nullable()
                ->constrained('tasas_cambios')
                ->nullOnDelete();
            $table->decimal('tasa_cambio_ves_por_usd', 20, 6)->nullable();
            $table->decimal('subtotal_usd', 14, 4)->default(0);
            $table->decimal('descuento_usd', 14, 4)->default(0);
            $table->decimal('total_usd', 14, 4)->default(0);
            $table->decimal('total_ves', 20, 4)->nullable();
            $table->string('estado', 30)->default('completado')->index();
            $table->text('notas')->nullable();
            $table->foreignId('creado_por')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            // ELIMINA esta línea dentro del archivo de proveedores:
            $table->index(['proveedor_id', 'fecha_compra']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compras');
    }
};
