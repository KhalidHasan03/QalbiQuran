<?php

namespace App\Filament\Resources\Reciters\Tables;

use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class RecitersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('sort')
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('english_name')
                    ->label('English name')
                    ->searchable()
                    ->toggleable(),
                TextColumn::make('identifier')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('language')
                    ->badge()
                    ->placeholder('—'),
                TextColumn::make('style')
                    ->placeholder('—')
                    ->toggleable(),
                IconColumn::make('is_default')
                    ->label('Default')
                    ->boolean(),
                TextColumn::make('sort')
                    ->numeric()
                    ->sortable()
                    ->toggleable(),
            ]);
    }
}
