<?php

namespace App\Http\Controllers\Api\V1\Portal;

use App\Http\Controllers\Controller;
use App\Http\Requests\Portal\StoreNoteRequest;
use App\Http\Requests\Portal\UpdateNoteRequest;
use App\Http\Resources\NoteResource;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function index(Request $request)
    {
        $notes = $request->user()->notes()->with('ayah.surah')->latest()->get();

        return NoteResource::collection($notes);
    }

    public function store(StoreNoteRequest $request)
    {
        $note = $request->user()->notes()->create($request->validated());
        $note->load('ayah.surah');

        return (new NoteResource($note))
            ->additional(['message' => 'Note saved.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateNoteRequest $request, int $note)
    {
        $record = $request->user()->notes()->findOrFail($note);
        $record->update(['body' => $request->validated('body')]);
        $record->load('ayah.surah');

        return (new NoteResource($record))->additional(['message' => 'Note updated.']);
    }

    public function destroy(Request $request, int $note)
    {
        $request->user()->notes()->findOrFail($note)->delete();

        return response()->json(['message' => 'Note deleted.']);
    }
}
