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
                //ROL
                'role.ver roles',
                'role.crear roles',
                'role.editar roles',
                'role.eliminar roles',
                //CATEGORIA
                'categoria.ver categorias',
                'categoria.crear categorias',
                'categoria.editar categorias',
                'categoria.eliminar categorias',
                //PROVEEDOR
                'proveedor.ver proveedores',
                'proveedor.crear proveedores',
                'proveedor.editar proveedores',
                'proveedor.eliminar proveedores',
                //CLIENTE
                'cliente.ver clientes',
                'cliente.crear clientes',
                'cliente.editar clientes',
                'cliente.eliminar clientes',
                //PRODUCTO
                'producto.ver productos',
                'producto.crear productos',
                'producto.editar productos',
                'producto.eliminar productos',
                //COMPRA
                'compra.ver compras',
                'compra.crear compras',
                'compra.editar compras',
                'compra.eliminar compras',
                //REPORTE COMPRA
                'reporte-compra.ver reporte compra',
                'reporte-compra.exportar reporte compra',

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
