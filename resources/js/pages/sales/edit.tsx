import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ComboBox } from "@/components/ui/comboBox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, useForm, Link } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";
import { ValidationError } from "yup";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Ventas", href: "/sales" },
    { title: "Editar Venta", href: "#" },
];

const saleSchema = Yup.object().shape({
    customer_id: Yup.number().required("Debe seleccionar un cliente"),
    date: Yup.string().required("La fecha es obligatoria"),
});

interface EditSaleProps {
    saleData: {
        id: number;
        customer_id: number;
        customer_name: string;
        date: string;
    };
    customers: { id: number; name: string }[];
}

export default function Edit({ saleData, customers }: EditSaleProps) {
    const { data, setData, errors, processing, put } = useForm({
        customer_id: saleData.customer_id,
        date: saleData.date,
    });

    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const validateField = async (field: keyof typeof data, value: unknown) => {
        try {
            await saleSchema.validateAt(field as string, { ...data, [field]: value });
            setClientErrors((prev) => ({ ...prev, [field]: "" }));
        } catch (error) {
            if (error instanceof ValidationError) {
                setClientErrors((prev) => ({ ...prev, [field]: error.message }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            // Limpiar errores previos
            setClientErrors({});
            await saleSchema.validate(data, { abortEarly: false });

            // Confirmación de actualización
            if (!confirm("¿Estás seguro de realizar los cambios?")) return;

            // Enviar PUT request usando Inertia
            put(`/sales/${saleData.id}`, {
                preserveScroll: true,
                onSuccess: () => toast.success("Venta actualizada exitosamente"),
                onError: () => toast.error("Error al actualizar la venta"),
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
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Venta" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded border p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                        <div className="text-xl text-slate-600">Editar Venta</div>
                        <Button>
                            <Link href="/sales" prefetch>
                                Volver
                            </Link>
                        </Button>
                    </div>
                    <Card>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Cliente */}
                                    <div className="col-span-2 md:col-span-1">
                                        <Label>Cliente</Label>
                                        <ComboBox
                                            options={customers}
                                            value={data.customer_id}
                                            onChange={(id) => {
                                                setData("customer_id", id);
                                                validateField("customer_id", id);
                                            }}
                                            placeholder="Seleccionar cliente"
                                        />
                                        <InputError
                                            message={clientErrors.customer_id || errors.customer_id}
                                        />
                                    </div>

                                    {/* Fecha */}
                                    <div className="col-span-2 md:col-span-1">
                                        <Label>Fecha de venta</Label>
                                        <Input
                                            type="date"
                                            value={data.date}
                                            onChange={(e) => {
                                                setData("date", e.target.value);
                                                validateField("date", e.target.value);
                                            }}
                                        />
                                        <InputError message={clientErrors.date || errors.date} />
                                    </div>
                                </div>

                                <div className="mt-6 text-end">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="bg-blue-500 text-white"
                                        disabled={processing}
                                    >
                                        {processing && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Guardar
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
