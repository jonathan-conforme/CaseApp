<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoriaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $categoriaId = $this->route('categoria')?->id ?? $this->id;

        return [
            'nombre' => [
                'required',
                'string',
                'max:120',
                Rule::unique('categorias', 'nombre')->ignore($categoriaId),
            ],
            'descripcion' => ['nullable', 'string', 'max:500'],
            'activo' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la categoría es obligatorio.',
            'nombre.unique' => 'Ya existe una categoría registrada con este nombre.',
        ];
    }
}
