import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';

interface Permission {
    id: number;
    name: string;
}

interface CreateRoleProps {
    groupedPermissions: Record<string, Permission[]>;
}

export default function Create({ groupedPermissions }: CreateRoleProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        permissions: [] as number[],
    });

    // Alternar permiso individual
    const togglePermission = (id: number) => {
        if (data.permissions.includes(id)) {
            setData('permissions', data.permissions.filter((p) => p !== id));
        } else {
            setData('permissions', [...data.permissions, id]);
        }
    };

    // Seleccionar/deseleccionar todo un módulo
    const toggleAllModule = (modulePermissions: Permission[]) => {
        const allSelected = modulePermissions.every((p) =>
            data.permissions.includes(p.id)
        );
        if (allSelected) {
            setData(
                'permissions',
                data.permissions.filter(
                    (id) => !modulePermissions.some((p) => p.id === id)
                )
            );
        } else {
            const newPermissions = modulePermissions
                .map((p) => p.id)
                .filter((id) => !data.permissions.includes(id));
            setData('permissions', [...data.permissions, ...newPermissions]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/roles'); // Ruta store
    };

    return (
        <AppLayout>
            <Head title="Crear Rol" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded border p-6 shadow-xl">
                    <div className='flex items-center justify-between mb-5'>
                        <div className="text-xl text-slate-600">Crear Usuario</div>
                        <Button><Link href='/roles' prefetch>Volver</Link></Button>
                    </div>
                    <Card>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Nombre del rol */}
                                <div>
                                    <Label htmlFor="name">Nombre del rol</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Ej: Administrador"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                {/* Permisos agrupados por módulo */}
                                {Object.entries(groupedPermissions).map(([module, perms]) => (
                                    <div
                                        key={module}
                                        className="border rounded-lg p-4 shadow-sm space-y-3"
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-semibold text-slate-700 capitalize">
                                                {module}
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleAllModule(perms)}
                                            >
                                                {perms.every((p) => data.permissions.includes(p.id))
                                                    ? 'Ninguno'
                                                    : 'Todos'}
                                            </Button>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {perms.map((perm) => (
                                                <label
                                                    key={perm.id}
                                                    className="flex items-center gap-1 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={data.permissions.includes(perm.id)}
                                                        onCheckedChange={() => togglePermission(perm.id)}
                                                    />
                                                    <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-700">
                                                        {perm.name}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Botón submit */}
                                <div className="mt-6 text-end">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="bg-blue-500 text-white"
                                        disabled={processing}
                                    >
                                        {processing ? 'Creando...' : 'Crear'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
