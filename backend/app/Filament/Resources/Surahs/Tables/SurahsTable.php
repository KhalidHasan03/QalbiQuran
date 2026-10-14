<?php

namespace App\Filament\Resources\Surahs\Tables;

use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class SurahsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('number')
            ->columns([
                TextColumn::make('number')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('name_arabic')
                    ->label('Arabic')
                    ->searchable(),
                TextColumn::make('name_transliteration')
                    ->label('Transliteration')
                    ->searchable()
                    ->toggleable(),
                TextColumn::make('name_english')
                    ->label('English')
                    ->searchable(),
                TextColumn::make('name_bangla')
                    ->label('Bangla')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('revelation_type')
                    ->label('Revelation')
                    ->badge()
                    ->placeholder('—'),
                TextColumn::make('ayah_count')
                    ->label('Ayahs')
                    ->numeric()
                    ->sortable(),
                IconColumn::make('bismillah_pre')
                    ->label('Bismillah')
                    ->boolean()
                    ->toggleable(),
            ]);
    }
}
