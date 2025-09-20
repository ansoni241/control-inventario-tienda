<?php

namespace App\Models;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Purchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_id',
        'user_id',
        'date',
        'invoice_number',
        'notes',
        'total',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'total' => 'float',
    ];
    // Relación con Supplier
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
    // Relación con User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function details()
    {
        return $this->hasMany(PurchaseDetail::class);
    }
}
