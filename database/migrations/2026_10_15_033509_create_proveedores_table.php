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
        Schema::create('proveedores', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->string('tipo_documento', 20)->nullable();
            $table->string('numero_documento', 50)->nullable()->index();
            $table->string('telefono', 50)->nullable();
            $table->string('correo_electronico', 150)->nullable();
            $table->text('direccion')->nullable();
            $table->text('notas')->nullable();
            $table->boolean('activo')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['nombre', 'numero_documento', 'activo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proveedors');
    }
};
