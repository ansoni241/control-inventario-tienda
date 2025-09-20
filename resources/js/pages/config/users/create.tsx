import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { CreateUserFormData, CreateUserProps } from "@/types/user";
import { Head, Link, useForm } from "@inertiajs/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

import * as Yup from 'yup';
import { ValidationError } from 'yup';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Crear Usuario',
        href: '/create/users',
    },
];
const userSchema = Yup.object().shape({
    name: Yup.string()
        .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras y espacios')
        .required('El nombre es obligatorio'),
    email: Yup.string().email('Correo inválido').required('El email es obligatorio'),
    password: Yup.string().min(6, 'Mínimo 6 caracteres').required('La contraseña es obligatoria'),
    password_confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
        .required('La confirmación es obligatoria'),
    phone: Yup.string().nullable(),
    address: Yup.string().nullable(),
    city: Yup.string().nullable(),
    status: Yup.boolean().required('El estado es obligatorio'),
    role: Yup.string().required('El rol es obligatorio'),
    image: Yup.mixed().nullable(),
});

export default function Create({ roles }: CreateUserProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, errors, processing } = useForm<CreateUserFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        image: null,
        phone: '',
        address: '',
        city: '',
        status: true,
        role: '',
    });
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const validateField = async (field: keyof CreateUserFormData, value: unknown) => {
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
            // Validación frontend
            await userSchema.validate(data, { abortEarly: false });

            // Envío al backend — los errores de Laravel aparecerán automáticamente en `errors`
            post('/users');
        } catch (error) {
            if (error instanceof ValidationError) {
                const newErrors: Record<string, string> = {};
                error.inner.forEach(err => {
                    if (err.path) newErrors[err.path] = err.message;
                });
                setClientErrors(newErrors);
            }
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Usuario" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded border p-6 shadow-xl">
                    <div className='flex items-center justify-between mb-5'>
                        <div className="text-xl text-slate-600">Crear Usuario</div>
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
                                        {/* <InputError message={errors.name} /> */}
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

                                    {/* Password */}
                                    <div className="col-span-2 md:col-span-1">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={data.password}
                                                onChange={e => {
                                                    setData('password', e.target.value);
                                                    validateField('password', e.target.value);
                                                }} className="pr-10"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500" tabIndex={-1}>
                                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        <InputError message={clientErrors.password || errors.password} />
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="col-span-2 md:col-span-1">
                                        <Label htmlFor="password_confirmation">Confirmar Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={data.password_confirmation}
                                                onChange={e => {
                                                    setData('password_confirmation', e.target.value);
                                                    validateField('password_confirmation', e.target.value);
                                                }}
                                                className="pr-10"
                                            />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500" tabIndex={-1}>
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        <InputError message={clientErrors.password_confirmation || errors.password_confirmation} />
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
                                        <Label htmlFor="status">Estado</Label>
                                        <Select
                                            value={data.status ? '1' : '0'}
                                            onValueChange={(value) => {
                                                const newValue = value === '1';
                                                setData('status', newValue);
                                                validateField('status', newValue);
                                            }}
                                        >
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Activo</SelectItem>
                                                <SelectItem value="0">Inactivo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={clientErrors.status || errors.status} />
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

                                <div className="mt-4">
                                    <Label htmlFor="image">Imagen (Opcional)</Label>
                                    <Input type="file" id="image" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setData('image', file);
                                    }} />
                                    <InputError message={errors.image} />
                                    {data.image && (
                                        <img src={URL.createObjectURL(data.image)} alt="Preview" className="mt-2 h-32 w-32 object-cover rounded-lg" />
                                    )}
                                </div>

                                <div className="mt-6 text-end">
                                    <Button type="submit" size="lg" className="bg-blue-500 text-white" disabled={processing}>
                                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <span>Crear</span>
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
