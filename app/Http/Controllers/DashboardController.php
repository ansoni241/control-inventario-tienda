<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\SaleDetail;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard');
    }
    public function data()
    {
        return response()->json([
            'summary' => [
                'totalSales' => (float) Sale::sum('total'),
                'totalPurchases' => (float) Purchase::sum('total'),
                'customers' => Customer::count(),
                'suppliers' => Supplier::count(),
            ],
            'yearlySales' => SaleDetail::selectRaw('product_id, sum(quantity) as quantity')
                ->with('product:id,name')
                ->whereYear('created_at', now()->year)
                ->groupBy('product_id')
                ->get()
                ->map(fn($d) => ['product_name' => $d->product->name, 'quantity' => $d->quantity]),
            'monthlySales' => SaleDetail::selectRaw('product_id, sum(quantity) as quantity')
                ->with('product:id,name')
                ->whereMonth('created_at', now()->month)
                ->groupBy('product_id')
                ->get()
                ->map(fn($d) => ['product_name' => $d->product->name, 'quantity' => $d->quantity]),
            'dailySales' => SaleDetail::selectRaw('product_id, sum(quantity) as quantity')
                ->with('product:id,name')
                ->whereDate('created_at', now())
                ->groupBy('product_id')
                ->get()
                ->map(fn($d) => ['product_name' => $d->product->name, 'quantity' => $d->quantity]),
            'lowStock' => Product::where('stock', '<=', 10)->orderBy('stock', 'asc')->limit(5)->get(['id', 'name', 'stock']),
        ]);
    }
}
