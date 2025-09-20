<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
// use Illuminate\Foundation\Auth\User;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verifica si ya existe
        if (User::where('email', 'admin@gmail.com')->exists()) {
            return;
        }
        // Crea el usuario
        $admin = User::create([
            'name' => 'Admin Principal',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('admin'),
            'status' => true,
        ]);

        // Asegúrate de que el rol "admin" exista
        $role = Role::firstOrCreate(['name' => 'admin']);

        // Asigna el rol al usuario
        $admin->assignRole($role);
    }
}
