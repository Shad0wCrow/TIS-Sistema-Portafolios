<?php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Logro;
use App\Models\EntidadEmisora;
use Illuminate\Http\Request;
 
class LogroController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
 
        $data = $request->validate([
            'titulo'          => 'required|string|max:150',
            'nombre_entidad'  => 'required|string|max:150',
            'fecha_obtencion' => 'required|date|before_or_equal:today',
            'descripcion'     => 'nullable|string',
            'url_credencial'  => 'nullable|url|max:500',
            'identificador'   => 'nullable|string|max:150',
            'visibilidad'     => 'nullable|in:publico,privado',
        ]);
 
        if ($data['identificador'] ?? null) {
            $duplicado = Logro::where('usuario_id', $user->id_usuario)
                ->where('identificador', $data['identificador'])
                ->where('eliminado', false)
                ->exists();
 
            if ($duplicado) {
                return response()->json(['message' => 'Ya existe un logro con ese identificador de credencial'], 400);
            }
        }
 
        $entidad = EntidadEmisora::firstOrCreate(
            ['nombre' => $data['nombre_entidad']],
            ['nombre' => $data['nombre_entidad']]
        );
 
        $logro = Logro::create([
            'usuario_id'         => $user->id_usuario,
            'entidad_emisora_id' => $entidad->id_entidad_emisora,
            'titulo'             => $data['titulo'],
            'descripcion'        => $data['descripcion'] ?? null,
            'fecha_obtencion'    => $data['fecha_obtencion'],
            'url_credencial'     => $data['url_credencial'] ?? null,
            'identificador'      => $data['identificador'] ?? null,
            'visibilidad'        => $data['visibilidad'] ?? 'publico',
            'eliminado'          => false,
        ]);
 
        return response()->json([
            'message' => 'Logro registrado correctamente',
            'logro'   => $logro->load('entidadEmisora'),
        ], 201);
    }
 
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
 
        $logro = Logro::where('id_logro', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();
 
        if (!$logro) {
            return response()->json(['message' => 'Logro no encontrado'], 404);
        }
 
        $logro->update(['eliminado' => true]);
 
        return response()->json(['message' => 'Logro eliminado correctamente']);
    }

    public function sugerencias(Request $request)
    {
        $q = $request->query('q', '');

        if (strlen(trim($q)) < 3) {
            return response()->json(['sugerencias' => []]);
        }

        $sugerencias = EntidadEmisora::where('nombre', 'like', '%' . $q . '%')
            ->orderBy('nombre')
            ->limit(8)
            ->pluck('nombre');

        return response()->json(['sugerencias' => $sugerencias]);
    }

    public function index(Request $request)
{
    $user = $request->user();

    $logros = Logro::with('entidadEmisora')
        ->where('usuario_id', $user->id_usuario)
        ->where('eliminado', false)
        ->orderByDesc('fecha_obtencion')
        ->get();

    return response()->json(['logros' => $logros]);
}

public function show(Request $request, $id)
{
    $user = $request->user();

    $logro = Logro::with('entidadEmisora')
        ->where('id_logro', $id)
        ->where('usuario_id', $user->id_usuario)
        ->where('eliminado', false)
        ->first();

    if (!$logro) {
        return response()->json(['message' => 'Logro no encontrado'], 404);
    }

    return response()->json(['logro' => $logro]);
}
}