<?php

namespace App\Http\Controllers\Api\V1\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\StoreFriendRequest;
use App\Http\Resources\UserSummaryResource;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;

class FriendController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $friends = $user->friends()->load('stat');

        $incoming = Friendship::with('requester.stat')
            ->where('friend_id', $user->id)
            ->where('status', 'pending')
            ->get()
            ->map(fn (Friendship $f) => [
                'id' => $f->id,
                'user' => new UserSummaryResource($f->requester),
            ]);

        $outgoing = Friendship::with('addressee.stat')
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->get()
            ->map(fn (Friendship $f) => [
                'id' => $f->id,
                'user' => new UserSummaryResource($f->addressee),
            ]);

        return response()->json([
            'data' => [
                'friends' => UserSummaryResource::collection($friends),
                'incoming_requests' => $incoming,
                'outgoing_requests' => $outgoing,
            ],
        ]);
    }

    public function store(StoreFriendRequest $request)
    {
        $user = $request->user();
        $target = User::where('username', $request->validated('username'))->firstOrFail();

        if ($target->id === $user->id) {
            return response()->json(['message' => 'You cannot add yourself.'], 422);
        }

        $existing = Friendship::where(function ($q) use ($user, $target) {
            $q->where('user_id', $user->id)->where('friend_id', $target->id);
        })->orWhere(function ($q) use ($user, $target) {
            $q->where('user_id', $target->id)->where('friend_id', $user->id);
        })->first();

        if ($existing) {
            if ($existing->status === 'accepted') {
                return response()->json(['message' => 'You are already friends.'], 422);
            }

            if ($existing->user_id === $target->id) {
                $existing->update(['status' => 'accepted']);

                return response()->json([
                    'data' => ['id' => $existing->id, 'status' => 'accepted'],
                    'message' => 'Friend request accepted.',
                ]);
            }

            return response()->json(['message' => 'Friend request already sent.'], 422);
        }

        $friendship = Friendship::create([
            'user_id' => $user->id,
            'friend_id' => $target->id,
            'status' => 'pending',
        ]);

        return response()->json([
            'data' => ['id' => $friendship->id, 'status' => 'pending'],
            'message' => 'Friend request sent.',
        ], 201);
    }

    public function accept(Request $request, int $friendship)
    {
        $record = Friendship::findOrFail($friendship);
        abort_unless($record->friend_id === $request->user()->id, 403);

        $record->update(['status' => 'accepted']);

        return response()->json([
            'data' => ['id' => $record->id, 'status' => 'accepted'],
            'message' => 'Friend request accepted.',
        ]);
    }

    public function destroy(Request $request, int $friendship)
    {
        $user = $request->user();
        $record = Friendship::findOrFail($friendship);
        abort_unless(in_array($user->id, [$record->user_id, $record->friend_id], true), 403);

        $record->delete();

        return response()->json(['message' => 'Friend removed.']);
    }
}
