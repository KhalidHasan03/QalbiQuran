<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AyahController;
use App\Http\Controllers\Api\V1\ContactMessageController;
use App\Http\Controllers\Api\V1\Portal\AchievementController;
use App\Http\Controllers\Api\V1\Portal\BookmarkController;
use App\Http\Controllers\Api\V1\Portal\DashboardController;
use App\Http\Controllers\Api\V1\Portal\FriendController;
use App\Http\Controllers\Api\V1\Portal\GoalController;
use App\Http\Controllers\Api\V1\Portal\LeaderboardController;
use App\Http\Controllers\Api\V1\Portal\NoteController;
use App\Http\Controllers\Api\V1\Portal\ProfileController;
use App\Http\Controllers\Api\V1\Portal\ProgressController;
use App\Http\Controllers\Api\V1\Portal\ReadingSessionController;
use App\Http\Controllers\Api\V1\ReciterController;
use App\Http\Controllers\Api\V1\SurahController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
        'version' => '0.1.0',
        'time' => now()->toIso8601String(),
    ]);
});

Route::prefix('v1')->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Public Qur'an endpoints
    |--------------------------------------------------------------------------
    */
    Route::get('/surahs', [SurahController::class, 'index']);
    Route::get('/surahs/{number}', [SurahController::class, 'show'])
        ->whereNumber('number');
    Route::get('/ayahs/search', [AyahController::class, 'search']);
    Route::get('/ayahs/{number}', [AyahController::class, 'show'])
        ->whereNumber('number');
    Route::get('/reciters', [ReciterController::class, 'index']);

    /*
    |--------------------------------------------------------------------------
    | Contact
    |--------------------------------------------------------------------------
    */
    Route::post('/contact', [ContactMessageController::class, 'store'])->middleware('throttle:5,1');

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
        Route::post('/forgot-password', [AuthController::class, 'sendResetLink'])->middleware('throttle:6,1');
        Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/user', [AuthController::class, 'user']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/email/verification-notification', [AuthController::class, 'sendVerificationNotification'])
                ->middleware('throttle:6,1');
        });

        Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->middleware(['signed', 'throttle:6,1'])
            ->name('verification.verify');
    });

    /*
    |--------------------------------------------------------------------------
    | Personal portal (authenticated)
    |--------------------------------------------------------------------------
    */
    Route::middleware('auth:sanctum')->prefix('me')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);

        Route::get('/goal', [GoalController::class, 'show']);
        Route::put('/goal', [GoalController::class, 'update']);

        Route::put('/profile', [ProfileController::class, 'update']);
        Route::put('/password', [ProfileController::class, 'updatePassword']);

        Route::get('/sessions', [ReadingSessionController::class, 'index']);
        Route::post('/sessions', [ReadingSessionController::class, 'store']);

        Route::get('/progress', [ProgressController::class, 'index']);
        Route::put('/progress/continue', [ProgressController::class, 'continue']);

        Route::apiResource('bookmarks', BookmarkController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::apiResource('notes', NoteController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::get('/achievements', [AchievementController::class, 'index']);

        Route::get('/friends', [FriendController::class, 'index']);
        Route::post('/friends', [FriendController::class, 'store']);
        Route::put('/friends/{friendship}/accept', [FriendController::class, 'accept'])->whereNumber('friendship');
        Route::delete('/friends/{friendship}', [FriendController::class, 'destroy'])->whereNumber('friendship');

        Route::get('/leaderboard', [LeaderboardController::class, 'index']);
    });
});
