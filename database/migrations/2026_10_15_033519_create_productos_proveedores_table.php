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
        Schema::create('productos_proveedores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proveedor_id')
                ->constrained('proveedores')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->foreignId('producto_id')
                ->constrained('productos')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->string('sku_proveedor', 100)->nullable();
            $table->decimal('ultimo_costo_usd', 14, 4)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();

            $table->unique(['proveedor_id', 'producto_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos_proveedores');
    }
};
