<?php

namespace App\Http\Controllers\Panel;

use Inertia\Inertia;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class CustomerController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:cliente.ver clientes')->only(['index', 'show']);
        $this->middleware('permission:cliente.crear clientes')->only(['create', 'store']);
        $this->middleware('permission:cliente.editar clientes')->only(['edit', 'update']);
        $this->middleware('permission:cliente.eliminar clientes')->only('destroy');
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $customers = Customer::query()
            ->orderBy('id', 'desc')
            ->paginate(10); // paginación de 10 por página

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'can' => [
                'create' => Auth::user()->can('cliente.crear clientes'),
                'edit' => Auth::user()->can('cliente.editar clientes'),
                'delete' => Auth::user()->can('cliente.eliminar clientes'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('customers/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:customers,email',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        $customer = new Customer($validated);
        $customer->created_by = Auth::id();

        $customer->save();

        return to_route('customers.index')->with('message', 'Cliente creado exitosamente');
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
    public function edit(Customer $customer)
    {
        return Inertia::render('customers/edit', [
            'customerData' => $customer
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:customers,email,' . $customer->id,
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        $Updated = Auth::id();
        $customer->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'updated_by' => $Updated,
        ]);

        return to_route('customers.index')->with('message', 'Cliente actualizado con éxito');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
