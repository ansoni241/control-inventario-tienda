import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { EditUserFormData, CreateUserProps } from "@/types/user";
import { Head, Link, useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
// import { useState } from "react";

import * as Yup from 'yup';
import { ValidationError } from 'yup';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit User',
        href: '/edit/user',
    },
];

const userSchema = Yup.object().shape({
    name: Yup.string()
        .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras y espacios')
        .required('El nombre es obligatorio'),
    email: Yup.string().email('Correo inválido').required('El email es obligatorio'),
    phone: Yup.string().nullable(),
    address: Yup.string().nullable(),
    city: Yup.string().nullable(),
    role: Yup.string().required('El rol es obligatorio'),
    image: Yup.mixed().nullable(),
});

export default function Edit({ roles, userData }: CreateUserProps) {

    const { data, setData, errors, processing, put } = useForm<EditUserFormData>({
        name: userData.name || '',
        email: userData.email || '',
        image: null,
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        role: userData.role ?? '',
    });
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const validateField = async (field: keyof EditUserFormData, value: unknown) => {
        try {
            await userSchema.validateAt(field as string, { ...data, [field]: value });
            setClientErrors(prev => ({ ...prev, [field]: '' }));
        } catch (error) {
            if (error instanceof ValidationError) {
                setClientErrors(prev => ({ ...prev, [field]: error.message }));
            }
        }
    };

    async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            // Limpiar errores del cliente
            setClientErrors({});

            // Validación frontend con Yup
            await userSchema.validate(data, { abortEarly: false });

            // Agregar _method para que Laravel lo trate como PUT
            setData('_method', 'put');

            // Enviar formulario
            put(`/users/${userData.id}`, {
                preserveScroll: true,
                onError: () => {
                    // Los errores del backend aparecerán en `errors`
                },
            });
        } catch (error) {
            if (error instanceof ValidationError) {
                const newErrors: Record<string, string> = {};
                error.inner.forEach((err) => {
                    if (err.path) newErrors[err.path] = err.message;
                });
                setClientErrors(newErrors);
            }
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded border p-6 shadow-xl">
                    <div className='flex items-center justify-between mb-5'>
                        <div className="text-xl text-slate-600">Editar Usuario</div>
                        <Button><Link href='/users' prefetch>Volver</Link></Button>
                    </div>
                    <Card>
                        <CardContent>
                            <form onSubmit={handleFormSubmit}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <Label htmlFor="name">Nombre</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={e => {
                                                setData('name', e.target.value);
                                                validateField('name', e.target.value);
                                            }}
                                        />
                                        <InputError message={clientErrors.name || errors.name} />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={e => {
                                                setData('email', e.target.value);
                                                validateField('email', e.target.value);
                                            }}
                                        />
                                        <InputError message={clientErrors.email || errors.email} />
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <Label htmlFor="phone">Celular (Opcional)</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={e => {
                                                setData('phone', e.target.value);
                                                validateField('phone', e.target.value);
                                            }}
                                        />
                                        <InputError message={clientErrors.phone || errors.phone} />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <Label htmlFor="address">Dirección (Opcional)</Label>
                                        <Input
                                            id="address"
                                            value={data.address}
                                            onChange={e => {
                                                setData('address', e.target.value);
                                                validateField('address', e.target.value);
                                            }}
                                        />
                                        <InputError message={clientErrors.address || errors.address} />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <Label htmlFor="city">Ciudad (Opcional)</Label>
                                        <Input
                                            id="city"
                                            value={data.city}
                                            onChange={e => {
                                                setData('city', e.target.value);
                                                validateField('city', e.target.value);
                                            }}
                                        />
                                        <InputError message={clientErrors.city || errors.city} />
                                    </div>

                                    <div className="col-span-2 md:col-span-1">
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            value={data.role}
                                            onValueChange={(value) => {
                                                setData('role', value);
                                                validateField('role', value);
                                            }}
                                        >
                                            <SelectTrigger id="role">
                                                <SelectValue placeholder="Select Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map(role => (
                                                    <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={clientErrors.role || errors.role} />
                                    </div>

                                </div>

                                {/* Image */}
                                <div className="mt-4">
                                    <Label htmlFor="image">Imagen (Opcional)</Label>
                                    <Input
                                        type="file"
                                        id="image"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setData('image', file);
                                        }}
                                    />
                                    <InputError message={errors.image} />

                                    {/* Mostrar imagen actual si no se ha seleccionado una nueva */}
                                    {userData.image && !data.image && (
                                        <img
                                            src={`/storage/${userData.image}`} // ✅ Prefijo agregado
                                            alt="Current"
                                            className="mt-2 h-32 w-32 object-cover rounded-lg"
                                        />
                                    )}

                                    {/* Mostrar vista previa si hay una nueva imagen seleccionada */}
                                    {data.image && (
                                        <img
                                            src={URL.createObjectURL(data.image)}
                                            alt="Preview"
                                            className="mt-2 h-32 w-32 object-cover rounded-lg"
                                        />
                                    )}
                                </div>

                                <div className="mt-6 text-end">
                                    <Button type="submit" size="lg" className="bg-blue-500 text-white" disabled={processing}>
                                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <span>Guardar</span>
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
