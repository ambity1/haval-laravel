<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('image');
            $table->text('content');
            $table->date('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};
