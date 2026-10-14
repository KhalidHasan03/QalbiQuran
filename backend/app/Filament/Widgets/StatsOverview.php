<?php

namespace App\Filament\Widgets;

use App\Models\Achievement;
use App\Models\ContactMessage;
use App\Models\User;
use Filament\Support\Icons\Heroicon;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        return [
            Stat::make('Members', User::query()->count())
                ->description(User::query()->where('created_at', '>=', now()->subWeek())->count().' new this week')
                ->descriptionIcon(Heroicon::ArrowTrendingUp)
                ->color('primary'),
            Stat::make('New messages', ContactMessage::query()->where('status', 'new')->count())
                ->description('Awaiting a reply')
                ->descriptionIcon(Heroicon::Inbox)
                ->color('warning'),
            Stat::make('Achievements', Achievement::query()->count())
                ->description('Definitions configured')
                ->descriptionIcon(Heroicon::Trophy)
                ->color('success'),
        ];
    }
}
