<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements FilamentUser, MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'avatar_url',
        'timezone',
        'settings',
    ];

    /**
     * Default attribute values.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'timezone' => 'UTC',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'timezone' => 'string',
            'settings' => 'array',
            'is_admin' => 'boolean',
            'last_active_at' => 'datetime',
        ];
    }

    /**
     * Determine whether the user may access the Filament admin panel.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return (bool) $this->is_admin;
    }

    protected static function booted(): void
    {
        static::created(function (User $user) {
            $user->readingGoal()->create(['type' => 'minutes', 'target' => 10]);
            $user->stat()->create([]);
        });
    }

    public function stat(): HasOne
    {
        return $this->hasOne(UserStat::class);
    }

    public function readingGoal(): HasOne
    {
        return $this->hasOne(ReadingGoal::class);
    }

    public function readingSessions(): HasMany
    {
        return $this->hasMany(ReadingSession::class);
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    public function achievements(): BelongsToMany
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
            ->withPivot('unlocked_at')
            ->withTimestamps();
    }

    /**
     * Accepted friends of this user (bidirectional).
     *
     * @return Collection<int, User>
     */
    public function friends()
    {
        $sent = Friendship::query()
            ->where('user_id', $this->id)
            ->where('status', 'accepted')
            ->pluck('friend_id');

        $received = Friendship::query()
            ->where('friend_id', $this->id)
            ->where('status', 'accepted')
            ->pluck('user_id');

        return User::query()->whereIn('id', $sent->merge($received)->all())->get();
    }
}
