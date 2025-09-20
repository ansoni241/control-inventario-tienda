<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissionsByRole = [
            'admin' => [
                //Configuracion---------------------------------------------
                'Ver configuracion',
                //USUARIO
                'ver usuarios',
                'crear usuarios',
                'editar usuarios',
                'eliminar usuarios',
                'editar estado usuario',
                'editar password usuario',
            ],
            'administrador' => [
                //USUARIO
                'ver usuarios',
                'crear usuarios',
                'editar usuarios',
                'eliminar usuarios',
                'editar estado usuario',
                'editar password usuario',
            ],
            'vendedor' => [
                'ver usuarios',
            ],
        ];
        foreach ($permissionsByRole as $roleName => $permissions) {
            $role = Role::firstOrCreate(['name' => $roleName]);

            foreach ($permissions as $permName) {
                $permission = Permission::firstOrCreate(['name' => $permName]);
                $role->givePermissionTo($permission);
            }
        }
    }
}
