<?php

namespace App\Http\Controllers\Panel;

use Inertia\Inertia;
use App\Models\SaleDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Exports\SalesReportExport;
use App\Http\Controllers\Controller;
use Maatwebsite\Excel\Facades\Excel;

class SaleReportController extends Controller
{
    public function index(Request $request)
    {
        $query = SaleDetail::query()
            ->with(['sale.customer', 'product']); // relaciones necesarias

        // filtro por rango de fechas
        if ($request->filled('from') && $request->filled('to')) {
            $query->whereHas('sale', function ($q) use ($request) {
                $q->whereBetween('date', [$request->from, $request->to]);
            });
        }

        $details = $query->paginate(10);

        // Mapear los datos para el frontend
        $detailsTransformed = $details->through(function ($detail) {
            return [
                'id' => $detail->id,
                'sale_date' => Carbon::parse($detail->sale->date)->format('d/m/Y'),
                'customer_name' => $detail->sale->customer->name,
                'product_name' => $detail->product->name,
                'quantity' => $detail->quantity,
                'price' => $detail->price,
                'subtotal' => $detail->quantity * $detail->price,
            ];
        });

        return Inertia::render('reports/sales/index', [
            'details' => $detailsTransformed,
            'filters' => $request->only('from', 'to'),
        ]);
    }
    public function export(Request $request)
    {
        return Excel::download(new SalesReportExport($request->from, $request->to), 'ventas.xlsx');
    }
}
