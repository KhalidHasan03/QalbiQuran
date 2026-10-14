<?php

namespace App\Filament\Resources\Reciters;

use App\Filament\Resources\Reciters\Pages\ListReciters;
use App\Filament\Resources\Reciters\Tables\RecitersTable;
use App\Models\Reciter;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ReciterResource extends Resource
{
    protected static ?string $model = Reciter::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedMicrophone;

    protected static ?string $navigationLabel = 'Reciters';

    protected static ?string $recordTitleAttribute = 'name';

    public static function table(Table $table): Table
    {
        return RecitersTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListReciters::route('/'),
        ];
    }
}
