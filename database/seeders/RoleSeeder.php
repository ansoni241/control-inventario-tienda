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
                'config.Ver configuracion',
                //USUARIO
                'user.ver usuarios',
                'user.crear usuarios',
                'user.editar usuarios',
                'user.eliminar usuarios',
                'user.editar estado usuario',
                'user.editar password usuario',
            ],
            'administrador' => [
                //USUARIO
                'user.ver usuarios',
                'user.crear usuarios',
                'user.editar usuarios',
                'user.eliminar usuarios',
                'user.editar estado usuario',
                'user.editar password usuario',
            ],
            'vendedor' => [
                'user.ver usuarios',
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
