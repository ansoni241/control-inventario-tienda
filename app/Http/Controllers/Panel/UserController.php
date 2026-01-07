<?php

namespace App\Http\Controllers\Panel;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:user.ver usuarios')->only(['index', 'show']);
        $this->middleware('permission:user.crear usuarios')->only(['create', 'store']);
        $this->middleware('permission:user.editar usuarios')->only(['edit', 'update']);
        $this->middleware('permission:user.editar estado usuario')->only(['updateStatus']);
        $this->middleware('permission:user.editar password usuario')->only(['updatePassword']);
        $this->middleware('permission:user.eliminar usuarios')->only('destroy');
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::query()
            ->whereDoesntHave('roles', function ($query) {
                $query->where('name', 'admin'); // excluir admin
            })
            ->orderBy('id', 'desc')
            ->paginate(10); // paginación de 10 por página

        return Inertia::render('config/users/index', [
            'users' => $users,
            'can' => [
                'detalle' => Auth::user()->can('user.ver usuarios'),
                'create' => Auth::user()->can('user.crear usuarios'),
                'edit' => Auth::user()->can('user.editar usuarios'),
                'delete' => Auth::user()->can('user.eliminar usuarios'),
                'updateStatus' => Auth::user()->can('user.editar estado usuario'),
                'updatePassword' => Auth::user()->can('user.editar password usuario'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $roles = Role::select('id', 'name')
            ->where('name', '!=', 'admin') //excluye el rol "admin"
            ->get();
        return Inertia::render('config/users/create', [
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'status' => 'required|boolean',
            'image' => 'nullable|image|max:2048',
            'role' => [
                'required',
                Rule::exists('roles', 'name')->whereNot('name', 'admin'),
            ],
        ]);

        $user = new User($validated);
        $user->password = bcrypt($validated['password']);
        $user->created_by = Auth::id();

        // Guardar imagen si se subió
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('users', 'public');
            $user->image = $path;
        }

        $user->save();
        // Asignar rol al usuario
        $user->assignRole($request->role);
        return to_route('users.index')->with('message', 'Usuario creado exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::with(['roles'])->findOrFail($id);
        return response()->json($user);
    }
    public function updateStatus(Request $request, User $user)
    {
        // Evitar que otros usuarios cambien el estado del admin
        if ($user->hasRole('admin') && Auth::id() !== $user->id) {
            return redirect()->back()->withErrors([
                'error' => 'No se puede cambiar el estado del usuario administrador principal.',
            ]);
        }
        $validated = $request->validate([
            'status' => 'required|boolean',
        ]);

        $user->status = $validated['status'];
        $user->updated_by = Auth::id();
        $user->save();

        // Si el usuario se desactiva, invalidar sesión para sacarlo inmediatamente
        if (! $user->status) {
            // Elimina todas las sesiones activas de este usuario
            DB::table('sessions')->where('user_id', $user->id)->delete();
        }
        return back();
    }

    public function updatePassword(Request $request, User $user)
    {
        // Evitar que otros usuarios cambien la contraseña del admin
        if ($user->hasRole('admin') && Auth::id() !== $user->id) {
            return redirect()->back()->withErrors([
                'error' => 'No puedes cambiar la contraseña del usuario administrador principal.',
            ]);
        }
        $validated = $request->validate([
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user->password = bcrypt($validated['password']);
        $user->updated_by = Auth::id();
        $user->save();

        return redirect()->route('users.index')->with('message', 'Contraseña actualizada exitosamente');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        // Bloquear la edición del admin principal por otros usuarios
        if ($user->hasRole('admin') && Auth::id() !== $user->id) {
            return redirect()->route('users.index')->with('error', 'No puedes editar el usuario administrador principal');
        }
        $roles = Role::select('id', 'name')
            ->where('name', '!=', 'admin') //excluye el rol "admin"
            ->get();
        //añade el nombre del primer rol que tenga el usuario
        $user->load('roles');
        $user->role = $user->roles->first()?->name ?? '';

        return Inertia::render('config/users/edit', [
            'userData' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048',
            'role' => [
                'required',
                Rule::exists('roles', 'name')->whereNot('name', 'admin'),
            ],
        ]);

        $filePath = $user->image;
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $filePath = $file->store('users', 'public');

            // Solo eliminar si la imagen anterior no es null
            if ($user->image) {
                Storage::disk('public')->delete($user->image);
            }
        }

        $Updated = Auth::id();
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'city' => $request->city,
            'image' => $filePath,
            'updated_by' => $Updated,
        ]);
        // Asignar rol al usuario
        $user->syncRoles([$request->role]);

        return to_route('users.index')->with('message', 'Usuario actualizado con éxito');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
