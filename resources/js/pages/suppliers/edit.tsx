import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { CreateSupplierProps, EditSupplierFormData } from "@/types/supplier";
import { Head, Link, useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
// import { useState } from "react";

import * as Yup from 'yup';
import { ValidationError } from 'yup';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Editar proveedor',
        href: '/edit/supplier',
    },
];

const userSchema = Yup.object().shape({
    name: Yup.string()
        .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras y espacios')
        .required('El nombre es obligatorio'),
    email: Yup.string().email('Correo inválido'),
    phone: Yup.string().nullable(),
    address: Yup.string().nullable(),
});

export default function Edit({ supplierData }: CreateSupplierProps) {

    const { data, setData, errors, processing, put } = useForm<EditSupplierFormData>({
        name: supplierData.name || '',
        email: supplierData.email || '',
        phone: supplierData.phone || '',
        address: supplierData.address || '',
    });
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const validateField = async (field: keyof EditSupplierFormData, value: unknown) => {
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
            put(`/suppliers/${supplierData.id}`, {
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
            <Head title="Editar Proveedor" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded border p-6 shadow-xl">
                    <div className='flex items-center justify-between mb-5'>
                        <div className="text-xl text-slate-600">Editar Proveedor</div>
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
