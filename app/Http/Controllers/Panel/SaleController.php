<?php

namespace App\Http\Controllers\Panel;

use App\Models\Sale;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Customer;
use App\Models\SaleDetail;
use App\Models\SalePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sales = Sale::with(['customer', 'user'])
            ->withSum('payments', 'amount')
            ->orderBy('id', 'desc')
            ->paginate(10);

        return Inertia::render('sales/index', [
            'sales' => $sales
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $customers = Customer::all();
        $products = Product::where('status', 'activo')->get();

        return Inertia::render('sales/create', [
            'customers' => $customers,
            'products' => $products,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(Request $request)
    {
        // Validación
        $validated = $request->validate([
            'customer_id' => ['nullable', 'exists:customers,id'],
            'date' => ['required', 'date'],
            'status' => ['required', 'in:pendiente,pagado,cancelado'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'payments' => ['required', 'array', 'min:1'],
            'payments.*.method' => ['required', 'in:efectivo,qr,transferencia,otros'],
            'payments.*.amount' => ['required', 'numeric', 'min:0'],
        ]);

        // Calcular total de venta
        $total = collect($validated['items'])->sum(fn($item) => $item['quantity'] * $item['unit_price']);

        // Crear venta
        $sale = Sale::create([
            'customer_id' => $validated['customer_id'],
            'user_id' => Auth::id(),
            'date' => $validated['date'],
            'total' => $total,
            'status' => $validated['status'],
            'created_by' => Auth::id(),
        ]);

        // Crear detalles de venta y descontar stock
        foreach ($validated['items'] as $item) {
            $product = Product::find($item['product_id']);

            // Validar stock disponible
            if ($product && $product->stock < $item['quantity']) {
                return back()->withErrors([
                    'items' => "No hay suficiente stock de {$product->name}"
                ])->withInput();
            }

            // Crear detalle de venta
            SaleDetail::create([
                'sale_id' => $sale->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['unit_price'],
                'created_by' => Auth::id(),
            ]);

            // Descontar stock
            if ($product) {
                $product->stock -= $item['quantity'];
                $product->save();
            }
        }

        // Crear pagos de la venta
        foreach ($validated['payments'] as $payment) {
            SalePayment::create([
                'sale_id' => $sale->id,
                'method' => $payment['method'],
                'amount' => $payment['amount'],
                'created_by' => Auth::id(),
            ]);
        }

        return to_route('sales.index')->with('message', 'Venta creada exitosamente.');
    }


    /**
     * Display the specified resource.
     */
    public function show(Sale $sale)
    {
        $sale->load('customer', 'user', 'payments');

        $details = SaleDetail::where('sale_id', $sale->id)
            ->select('id', 'product_id', 'quantity', 'price as unit_price')
            ->with('product:id,name')
            ->get()
            ->map(fn($d) => [
                'id' => $d->id,
                'product_name' => $d->product?->name ?? '—',
                'quantity' => $d->quantity,
                'unit_price' => $d->unit_price,
                'subtotal' => $d->quantity * $d->unit_price,
            ]);

        $payments = $sale->payments;

        return response()->json([
            'sale' => [
                'id' => $sale->id,
                'customer_name' => $sale->customer?->name ?? '—',
                'user_name' => $sale->user?->name ?? '—',
                'date' => $sale->date ? $sale->date->format('Y-m-d') : null,
                'total' => $sale->total,
                'paid' => $sale->payments->sum('amount'),
                'status' => $sale->status,
            ],
            'details' => $details,
            'payments' => $payments,
        ]);
    }

    /** ----------------- Actualizar detalle ----------------- */
    public function updateDetail(Request $request, SaleDetail $detail)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:1',
            'unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $detail) {
            $product = Product::find($detail->product_id);
            if (!$product) {
                abort(404, 'Producto no encontrado');
            }

            $cantidadAnterior = $detail->quantity;
            $cantidadNueva = $validated['quantity'];

            // Ajustar stock
            if ($cantidadNueva > $cantidadAnterior) {
                $diferencia = $cantidadNueva - $cantidadAnterior;
                if ($product->stock < $diferencia) {
                    abort(400, 'No hay suficiente stock disponible.');
                }
                $product->stock -= $diferencia;
            } elseif ($cantidadNueva < $cantidadAnterior) {
                $diferencia = $cantidadAnterior - $cantidadNueva;
                $product->stock += $diferencia;
            }
            $product->save();

            // Actualizar detalle
            $detail->update([
                'quantity' => $cantidadNueva,
                'price' => $validated['unit_price'],
                'updated_by' => Auth::id(),
            ]);

            // Recalcular total de la venta
            $total = SaleDetail::where('sale_id', $detail->sale_id)
                ->sum(DB::raw('quantity * price'));

            $sale = Sale::find($detail->sale_id);
            $sale->total = $total;
            $sale->save();
        });

        $detail->refresh();

        return response()->json([
            'detail' => [
                'id' => $detail->id,
                'product_name' => $detail->product->name,
                'quantity' => $detail->quantity,
                'unit_price' => $detail->price,
                'subtotal' => $detail->quantity * $detail->price,
            ],
            'total' => $detail->sale->details->sum(fn($d) => $d->quantity * $d->price),
        ]);
    }

    public function deleteDetail(SaleDetail $detail)
    {
        $total = 0;

        DB::transaction(function () use ($detail, &$total) {
            // Devolver stock
            $product = Product::find($detail->product_id);
            if ($product) {
                $product->stock += $detail->quantity;
                $product->save();
            }

            $saleId = $detail->sale_id;
            $detail->delete();

            $remaining = SaleDetail::where('sale_id', $saleId)->count();
            if ($remaining === 0) {
                Sale::find($saleId)?->delete();
                $total = 0;
            } else {
                $total = SaleDetail::where('sale_id', $saleId)
                    ->sum(DB::raw('quantity * price'));

                $sale = Sale::find($saleId);
                $sale->total = $total;
                $sale->save();
            }
        });

        return response()->json([
            'message' => 'Detalle eliminado correctamente',
            'total' => $total,
        ]);
    }


    /** ----------------- Actualizar pago ----------------- */
    public function updatePayment(Request $request, SalePayment $payment)
    {
        $validated = $request->validate([
            'method' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
        ]);

        $payment->update([
            'method' => $validated['method'],
            'amount' => $validated['amount'],
            'updated_by' => Auth::id(),
        ]);

        $paid = SalePayment::where('sale_id', $payment->sale_id)->sum('amount');

        return response()->json([
            'payment' => $payment,
            'paid' => $paid,
        ]);
    }

    /** ----------------- Eliminar pago ----------------- */
    public function deletePayment(SalePayment $payment)
    {
        $saleId = $payment->sale_id;
        $payment->delete();

        $paid = SalePayment::where('sale_id', $saleId)->sum('amount');

        return response()->json(['paid' => $paid]);
    }

    /** ----------------- Actualizar status ----------------- */
    public function updateStatus(Request $request, Sale $sale)
    {
        $validated = $request->validate([
            'status' => 'required|in:pendiente,pagado,cancelado',
        ]);

        $sale->status = $validated['status'];
        $sale->updated_by = Auth::id();
        $sale->save();

        if ($validated['status'] === 'cancelado') {
            // Devolver stock antes de eliminar
            foreach ($sale->details as $detail) {
                $product = Product::find($detail->product_id);
                if ($product) {
                    $product->stock += $detail->quantity;
                    $product->save();
                }
            }
            $sale->details()->delete();
            $sale->payments()->delete();
        }

        return response()->json(['status' => $sale->status]);
    }
    /**
     * Registrar un nuevo pago para la venta
     */
    public function storePayment(Request $request, Sale $sale)
    {
        $validated = $request->validate([
            'method' => 'required|in:efectivo,qr,transferencia,otros',
            'amount' => 'required|numeric|min:0.01',
        ]);

        // Registrar pago
        $payment = SalePayment::create([
            'sale_id' => $sale->id,
            'method' => $validated['method'],
            'amount' => $validated['amount'],
            'created_by' => Auth::id(),
        ]);

        // Calcular total pagado actualizado
        $paid = SalePayment::where('sale_id', $sale->id)->sum('amount');

        // Actualizar status solo si total y pagado coinciden
        if ($paid >= $sale->total) {
            $sale->status = 'pagado';
            $sale->save();
        }

        return response()->json([
            'payment' => $payment,
            'paid' => $paid,
            'status' => $sale->status,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sale $sale)
    {
        $customers = Customer::select('id', 'name')->get();
        return Inertia::render('sales/edit', [
            'saleData' => [
                'id' => $sale->id,
                'customer_id' => $sale->customer_id,
                'customer_name' => $sale->customer->name,
                'date' => $sale->date->format('Y-m-d'),
            ],
            'customers' => $customers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'date' => 'required|date',
        ]);

        $sale = Sale::findOrFail($id);

        // Actualizar datos del cliente asociado
        $sale->customer_id = $request->input('customer_id');

        // Actualizar fecha de la venta
        $sale->date = $request->input('date');
        $sale->updated_by = Auth::id();
        $sale->save();

        return to_route('sales.index')->with('message', 'Venta actualizada exitosamente');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
