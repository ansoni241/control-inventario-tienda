import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { CreateCategoryProps, EditCategoryFormData } from "@/types/category";
import { Head, Link, useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
// import { useState } from "react";

import * as Yup from 'yup';
import { ValidationError } from 'yup';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit Category',
        href: '/edit/category',
    },
];

const userSchema = Yup.object().shape({
    name: Yup.string()
        .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo se permiten letras y espacios')
        .required('El nombre es obligatorio'),
    description: Yup.string().nullable(),
});

export default function Edit({ categoryData }: CreateCategoryProps) {

    const { data, setData, errors, processing, put } = useForm<EditCategoryFormData>({
        name: categoryData.name || '',
        description: categoryData.description || '',
    });
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const validateField = async (field: keyof EditCategoryFormData, value: unknown) => {
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
            put(`/categories/${categoryData.id}`, {
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
            <Head title="Edit category" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded border p-6 shadow-xl">
                    <div className='flex items-center justify-between mb-5'>
                        <div className="text-xl text-slate-600">Editar Categoria</div>
                        <Button><Link href='/categories' prefetch>Volver</Link></Button>
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
                                </div>
                                <div className="mt-4">
                                    <Label htmlFor="description">Descripción (opcional)</Label>
                                    <Textarea rows={4} id="description" value={data.description} onChange={e => setData('description', e.target.value)} />
                                    <InputError message={clientErrors.description || errors.description} />
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
