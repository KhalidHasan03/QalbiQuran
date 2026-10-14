<?php

namespace App\Filament\Resources\Achievements\Schemas;

use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class AchievementForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('code')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),
                TextInput::make('title')
                    ->required()
                    ->maxLength(255),
                Textarea::make('description')
                    ->rows(3)
                    ->columnSpanFull(),
                TextInput::make('icon')
                    ->default(null)
                    ->maxLength(255),
                TextInput::make('type')
                    ->default(null)
                    ->maxLength(255),
                TextInput::make('threshold')
                    ->numeric()
                    ->default(0),
                TextInput::make('sort')
                    ->numeric()
                    ->default(0),
            ]);
    }
}
