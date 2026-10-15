<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductoRequest extends FormRequest
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
        $productoId = $this->route('producto')?->id ?? $this->id;
        
        
        return [
            'categoria_id' => ['required', 'exists:categorias,id'],
            'codigo_barras' => ['nullable', 'string', 'max:50', Rule::unique('productos', 'codigo_barras')->ignore($productoId)],
            'sku' => ['nullable', 'string', 'max:50', Rule::unique('productos', 'sku')->ignore($productoId)],
            'nombre' => ['required', 'string', 'max:150'],
            'descripcion' => ['nullable', 'string'],
            'precio_venta_usd' => ['required', 'numeric', 'min:0.01'],
            'stock_minimo' => ['required', 'integer', 'min:0'],
            'proveedores' => ['nullable', 'array'],
            'proveedores.*.proveedor_id' => ['required', 'exists:proveedores,id'],
            'proveedores.*.sku_proveedor' => ['nullable', 'string', 'max:50'],
            'proveedores.*.ultimo_costo_usd' => ['required', 'numeric', 'min:0'],
            'activo' => ['boolean'],
        ];
    }
}
