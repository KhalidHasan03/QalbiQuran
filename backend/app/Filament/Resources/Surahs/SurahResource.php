<?php

namespace App\Filament\Resources\Surahs;

use App\Filament\Resources\Surahs\Pages\ListSurahs;
use App\Filament\Resources\Surahs\Tables\SurahsTable;
use App\Models\Surah;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SurahResource extends Resource
{
    protected static ?string $model = Surah::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBookOpen;

    protected static ?string $navigationLabel = 'Surahs';

    protected static ?string $recordTitleAttribute = 'name_english';

    public static function table(Table $table): Table
    {
        return SurahsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListSurahs::route('/'),
        ];
    }
}
