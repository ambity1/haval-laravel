<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'name',
        'image',
        'content',
        'date',
    ];

    protected $casts = [
        'content' => 'array',
        'date' => 'date',
    ];
}
