<?php

namespace App\Http\Controllers\Panel;

use Inertia\Inertia;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:role.ver roles')->only(['index', 'show']);
        $this->middleware('permission:role.crear roles')->only(['create', 'store']);
        $this->middleware('permission:role.editar roles')->only(['edit', 'update']);
        $this->middleware('permission:role.eliminar roles')->only('destroy');
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::with('permissions')
            ->where('name', '!=', 'admin') // Excluir el rol admin
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Enviamos permisos disponibles para el formulario de creación
        $permissions = Permission::all(['id', 'name']);

        return Inertia::render('config/roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'can' => [
                'create' => Auth::user()->can('role.crear roles'),
                'edit' => Auth::user()->can('role.editar roles'),
                'delete' => Auth::user()->can('role.eliminar roles'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $permissions = Permission::all();

        // Agrupamos por módulo según el nombre del permiso
        // Ejemplo: 'user.crear usuarios' → 'user'
        $groupedPermissions = $permissions
            ->groupBy(function ($perm) {
                return explode('.', $perm->name)[0]; // "user", "category", etc.
            })
            ->map(function ($perms) {
                return $perms->map(function ($perm) {
                    return [
                        'id'   => $perm->id,
                        'name' => explode('.', $perm->name)[1] ?? $perm->name, // solo lo de después del punto
                    ];
                });
            });

        return Inertia::render('config/roles/create', [
            'groupedPermissions' => $groupedPermissions,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validación
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        // Crear rol
        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web', // importante si usas múltiples guards
        ]);

        // Asignar permisos (si vienen)
        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()
            ->route('roles.index')
            ->with('message', 'Rol creado exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        $userRole = Auth::user()->roles->pluck('name')->first(); // rol del usuario logueado
        // Bloquear edición según reglas
        if ($role->name === 'admin') {
            return redirect()->route('roles.index')
                ->with('error', 'No se puede editar el rol Admin.');
        }

        if ($role->name === 'administrador' && $userRole !== 'admin') {
            return redirect()->route('roles.index')
                ->with('error', 'No tienes permisos para editar el rol Administrador.');
        }

        $permissions = Permission::all();
        $groupedPermissions = $permissions
            ->groupBy(fn($perm) => explode('.', $perm->name)[0])
            ->map(fn($perms) => $perms->map(fn($perm) => [
                'id' => $perm->id,
                'name' => explode('.', $perm->name)[1] ?? $perm->name,
            ]));

        return Inertia::render('config/roles/edit', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('id')->toArray(),
            ],
            'groupedPermissions' => $groupedPermissions,
        ]);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        $userRole = Auth::user()->roles->pluck('name')->first();

        // Bloquear actualización según reglas
        if ($role->name === 'admin') {
            return redirect()->route('roles.index')
                ->with('error', 'No se puede actualizar el rol Admin.');
        }

        if ($role->name === 'administrador' && $userRole !== 'admin') {
            return redirect()->route('roles.index')
                ->with('error', 'No tienes permisos para actualizar el rol Administrador.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions'] ?? []);

        return redirect()->route('roles.index')
            ->with('message', 'Rol actualizado correctamente.');
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        // Roles que nunca se pueden eliminar
        $protectedRoles = ['admin', 'administrador'];

        if (in_array($role->name, $protectedRoles)) {
            return back()->with('error', 'No tienes permisos para eliminar este rol.');
        }

        $role->delete();

        return back()->with('message', 'Rol eliminado exitosamente.');
    }
}
