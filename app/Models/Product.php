<?php

namespace App\Models;

use App\Models\Category;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category_id',
        'supplier_id',
        'description',
        'stock',
        'purchase_price',
        'sale_price',
        'status',
        'created_by',
        'updated_by',
    ];
    // Relación con Category
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Relación con Supplier
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
