<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GithubController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'github_username' => $user->github_username,
            'github_conectado_en' => $user->github_conectado_en,
        ]);
    }

    public function save(Request $request)
    {
        $data = $request->validate([
            'github_username' => 'required|string|max:100|regex:/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38}[A-Za-z0-9])?$/',
        ]);

        $username = trim($data['github_username']);
        $this->fetchGithubUser($username);

        $user = $request->user();
        $user->update([
            'github_username' => $username,
            'github_conectado_en' => now(),
        ]);

        return response()->json([
            'message' => 'Usuario de GitHub vinculado correctamente',
            'github_username' => $user->github_username,
            'github_conectado_en' => $user->github_conectado_en,
        ]);
    }

    public function repos(Request $request)
    {
        $data = $request->validate([
            'username' => 'nullable|string|max:100|regex:/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38}[A-Za-z0-9])?$/',
        ]);

        $user = $request->user();
        $username = trim($data['username'] ?? $user->github_username ?? '');

        if ($username === '') {
            return response()->json(['message' => 'Ingresa un usuario de GitHub.'], 422);
        }

        $this->fetchGithubUser($username);

        $response = Http::withHeaders($this->githubHeaders())
            ->get("https://api.github.com/users/{$username}/repos", [
                'type' => 'owner',
                'sort' => 'updated',
                'per_page' => 100,
            ]);

        if ($response->failed()) {
            return response()->json([
                'message' => 'No se pudieron obtener los repositorios de GitHub.',
            ], $response->status() === 404 ? 404 : 502);
        }

        $repos = collect($response->json())
            ->reject(fn($repo) => (bool) ($repo['fork'] ?? false))
            ->reject(fn($repo) => (int) ($repo['size'] ?? 0) === 0)
            ->map(fn($repo) => [
                'github_id' => $repo['id'] ?? null,
                'titulo' => $repo['name'] ?? '',
                'descripcion' => $repo['description'] ?? '',
                'fecha_inicio' => isset($repo['created_at']) ? substr($repo['created_at'], 0, 10) : null,
                'fecha_fin' => null,
                'demo_url' => $repo['homepage'] ?? null,
                'repositorio_url' => $repo['html_url'] ?? null,
                'imagen_principal_url' => null,
                'estado' => 'en_progreso',
                'roles' => array_values(array_filter([$repo['language'] ?? null])),
            ])
            ->values();

        $user->update([
            'github_username' => $username,
            'github_conectado_en' => now(),
        ]);

        return response()->json([
            'github_username' => $username,
            'repositorios' => $repos,
        ]);
    }

    private function fetchGithubUser(string $username): void
    {
        $response = Http::withHeaders($this->githubHeaders())
            ->get("https://api.github.com/users/{$username}");

        if ($response->status() === 404) {
            throw new HttpResponseException(
                response()->json(['message' => 'El usuario de GitHub no existe.'], 404)
            );
        }

        if ($response->failed()) {
            throw new HttpResponseException(
                response()->json(['message' => 'GitHub no respondió correctamente.'], 502)
            );
        }
    }

    private function githubHeaders(): array
    {
        return [
            'Accept' => 'application/vnd.github+json',
            'User-Agent' => 'front-portafolio',
        ];
    }
}
