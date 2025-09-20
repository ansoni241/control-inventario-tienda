import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ComboBox } from "@/components/ui/comboBox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { CreatePurchaseProps, EditPurchaseFormData } from "@/types/purchase";
import { Head, Link, useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
// import { useState } from "react";

import * as Yup from 'yup';
import { ValidationError } from 'yup';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Editar Compra',
        href: '/edit/purchase',
    },
];

const userSchema = Yup.object().shape({
    supplier_id: Yup.number()
        .nullable()
        .typeError('El proveedor debe ser válido'),
    date: Yup.string().required("La fecha de compra es obligatoria"),
    invoice_number: Yup.string().nullable(),
    notes: Yup.string().nullable(),
});

export default function Edit({ purchaseData, suppliers }: CreatePurchaseProps) {

    const { data, setData, errors, processing, put } = useForm<EditPurchaseFormData>({
        supplier_id: purchaseData.supplier_id ?? null,
        date: purchaseData.date ?? "",
        invoice_number: purchaseData.invoice_number ?? "",
        notes: purchaseData.notes ?? "",
    });
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
    const validateField = async (field: keyof EditPurchaseFormData, value: unknown) => {
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
            put(`/purchases/${purchaseData.id}`, {
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
            <Head title="Editar Compra" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded border p-6 shadow-xl">
                    <div className='flex items-center justify-between mb-5'>
                        <div className="text-xl text-slate-600">Editar Compra</div>
                        <Button><Link href='/purchases' prefetch>Volver</Link></Button>
                    </div>
                    <Card>
                        <CardContent>
                            <form onSubmit={handleFormSubmit}>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Proveedor */}
                                    <div className="col-span-2 md:col-span-1">
                                        <Label>Proveedor</Label>
                                        <ComboBox
                                            options={suppliers}
                                            value={data.supplier_id}
                                            onChange={(id) => {
                                                setData('supplier_id', id);
                                                validateField('supplier_id', id);
                                            }}
                                            placeholder="Seleccionar proveedor"
                                        />
                                        <InputError message={clientErrors.supplier_id || errors.supplier_id} />
                                    </div>
                                    {/* Fecha compra */}
                                    <div className="col-span-2 md:col-span-1">
                                        <Label>Fecha de compra</Label>
                                        <Input
                                            type="date"
                                            value={data.date}
                                            onChange={e => {
                                                setData("date", e.target.value);
                                                validateField("date", e.target.value);
                                            }}
                                        />
                                        <InputError
                                            message={
                                                clientErrors.date || errors.date
                                            }
                                        />
                                    </div>
                                    {/* Factura */}
                                    <div className="col-span-2 md:col-span-1">
                                        <Label>Nº de factura</Label>
                                        <Input
                                            value={data.invoice_number ?? ""}
                                            onChange={e =>
                                                setData("invoice_number", e.target.value)
                                            }
                                        />
                                        <InputError message={errors.invoice_number} />
                                    </div>

                                    {/* Descripción */}
                                    <div className="col-span-2">
                                        <Label>Notas / Observaciones</Label>
                                        <textarea
                                            className="w-full rounded-md border p-2"
                                            value={data.notes ?? ""}
                                            onChange={e => setData("notes", e.target.value)}
                                        />
                                        <InputError message={errors.notes} />
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
