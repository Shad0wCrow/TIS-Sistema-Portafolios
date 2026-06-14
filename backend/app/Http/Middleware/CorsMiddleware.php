<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    private const ALLOWED_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://enigma.tis.cs.umss.edu.bo',
    ];

    public function handle(Request $request, Closure $next)
    {
        if ($request->getMethod() === 'OPTIONS') {
            return response('', 204)->withHeaders($this->headers($request));
        }

        $response = $next($request);

        foreach ($this->headers($request) as $header => $value) {
            $response->headers->set($header, $value);
        }

        return $response;
    }

    private function headers(Request $request): array
    {
        $origin = $request->headers->get('Origin');
        $allowedOrigin = in_array($origin, self::ALLOWED_ORIGINS, true)
            ? $origin
            : self::ALLOWED_ORIGINS[0];

        return [
            'Access-Control-Allow-Origin' => $allowedOrigin,
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN',
            'Access-Control-Max-Age' => '86400',
        ];
    }
}
