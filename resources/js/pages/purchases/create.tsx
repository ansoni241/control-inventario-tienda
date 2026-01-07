import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ComboBox } from "@/components/ui/comboBox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { CreatePurchaseFormData, CreatePurchaseProps, PurchaseItem } from "@/types/purchase";
import { Head, Link, useForm } from "@inertiajs/react";
import { Loader2, Plus, Trash } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";
import { ValidationError } from "yup";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Crear Compra",
        href: "/purchases/create",
    },
];

const purchaseSchema = Yup.object().shape({
    supplier_id: Yup.number()
        .nullable()
        .typeError('El proveedor debe ser válido'),
    date: Yup.string().required("La fecha de compra es obligatoria"),
    invoice_number: Yup.string().nullable(),
    notes: Yup.string().nullable(),
    items: Yup.array()
        .of(
            Yup.object().shape({
                product_id: Yup.string().required("Selecciona un producto"),
                quantity: Yup.number()
                    .typeError("Debe ser un número")
                    .positive("Debe ser mayor a 0")
                    .required("La cantidad es obligatoria"),
                unit_price: Yup.number()
                    .typeError("Debe ser un número")
                    .positive("Debe ser mayor a 0")
                    .required("El precio es obligatorio"),
            })
        )
        .min(1, "Agrega al menos un producto"),
});

export default function Create({ suppliers, products }: CreatePurchaseProps) {
    const { data, setData, post, processing, errors } = useForm<CreatePurchaseFormData>({
        supplier_id: null,
        date: "",
        invoice_number: "",
        notes: "",
        items: [
            {
                product_id: null,
                quantity: "",
                unit_price: "",
            },
        ],
    });

    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const validateField = async (field: keyof CreatePurchaseFormData, value: unknown) => {
        try {
            await purchaseSchema.validateAt(field as string, { ...data, [field]: value });
            setClientErrors(prev => ({ ...prev, [field]: "" }));
        } catch (error) {
            if (error instanceof ValidationError) {
                setClientErrors(prev => ({ ...prev, [field]: error.message }));
            }
        }
    };

    const validateItemField = async (
        index: number,
        field: keyof PurchaseItem,
        value: string | number
    ) => {
        try {
            const items = [...data.items];
            items[index] = {
                ...items[index],
                [field]: value,
            };
            await purchaseSchema.validateAt(`items[${index}].${field}`, { ...data, items });
            setClientErrors(prev => ({ ...prev, [`items.${index}.${field}`]: "" }));
        } catch (error) {
            if (error instanceof ValidationError) {
                setClientErrors(prev => ({
                    ...prev,
                    [`items.${index}.${field}`]: error.message,
                }));
            }
        }
    };

    const addItem = () => {
        setData("items", [...data.items, { product_id: null, quantity: "", unit_price: "" }]);
    };

    const removeItem = (index: number) => {
        const updated = data.items.filter((_, i) => i !== index);
        setData("items", updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await purchaseSchema.validate(data, { abortEarly: false });
            post("/purchases");
        } catch (error) {
            if (error instanceof ValidationError) {
                const newErrors: Record<string, string> = {};
                error.inner.forEach(err => {
                    if (err.path) {
                        // ✅ Normalizamos: items[0].product_id -> items.0.product_id
                        const normalizedPath = err.path.replace(/\[(\d+)\]/g, ".$1");
                        newErrors[normalizedPath] = err.message;
                    }
                });
                setClientErrors(newErrors);
            }
        }
    };
    // Calculamos el total visual
    const totalVisual = data.items.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        return sum + quantity * unitPrice;
    }, 0);


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Compra" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded border p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                        <div className="text-xl text-slate-600">Crear Compra</div>
                        <Button>
                            <Link href="/purchases" prefetch>
                                Volver
                            </Link>
                        </Button>
                    </div>
                    <Card>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* CABECERA */}
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

                                {/* DETALLE */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-medium text-slate-700">
                                            Productos
                                        </h3>
                                        <Button
                                            type="button"
                                            onClick={addItem}
                                            size="sm"
                                            className="bg-green-500 text-white"
                                        >
                                            <Plus className="w-4 h-4 mr-1" /> Agregar
                                        </Button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <div className="min-w-[900px] space-y-4">
                                            {data.items.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="grid grid-cols-4 gap-4 items-end border p-3 rounded-lg"
                                                >
                                                    <div>
                                                        <Label>Producto</Label>
                                                        <ComboBox
                                                            options={products}
                                                            value={item.product_id}
                                                            onChange={(val) => {
                                                                const updated = [...data.items];
                                                                updated[index].product_id = val;
                                                                setData("items", updated);
                                                                validateItemField(index, "product_id", val);
                                                            }}
                                                            placeholder="Seleccionar producto"
                                                        />
                                                        <InputError
                                                            message={
                                                                clientErrors[`items.${index}.product_id`] ||
                                                                errors[`items.${index}.product_id`]
                                                            }
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label>Cantidad</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                const updated = [...data.items];
                                                                updated[index].quantity = val;
                                                                setData("items", updated);
                                                                validateItemField(
                                                                    index,
                                                                    "quantity",
                                                                    val
                                                                );
                                                            }}
                                                        />
                                                        <InputError
                                                            message={
                                                                clientErrors[
                                                                `items.${index}.quantity`
                                                                ] || errors[`items.${index}.quantity`]
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Precio unitario</Label>
                                                        <Input
                                                            type="number"
                                                            value={item.unit_price}
                                                            onChange={e => {
                                                                const val = e.target.value;
                                                                const updated = [...data.items];
                                                                updated[index].unit_price = val;
                                                                setData("items", updated);
                                                                validateItemField(
                                                                    index,
                                                                    "unit_price",
                                                                    val
                                                                );
                                                            }}
                                                        />
                                                        <InputError
                                                            message={
                                                                clientErrors[
                                                                `items.${index}.unit_price`
                                                                ] || errors[`items.${index}.unit_price`]
                                                            }
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-sm text-gray-700">
                                                            Subtotal:{" "}
                                                            {Number(item.quantity || 0) *
                                                                Number(item.unit_price || 0)}
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="destructive"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-4 text-right text-lg font-semibold text-slate-700">
                                        Total: {totalVisual.toFixed(2)}
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
