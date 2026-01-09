<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Panel\RoleController;
use App\Http\Controllers\Panel\SaleController;
use App\Http\Controllers\Panel\UserController;
use App\Http\Controllers\Panel\ProductController;
use App\Http\Controllers\Panel\CategoryController;
use App\Http\Controllers\Panel\CustomerController;
use App\Http\Controllers\Panel\PurchaseController;
use App\Http\Controllers\Panel\SupplierController;
use App\Http\Controllers\Panel\SaleReportController;
use App\Http\Controllers\Panel\PurchaseReportController;

// Route::get('/', function () {
//     return Inertia::render('welcome');
// })->name('home');

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

// Route::middleware(['auth', 'verified'])->group(function () {
// Route::get('dashboard', function () {
//     return Inertia::render('dashboard');
// })->name('dashboard');
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/data', [DashboardController::class, 'data']);

    Route::get('dashboard/data', [DashboardController::class, 'data']);
    //USERS
    Route::resource('users', UserController::class);
    Route::put('/users/{user}/status', [UserController::class, 'updateStatus']);
    Route::put('/users/{user}/password', [UserController::class, 'updatePassword'])->name('users.updatePassword');
    //Categorias
    Route::resource('categories', CategoryController::class);
    //Proveedor
    Route::resource('suppliers', SupplierController::class);
    //Cliente
    Route::resource('customers', CustomerController::class);
    //Productos
    Route::resource('products', ProductController::class);
    //Compras
    Route::resource('purchases', PurchaseController::class);
    // Ruta para actualizar un detalle de compra
    Route::put('/purchase-details/{id}', [PurchaseController::class, 'updateDetail'])
        ->name('purchase-details.update');
    Route::delete('/purchase-details/{detailId}', [PurchaseController::class, 'destroyDetail']);
    //Ventas
    Route::resource('sales', SaleController::class);
    // Rutas adicionales para detalles y status
    Route::put('/sale-details/{detail}', [SaleController::class, 'updateDetail'])->name('sale-details.update');
    Route::delete('/sale-details/{detail}', [SaleController::class, 'deleteDetail'])->name('sale-details.delete');
    Route::put('/sales/{sale}/status', [SaleController::class, 'updateStatus'])->name('sales.updateStatus');
    Route::put('/sale-payments/{payment}', [SaleController::class, 'updatePayment']);
    Route::delete('/sale-payments/{payment}', [SaleController::class, 'deletePayment']);
    // Obtener info completa de la venta (detalles y pagos)
    Route::get('/sales/{sale}', [SaleController::class, 'show']);
    // Registrar nuevo pago
    Route::post('/sales/{sale}/payments', [SaleController::class, 'storePayment']);
    //Reportes
    Route::get('reportsales', [SaleReportController::class, 'index'])->name('reportsales.index');
    Route::get('reportsales/export', [SaleReportController::class, 'export'])->name('reportsales.export');
    Route::get('reportpurchases', [PurchaseReportController::class, 'index'])->name('reportpurchases.index');
    Route::get('reportpurchases/export', [PurchaseReportController::class, 'export'])->name('reportpurchases.export');
    //ROLES Y PERMISOS
    Route::resource('roles', RoleController::class);

});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
