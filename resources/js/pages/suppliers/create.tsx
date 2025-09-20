import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { CreateSupplierFormData } from "@/types/supplier";
import { Head, Link, useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import * as Yup from 'yup';
import { ValidationError } from 'yup';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Crear Proveedor',
        href: '/create/suppliers',
    },
];
const userSchema = Yup.object().shape({
    name: Yup.string()
        .required('El nombre es obligatorio')
        .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras y espacios'),
    email: Yup.string().email('Correo inválido'),
    phone: Yup.string().nullable(),
    address: Yup.string().nullable(),
});

export default function Create() {

    const { data, setData, post, errors, processing } = useForm<CreateSupplierFormData>({
        name: '',
        email: '',
        phone: '',
        address: '',
    });
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const validateField = async (field: keyof CreateSupplierFormData, value: unknown) => {
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
            post('/suppliers');
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
            <Head title="Crear Proveedor" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded border p-6 shadow-xl">
                    <div className='flex items-center justify-between mb-5'>
                        <div className="text-xl text-slate-600">Crear Proveedor</div>
                        <Button><Link href='/suppliers' prefetch>Volver</Link></Button>
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
                                        <Label htmlFor="email">Email (Opcional)</Label>
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
