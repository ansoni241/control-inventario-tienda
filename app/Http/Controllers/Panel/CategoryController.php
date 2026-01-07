<?php

namespace App\Http\Controllers\Panel;

use Inertia\Inertia;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:categoria.ver categorias')->only(['index', 'show']);
        $this->middleware('permission:categoria.crear categorias')->only(['create', 'store']);
        $this->middleware('permission:categoria.editar categorias')->only(['edit', 'update']);
        $this->middleware('permission:categoria.eliminar categorias')->only('destroy');
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::query()
            ->orderBy('id', 'desc')
            ->paginate(10); // paginación de 10 por página

        return Inertia::render('categories/index', [
            'categories' => $categories,
            'can' => [
                'create' => Auth::user()->can('categoria.crear categorias'),
                'edit' => Auth::user()->can('categoria.editar categorias'),
                'delete' => Auth::user()->can('categoria.eliminar categorias'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('categories/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);
        $category = new Category($validated);
        $category->created_by = Auth::id();

        $category->save();

        return to_route('categories.index')->with('message', 'Categoria creada exitosamente');
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
    public function edit(Category $category)
    {
        return Inertia::render('categories/edit', [
            'categoryData' => $category
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $Updated = Auth::id();
        $category->update([
            'name' => $request->name,
            'description' => $request->description,
            'updated_by' => $Updated,
        ]);


        return to_route('categories.index')->with('message', 'Categoria actualizada con éxito');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
