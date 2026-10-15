<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TasaCambioController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\CompraController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\DashboardController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
   
    Route::get('/tasas-cambio', [TasaCambioController::class, 'index'])->name('tasas-cambio.index');
    Route::post('/tasas-cambio', [TasaCambioController::class, 'store'])->name('tasas-cambio.store');
    Route::patch('/tasas-cambio/{tasaCambio}/activar', [TasaCambioController::class, 'activar'])->name('tasas-cambio.activar');
    Route::resource('proveedores', ProveedorController::class)->only(['index', 'store', 'update'])->parameters(['proveedores' => 'proveedor']);
    Route::resource('categorias', CategoriaController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::resource('productos', ProductoController::class)->only(['index', 'store', 'update']);
    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('/pos', [PosController::class, 'store'])->name('pos.store');
    
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('compras', CompraController::class)->only(['index', 'store']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
