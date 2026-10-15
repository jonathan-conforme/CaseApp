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
        Schema::create('productos', function (Blueprint $table) {
            $table->id();$table->foreignId('categoria_id')
                ->nullable()
                ->constrained('categorias')
                ->nullOnDelete();
            $table->string('sku', 80)->nullable()->unique();
            $table->string('codigo_barras', 100)->nullable()->unique();
            $table->string('nombre', 180);
            $table->text('descripcion')->nullable();
            $table->decimal('precio_venta_usd', 14, 4);
            $table->decimal('stock_minimo', 14, 3)->default(0);
            $table->integer('stock_actual')->default(0);
            $table->boolean('activo')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['nombre', 'activo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
