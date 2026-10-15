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
        Schema::create('tasas_cambios', function (Blueprint $table) {
            $table->id();
            $table->decimal('ves_por_usd', 20, 6);
            $table->timestamp('fecha_vigencia')->index();
            $table->boolean('es_actual')->default(false)->index();
            $table->foreignId('creado_por')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->text('notas')->nullable();
            $table->timestamps();

            $table->index(['es_actual', 'fecha_vigencia']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasas_cambios');
    }
};
