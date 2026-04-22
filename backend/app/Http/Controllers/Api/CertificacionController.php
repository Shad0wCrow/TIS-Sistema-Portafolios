<?php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Certificacion;
use App\Models\EntidadEmisora;
use Illuminate\Http\Request;
 
class CertificacionController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
 
        $data = $request->validate([
            'nombre'              => 'required|string|max:150',
            'nombre_entidad'      => 'required|string|max:150',
            'fecha_obtencion'     => 'required|date|before_or_equal:today',
            'fecha_expiracion'    => 'nullable|date|after:fecha_obtencion',
            'url_certificado'     => 'nullable|url|max:500',
            'visibilidad'         => 'nullable|in:publico,privado',
        ]);
 
        $entidad = EntidadEmisora::firstOrCreate(
            ['nombre' => $data['nombre_entidad']],
            ['nombre' => $data['nombre_entidad']]
        );
 
        $certificacion = Certificacion::create([
            'usuario_id'          => $user->id_usuario,
            'entidad_emisora_id'  => $entidad->id_entidad_emisora,
            'nombre'              => $data['nombre'],
            'fecha_obtencion'     => $data['fecha_obtencion'],
            'fecha_expiracion'    => $data['fecha_expiracion'] ?? null,
            'url_certificado'     => $data['url_certificado'] ?? null,
            'visibilidad'         => $data['visibilidad'] ?? 'publico',
            'eliminado'           => false,
        ]);
 
        return response()->json([
            'message'       => 'Certificación registrada correctamente',
            'certificacion' => $certificacion->load('entidadEmisora'),
        ], 201);
    }
 
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
 
        $certificacion = Certificacion::where('id_certificacion', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();
 
        if (!$certificacion) {
            return response()->json(['message' => 'Certificación no encontrada'], 404);
        }
 
        $certificacion->update(['eliminado' => true]);
 
        return response()->json(['message' => 'Certificación eliminada correctamente']);
    }

    public function index(Request $request)
{
    $user = $request->user();

    $certificaciones = Certificacion::with('entidadEmisora')
        ->where('usuario_id', $user->id_usuario)
        ->where('eliminado', false)
        ->orderByDesc('fecha_obtencion')
        ->get();

    return response()->json(['certificaciones' => $certificaciones]);
}

public function show(Request $request, $id)
{
    $user = $request->user();

    $certificacion = Certificacion::with('entidadEmisora')
        ->where('id_certificacion', $id)
        ->where('usuario_id', $user->id_usuario)
        ->where('eliminado', false)
        ->first();

    if (!$certificacion) {
        return response()->json(['message' => 'Certificación no encontrada'], 404);
    }

    return response()->json(['certificacion' => $certificacion]);
}

public function sugerencias(Request $request)
{
    $q = $request->query('q', '');
    $sugerencias = EntidadEmisora::where('nombre', 'like', "%{$q}%")
        ->limit(8)
        ->pluck('nombre');
    return response()->json(['sugerencias' => $sugerencias]);
}


}