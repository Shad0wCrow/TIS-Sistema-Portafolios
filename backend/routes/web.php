<?php

use Illuminate\Support\Facades\Route;

Route::get('/portafolio/publico/{slug}', function (string $slug) {
    $frontendUrl = rtrim(config('app.frontend_url') ?: config('app.url'), '/');

    return redirect()->away($frontendUrl . '/portafolio/publico/' . $slug);
});
