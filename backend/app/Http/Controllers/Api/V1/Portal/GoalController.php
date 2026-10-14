<?php

namespace App\Http\Controllers\Api\V1\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\UpdateGoalRequest;
use App\Services\ReadingProgressService;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function __construct(private readonly ReadingProgressService $progress) {}

    public function show(Request $request)
    {
        $goal = $this->progress->getOrCreateGoal($request->user());

        return response()->json([
            'data' => [
                'type' => $goal->type,
                'target' => $goal->target,
            ],
        ]);
    }

    public function update(UpdateGoalRequest $request)
    {
        $goal = $this->progress->getOrCreateGoal($request->user());
        $goal->update($request->validated());

        return response()->json([
            'data' => ['type' => $goal->type, 'target' => $goal->target],
            'message' => 'Reading goal updated.',
        ]);
    }
}
