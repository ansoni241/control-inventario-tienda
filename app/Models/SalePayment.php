<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SalePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'method',
        'amount',
        'created_by',
        'updated_by',
    ];
}
