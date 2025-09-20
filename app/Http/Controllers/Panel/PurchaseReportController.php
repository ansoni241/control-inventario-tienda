<?php

namespace App\Http\Controllers\Panel;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\PurchaseDetail;
use Illuminate\Support\Carbon;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\PurchaseReportExport;

class PurchaseReportController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseDetail::query()->with(['purchase.supplier', 'product']);

        // filtro por rango de fechas
        if ($request->filled('from') && $request->filled('to')) {
            $query->whereHas('purchase', function ($q) use ($request) {
                $q->whereBetween('date', [$request->from, $request->to]);
            });
        }

        $details = $query->paginate(10);

        // Mapear datos para el frontend
        $detailsTransformed = $details->through(function ($detail) {
            return [
                'id' => $detail->id,
                'purchase_date' => Carbon::parse($detail->purchase->date)->format('d/m/Y'),
                'supplier_name' => optional($detail->purchase->supplier)->name,
                'product_name' => $detail->product->name,
                'quantity' => $detail->quantity,
                'price' => $detail->price,
                'subtotal' => $detail->quantity * $detail->price,
                'invoice_number' => $detail->purchase->invoice_number,
                'notes' => $detail->purchase->notes,
            ];
        });

        return Inertia::render('reports/purchases/index', [
            'details' => $detailsTransformed,
            'filters' => $request->only('from', 'to'),
        ]);
    }
    public function export(Request $request)
    {
        return Excel::download(new PurchaseReportExport($request->from, $request->to), 'compras.xlsx');
    }
}
