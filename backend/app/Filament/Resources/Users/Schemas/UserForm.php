<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('username')
                    ->maxLength(255)
                    ->unique(ignoreRecord: true)
                    ->default(null),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required()
                    ->unique(ignoreRecord: true),
                TextInput::make('password')
                    ->password()
                    ->revealable()
                    ->required(fn (string $operation): bool => $operation === 'create')
                    ->dehydrated(fn (?string $state): bool => filled($state))
                    ->helperText('Leave blank to keep the current password.'),
                DateTimePicker::make('email_verified_at'),
                TextInput::make('avatar_url')
                    ->label('Avatar URL')
                    ->url()
                    ->default(null),
                TextInput::make('timezone')
                    ->required()
                    ->default('UTC'),
                Toggle::make('is_admin')
                    ->label('Administrator')
                    ->helperText('Grants access to this admin panel.'),
            ]);
    }
}
