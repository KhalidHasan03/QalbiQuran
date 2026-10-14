<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReciterResource;
use App\Models\Reciter;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReciterController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $reciters = Reciter::query()
            ->orderByDesc('is_default')
            ->orderBy('sort')
            ->get();

        return ReciterResource::collection($reciters);
    }
}
