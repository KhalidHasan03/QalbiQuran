<?php

namespace App\Http\Controllers\Api\V1\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\StoreBookmarkRequest;
use App\Http\Requests\Portal\UpdateBookmarkRequest;
use App\Http\Resources\BookmarkResource;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function index(Request $request)
    {
        $bookmarks = $request->user()->bookmarks()->with('ayah.surah')->latest()->get();

        return BookmarkResource::collection($bookmarks);
    }

    public function store(StoreBookmarkRequest $request)
    {
        $bookmark = $request->user()->bookmarks()->updateOrCreate(
            ['ayah_id' => $request->validated('ayah_id')],
            ['note' => $request->validated('note')],
        );

        $bookmark->load('ayah.surah');

        return (new BookmarkResource($bookmark))
            ->additional(['message' => 'Ayah bookmarked.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateBookmarkRequest $request, int $bookmark)
    {
        $record = $request->user()->bookmarks()->findOrFail($bookmark);
        $record->update(['note' => $request->validated('note')]);
        $record->load('ayah.surah');

        return (new BookmarkResource($record))->additional(['message' => 'Bookmark updated.']);
    }

    public function destroy(Request $request, int $bookmark)
    {
        $request->user()->bookmarks()->findOrFail($bookmark)->delete();

        return response()->json(['message' => 'Bookmark removed.']);
    }
}
