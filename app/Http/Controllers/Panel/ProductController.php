<?php

namespace App\Http\Controllers\Panel;

use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:producto.ver productos')->only(['index', 'show']);
        $this->middleware('permission:producto.crear productos')->only(['create', 'store']);
        $this->middleware('permission:producto.editar productos')->only(['edit', 'update']);
        $this->middleware('permission:producto.eliminar productos')->only('destroy');
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Product::with(['category:id,name', 'supplier:id,name'])
            ->orderBy('id', 'desc')
            ->paginate(10);

        // Solo transformamos category_id y supplier_id
        $productsTransformed = $products->through(fn($product) => [
            'id' => $product->id,
            'name' => $product->name,
            'stock' => $product->stock,
            'purchase_price' => $product->purchase_price,
            'sale_price' => $product->sale_price,
            'status' => $product->status,
            'category_id' => $product->category?->name,
            'supplier_id' => $product->supplier?->name,
            'description' => $product->description,
        ]);

        return Inertia::render('products/index', [
            'products' => $productsTransformed,
            'can' => [
                'create' => Auth::user()->can('producto.crear productos'),
                'edit' => Auth::user()->can('producto.editar productos'),
                'delete' => Auth::user()->can('producto.eliminar productos'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::select('id', 'name')->get();
        $suppliers = Supplier::select('id', 'name')->get();

        return Inertia::render('products/create', [
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'purchase_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'status' => 'required|in:activo,inactivo',
        ]);

        $product = new Product($validated);
        $product->created_by = Auth::id();
        $product->save();

        return to_route('products.index')->with('message', 'Producto creado exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        // Traemos categorías y proveedores para el select
        $categories = Category::select('id', 'name')->get();
        $suppliers = Supplier::select('id', 'name')->get();

        return Inertia::render('products/edit', [
            'productData' => $product,
            'categories' => $categories,
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'purchase_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'status' => 'required|in:activo,inactivo',
        ]);

        $product->fill($validated);
        $product->updated_by = Auth::id();
        $product->save();

        return to_route('products.index')->with('message', 'Producto actualizado exitosamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
