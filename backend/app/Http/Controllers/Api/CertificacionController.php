<?php
 
namespace App\Http\Controllers\Api;
 
use App\Http\Controllers\Controller;
use App\Models\Certificacion;
use App\Models\EntidadEmisora;
use Illuminate\Http\Request;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
 
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
            'url_imagen'          => 'nullable|url|max:500',
            'imagen_file'         => 'nullable|image|max:5120',
            'visibilidad'         => 'nullable|in:publico,privado',
        ]);

        $urlImagen = $data['url_imagen'] ?? null;

        if ($request->hasFile('imagen_file')) {
            $resultado = Cloudinary::upload($request->file('imagen_file')->getRealPath(), [
                'folder' => 'portafolios/certificaciones',
            ]);
            $urlImagen = $resultado->getSecurePath();
        }
 
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
            'url_imagen'          => $urlImagen,
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

    public function update(Request $request, $id)
    {
        $user = $request->user();

        $certificacion = Certificacion::with('entidadEmisora')
            ->where('id_certificacion', $id)
            ->where('usuario_id', $user->id_usuario)
            ->where('eliminado', false)
            ->first();

        if (!$certificacion) {
            return response()->json(['message' => 'Certificacion no encontrada'], 404);
        }

        $allowedFields = [
            'fecha_expiracion',
            'url_certificado',
            'url_imagen',
            'imagen_file',
            'visibilidad',
            '_method',
        ];

        $blockedFields = collect(array_keys($request->all()))
            ->diff($allowedFields)
            ->values();

        if ($blockedFields->isNotEmpty()) {
            return response()->json([
                'message' => 'No se permite modificar campos bloqueados de la certificacion.',
                'campos_bloqueados' => $blockedFields,
            ], 422);
        }

        $data = $request->validate([
            'fecha_expiracion' => 'nullable|date',
            'url_certificado'  => 'nullable|url|max:500',
            'url_imagen'       => 'nullable|url|max:500',
            'imagen_file'      => 'nullable|image|max:5120',
            'visibilidad'      => 'nullable|in:publico,privado',
        ]);

        if (
            array_key_exists('fecha_expiracion', $data)
            && $data['fecha_expiracion']
            && $data['fecha_expiracion'] <= $certificacion->fecha_obtencion
        ) {
            return response()->json([
                'message' => 'La fecha de expiracion debe ser posterior a la fecha de expedicion.',
            ], 422);
        }

        if ($request->hasFile('imagen_file')) {
            $resultado = Cloudinary::upload($request->file('imagen_file')->getRealPath(), [
                'folder' => 'portafolios/certificaciones',
            ]);
            $data['url_imagen'] = $resultado->getSecurePath();
        }

        $certificacion->fill([
            'fecha_expiracion' => array_key_exists('fecha_expiracion', $data)
                ? ($data['fecha_expiracion'] ?? null)
                : $certificacion->fecha_expiracion,
            'url_certificado' => array_key_exists('url_certificado', $data)
                ? ($data['url_certificado'] ?? null)
                : $certificacion->url_certificado,
            'url_imagen' => array_key_exists('url_imagen', $data)
                ? ($data['url_imagen'] ?? null)
                : $certificacion->url_imagen,
            'visibilidad' => $data['visibilidad'] ?? $certificacion->visibilidad,
        ]);
        $certificacion->save();

        return response()->json([
            'message' => 'Certificacion actualizada correctamente',
            'certificacion' => $certificacion->fresh('entidadEmisora'),
        ]);
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
public function updateVisibilidad(Request $request, $id)
{
    $user = $request->user();
 
    $item = Certificacion::where('id_certificacion', $id)
        ->where('usuario_id', $user->id_usuario)
        ->firstOrFail();
 
    $request->validate(['visibilidad' => 'required|in:publico,privado']);
 
    $item->visibilidad = $request->visibilidad;
    $item->save();
 
    return response()->json(['visibilidad' => $item->visibilidad]);
}

}
