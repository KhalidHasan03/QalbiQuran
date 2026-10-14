<?php

use App\Support\ArabicText;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ayahs', function (Blueprint $table) {
            $table->text('text_arabic_plain')->nullable()->after('text_arabic');
        });

        DB::table('ayahs')->select('id', 'text_arabic')->orderBy('id')->chunkById(500, function ($rows) {
            foreach ($rows as $row) {
                DB::table('ayahs')->where('id', $row->id)->update([
                    'text_arabic_plain' => ArabicText::normalize($row->text_arabic),
                ]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('ayahs', function (Blueprint $table) {
            $table->dropColumn('text_arabic_plain');
        });
    }
};
