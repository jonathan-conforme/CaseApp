<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoriaRequest;
use App\Models\Categoria;
use App\Services\CategoriaService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CategoriaController extends Controller
{
    protected CategoriaService $categoriaService;

    public function __construct(CategoriaService $categoriaService)
    {
        $this->categoriaService = $categoriaService;
    }

    public function index(): Response
    {
        return Inertia::render('Categorias/Index', [
            'categorias' => $this->categoriaService->obtenerTodas(),
        ]);
    }

    public function store(StoreCategoriaRequest $request): RedirectResponse
    {
        $this->categoriaService->crear($request->validated());

        return redirect()->back()->with('message', 'Categoría creada correctamente.');
    }

    public function update(StoreCategoriaRequest $request, Categoria $categoria): RedirectResponse
    {
        $this->categoriaService->actualizar($categoria, $request->validated());

        return redirect()->back()->with('message', 'Categoría actualizada correctamente.');
    }
}