<?php

use Illuminate\Support\Facades\Route;

// This backend is a JSON API only — see routes/api.php. The actual UI
// is the separate React app in frontend/.
Route::get('/', function () {
    return response()->json(['message' => 'Client Project Tracker API']);
});
