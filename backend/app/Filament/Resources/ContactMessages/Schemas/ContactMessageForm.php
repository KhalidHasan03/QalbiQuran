<?php

namespace App\Filament\Resources\ContactMessages\Schemas;

use App\Models\ContactMessage;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class ContactMessageForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->disabled(),
                TextInput::make('email')
                    ->label('Email address')
                    ->disabled(),
                TextInput::make('subject')
                    ->disabled()
                    ->columnSpanFull(),
                Textarea::make('message')
                    ->rows(8)
                    ->disabled()
                    ->columnSpanFull(),
                TextInput::make('ip_address')
                    ->label('IP address')
                    ->disabled(),
                TextInput::make('created_at')
                    ->label('Received')
                    ->disabled(),
                Select::make('status')
                    ->options(collect(ContactMessage::STATUSES)->mapWithKeys(
                        fn (string $status): array => [$status => ucfirst($status)],
                    )->all())
                    ->default('new')
                    ->required(),
            ]);
    }
}
