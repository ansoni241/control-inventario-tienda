<?php

namespace App\Http\Controllers\Panel;

use Inertia\Inertia;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Models\PurchaseDetail;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class PurchaseController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:compra.ver compras')->only(['index', 'show']);
        $this->middleware('permission:compra.crear compras')->only(['create', 'store']);
        $this->middleware('permission:compra.editar compras')->only(['edit', 'update']);
        $this->middleware('permission:compra.eliminar compras')->only('destroy');
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $purchases = Purchase::with(['supplier:id,name', 'user:id,name'])
            ->orderBy('id', 'desc')
            ->paginate(10);

        // ✅ Transformar los datos para reemplazar los IDs con nombres
        $purchases->getCollection()->transform(function ($purchase) {
            return [
                'id' => $purchase->id,
                'invoice_number' => $purchase->invoice_number,
                'date' => $purchase->date,
                'total' => $purchase->total,
                'notes' => $purchase->notes,
                'supplier_id' => $purchase->supplier?->name,
                'user_id' => $purchase->user?->name,
                'created_at' => $purchase->created_at->toDateTimeString(),
            ];
        });

        return Inertia::render('purchases/index', [
            'purchases' => $purchases,
            'can' => [
                'create' => Auth::user()->can('compra.crear compras'),
                'show' => Auth::user()->can('compra.ver compras'),
                'edit' => Auth::user()->can('compra.editar compras'),
                'delete' => Auth::user()->can('compra.eliminar compras'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $suppliers = Supplier::select('id', 'name')->get();
        $products = Product::select('id', 'name', 'stock', 'purchase_price')->get();

        return Inertia::render('purchases/create', [
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'supplier_id' => 'nullable|exists:suppliers,id',
            'date' => 'required|date',
            'invoice_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request) {

            // Calcular total
            $total = collect($request->items)->sum(function ($item) {
                return $item['quantity'] * $item['unit_price'];
            });

            $purchase = Purchase::create([
                'supplier_id' => $request->supplier_id,
                'user_id' => Auth::id(),
                'date' => $request->date,
                'invoice_number' => $request->invoice_number,
                'notes' => $request->notes,
                'total' => $total,
                'created_by' => Auth::id(),
            ]);

            foreach ($request->items as $item) {
                PurchaseDetail::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['unit_price'],
                    'subtotal' => $item['quantity'] * $item['unit_price'],
                    'created_by' => Auth::id(),
                ]);

                // Actualizar producto: stock, último precio y proveedor
                $product = Product::find($item['product_id']);
                $product->increment('stock', $item['quantity']);
                $product->purchase_price = $item['unit_price'];
                $product->supplier_id = $request->supplier_id;
                $product->save();
            }
        });

        return to_route('purchases.index')->with('message', 'Compra registrada exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $purchase = Purchase::with(['supplier', 'user'])->findOrFail($id);

        $details = $purchase->details()
            ->with('product')
            ->get()
            ->map(function ($d) {
                return [
                    'id' => $d->id,
                    'product_name' => $d->product?->name ?? 'Producto eliminado',
                    'quantity' => $d->quantity,
                    'unit_price' => $d->price,
                    'subtotal' => $d->quantity * $d->price,
                ];;
            });

        return response()->json([
            'purchase' => [
                'id' => $purchase->id,
                'supplier_name' => $purchase->supplier?->name ?? 'Sin Proveedor',
                'user_name' => $purchase->user?->name ?? 'Sin Usuario',
                'date' => $purchase->date,
                'invoice_number' => $purchase->invoice_number,
                'notes' => $purchase->notes,
                'total' => $purchase->total,
            ],
            'details' => $details,
        ]);
    }
    public function updateDetail(Request $request, int $detailId)
    {
        try {
            $detail = PurchaseDetail::with('product', 'purchase')->findOrFail($detailId);

            // Validación estricta
            $validated = $request->validate([
                'quantity' => 'required|integer|min:1',
                'unit_price' => 'required|numeric|min:0',
            ]);

            // Calcular la diferencia de cantidad
            $quantityDiff = $validated['quantity'] - $detail->quantity;

            // Actualizar detalle
            $detail->quantity = $validated['quantity'];
            $detail->price = $validated['unit_price'];
            $detail->updated_by = Auth::id();
            $detail->save();

            // 🔹 Actualizar stock y precio de compra del producto
            $product = $detail->product;
            if ($product) {
                $product->stock += $quantityDiff; // aumenta o reduce stock
                $product->purchase_price = $validated['unit_price']; // actualiza precio de compra
                $product->save();
            }

            // Actualizar total de la compra
            $purchase = $detail->purchase;
            $purchase->load('details'); // cargar la relación como colección
            $purchase->total = $purchase->details->sum(function ($d) {
                return $d->quantity * $d->price;
            });
            $purchase->save();

            $detail->load('product'); // aseguramos que product esté cargado

            return response()->json([
                'message' => 'Detalle actualizado correctamente',
                'detail' => [
                    'id' => $detail->id,
                    'product_name' => $detail->product?->name ?? 'Producto eliminado',
                    'quantity' => $detail->quantity,
                    'unit_price' => $detail->price,
                    'subtotal' => $detail->quantity * $detail->price,
                ],
                'total' => $purchase->total,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error al actualizar el detalle',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function destroyDetail(int $detailId)
    {
        try {
            $detail = PurchaseDetail::with('product', 'purchase')->findOrFail($detailId);
            $product = $detail->product;
            $purchase = $detail->purchase;

            // 🔹 Reducir stock del producto si existe
            if ($product) {
                $product->stock -= $detail->quantity;
                if ($product->stock < 0) $product->stock = 0;
                $product->save();
            }

            // 🔹 Eliminar el detalle primero
            $detail->delete();

            // 🔹 Volver a cargar los detalles de la compra
            $purchase->load('details');

            // 🔹 Actualizar el producto según el último detalle existente en toda la base
            if ($product) {
                $lastDetail = PurchaseDetail::where('product_id', $product->id)
                    ->orderByDesc('id')
                    ->first();

                if ($lastDetail) {
                    $product->purchase_price = $lastDetail->price;
                    $product->supplier_id = $lastDetail->purchase?->supplier_id ?? null;
                } else {
                    // Si no queda ningún detalle de este producto
                    $product->purchase_price = 0;
                    $product->supplier_id = null;
                }
                $product->save();
            }

            if ($purchase->details->isEmpty()) {
                // ⚠️ Si ya no hay detalles, eliminar también la compra
                $purchase->delete();
                return response()->json([
                    'message' => 'Último detalle eliminado. La compra también fue eliminada.',
                    'deleted_purchase' => true,
                ]);
            } else {
                // 🔹 Actualizar el total de la compra
                $purchase->total = $purchase->details->sum(fn($d) => $d->quantity * $d->price);
                $purchase->save();

                return response()->json([
                    'message' => 'Detalle eliminado correctamente',
                    'total' => $purchase->total,
                    'deleted_purchase' => false,
                ]);
            }
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error al eliminar el detalle',
                'error' => $e->getMessage(),
            ], 500);
        }
    }



    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Purchase $purchase)
    {
        $suppliers = Supplier::select('id', 'name')->get();

        return Inertia::render('purchases/edit', [
            'purchaseData' => $purchase,
            'suppliers' => $suppliers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'supplier_id' => 'nullable|exists:suppliers,id',
            'date' => 'required|date',
            'invoice_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $purchase = Purchase::findOrFail($id);
        $purchase->supplier_id = $validated['supplier_id'] ?? null;
        $purchase->date = $validated['date'];
        $purchase->invoice_number = $validated['invoice_number'] ?? null;
        $purchase->notes = $validated['notes'] ?? null;
        $purchase->updated_by = Auth::id(); // si tienes esta columna
        $purchase->save();

        return to_route('purchases.index')->with('message', 'Compra actualizada correctamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
