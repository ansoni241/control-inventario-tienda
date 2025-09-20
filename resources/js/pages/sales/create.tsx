// import InputError from "@/components/input-error";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { ComboBox } from "@/components/ui/comboBox";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import AppLayout from "@/layouts/app-layout";
// import { type BreadcrumbItem } from "@/types";
// import { CreateSaleFormData, SaleItem, CreateSaleProps } from "@/types/sale";
// import { Head, Link, useForm } from "@inertiajs/react";
// import { Loader2, Plus, Trash } from "lucide-react";
// import { useState } from "react";
// import * as Yup from "yup";
// import { ValidationError } from "yup";

// const breadcrumbs: BreadcrumbItem[] = [
//     {
//         title: "Crear Venta",
//         href: "/sales/create",
//     },
// ];

// const saleSchema = Yup.object().shape({
//     customer_id: Yup.number()
//         .nullable()
//         .typeError("El cliente debe ser válido"),
//     date: Yup.string().required("La fecha de venta es obligatoria"),
//     items: Yup.array()
//         .of(
//             Yup.object().shape({
//                 product_id: Yup.number()
//                     .typeError("Selecciona un producto")
//                     .required("Selecciona un producto"),
//                 quantity: Yup.number()
//                     .typeError("Debe ser un número")
//                     .positive("Debe ser mayor a 0")
//                     .required("La cantidad es obligatoria"),
//                 unit_price: Yup.number()
//                     .typeError("Debe ser un número")
//                     .positive("Debe ser mayor a 0")
//                     .required("El precio es obligatorio"),
//             })
//         )
//         .min(1, "Agrega al menos un producto"),
// });

// export default function Create({ customers, products }: CreateSaleProps) {
//     const { data, setData, post, processing, errors } = useForm<CreateSaleFormData>({
//         customer_id: null,
//         date: "",
//         items: [
//             {
//                 product_id: null,
//                 quantity: "",
//                 unit_price: "",
//             },
//         ],
//     });

//     const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

//     const validateField = async (field: keyof CreateSaleFormData, value: unknown) => {
//         try {
//             await saleSchema.validateAt(field as string, { ...data, [field]: value });
//             setClientErrors(prev => ({ ...prev, [field]: "" }));
//         } catch (error) {
//             if (error instanceof ValidationError) {
//                 setClientErrors(prev => ({ ...prev, [field]: error.message }));
//             }
//         }
//     };

//     const validateItemField = async (
//         index: number,
//         field: keyof SaleItem,
//         value: string | number
//     ) => {
//         try {
//             const items = [...data.items];
//             items[index] = {
//                 ...items[index],
//                 [field]: value,
//             };
//             await saleSchema.validateAt(`items[${index}].${field}`, { ...data, items });
//             setClientErrors(prev => ({ ...prev, [`items.${index}.${field}`]: "" }));
//         } catch (error) {
//             if (error instanceof ValidationError) {
//                 setClientErrors(prev => ({
//                     ...prev,
//                     [`items.${index}.${field}`]: error.message,
//                 }));
//             }
//         }
//     };

//     const addItem = () => {
//         setData("items", [...data.items, { product_id: null, quantity: "", unit_price: "" }]);
//     };

//     const removeItem = (index: number) => {
//         const updated = data.items.filter((_, i) => i !== index);
//         setData("items", updated);
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         try {
//             await saleSchema.validate(data, { abortEarly: false });
//             post("/sales");
//         } catch (error) {
//             if (error instanceof ValidationError) {
//                 const newErrors: Record<string, string> = {};
//                 error.inner.forEach(err => {
//                     if (err.path) {
//                         const normalizedPath = err.path.replace(/\[(\d+)\]/g, ".$1");
//                         newErrors[normalizedPath] = err.message;
//                     }
//                 });
//                 setClientErrors(newErrors);
//             }
//         }
//     };

//     const totalVisual = data.items.reduce((sum, item) => {
//         const quantity = Number(item.quantity) || 0;
//         const unitPrice = Number(item.unit_price) || 0;
//         return sum + quantity * unitPrice;
//     }, 0);

//     return (
//         <AppLayout breadcrumbs={breadcrumbs}>
//             <Head title="Crear Venta" />
//             <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
//                 <div className="rounded border p-6 shadow-xl">
//                     <div className="flex items-center justify-between mb-5">
//                         <div className="text-xl text-slate-600">Crear Venta</div>
//                         <Button>
//                             <Link href="/sales" prefetch>
//                                 Volver
//                             </Link>
//                         </Button>
//                     </div>
//                     <Card>
//                         <CardContent>
//                             <form onSubmit={handleSubmit} className="space-y-6">
//                                 {/* CABECERA */}
//                                 <div className="grid grid-cols-2 gap-4">
//                                     <div className="col-span-2 md:col-span-1">
//                                         <Label>Cliente</Label>
//                                         <ComboBox
//                                             options={customers}
//                                             value={data.customer_id}
//                                             onChange={(id) => {
//                                                 setData('customer_id', id);
//                                                 validateField('customer_id', id);
//                                             }}
//                                             placeholder="Seleccionar cliente"
//                                         />
//                                         <InputError message={clientErrors.customer_id || errors.customer_id} />
//                                     </div>

//                                     <div className="col-span-2 md:col-span-1">
//                                         <Label>Fecha de venta</Label>
//                                         <Input
//                                             type="date"
//                                             value={data.date}
//                                             onChange={e => {
//                                                 setData("date", e.target.value);
//                                                 validateField("date", e.target.value);
//                                             }}
//                                         />
//                                         <InputError message={clientErrors.date || errors.date} />
//                                     </div>
//                                 </div>

//                                 {/* DETALLE */}
//                                 <div>
//                                     <div className="flex justify-between items-center mb-2">
//                                         <h3 className="text-lg font-medium text-slate-700">
//                                             Productos
//                                         </h3>
//                                         <Button
//                                             type="button"
//                                             onClick={addItem}
//                                             size="sm"
//                                             className="bg-green-500 text-white"
//                                         >
//                                             <Plus className="w-4 h-4 mr-1" /> Agregar
//                                         </Button>
//                                     </div>

//                                     <div className="space-y-4">
//                                         {data.items.map((item, index) => (
//                                             <div
//                                                 key={index}
//                                                 className="grid grid-cols-4 gap-4 items-end border p-3 rounded-lg"
//                                             >
//                                                 <div>
//                                                     <Label>Producto</Label>
//                                                     <ComboBox
//                                                         options={products}
//                                                         value={item.product_id}
//                                                         onChange={(val) => {
//                                                             const selectedProduct = products.find(p => p.id === val);
//                                                             const updated = [...data.items];
//                                                             updated[index].product_id = val;
//                                                             if (selectedProduct) {
//                                                                 updated[index].unit_price = selectedProduct.sale_price;
//                                                             }
//                                                             setData("items", updated);
//                                                             validateItemField(index, "product_id", val);
//                                                         }}
//                                                         placeholder="Seleccionar producto"
//                                                     />
//                                                     <InputError
//                                                         message={
//                                                             clientErrors[`items.${index}.product_id`] ||
//                                                             errors[`items.${index}.product_id`]
//                                                         }
//                                                     />
//                                                 </div>

//                                                 <div>
//                                                     <Label>Cantidad</Label>
//                                                     <Input
//                                                         type="number"
//                                                         value={item.quantity}
//                                                         onChange={e => {
//                                                             const val = e.target.value;
//                                                             const updated = [...data.items];
//                                                             updated[index].quantity = val;
//                                                             setData("items", updated);
//                                                             validateItemField(index, "quantity", val);
//                                                         }}
//                                                     />
//                                                     <InputError
//                                                         message={
//                                                             clientErrors[`items.${index}.quantity`] ||
//                                                             errors[`items.${index}.quantity`]
//                                                         }
//                                                     />
//                                                 </div>

//                                                 <div>
//                                                     <Label>Precio unitario</Label>
//                                                     <Input
//                                                         type="number"
//                                                         value={item.unit_price}
//                                                         onChange={e => {
//                                                             const val = e.target.value;
//                                                             const updated = [...data.items];
//                                                             updated[index].unit_price = val;
//                                                             setData("items", updated);
//                                                             validateItemField(index, "unit_price", val);
//                                                         }}
//                                                     />
//                                                     <InputError
//                                                         message={
//                                                             clientErrors[`items.${index}.unit_price`] ||
//                                                             errors[`items.${index}.unit_price`]
//                                                         }
//                                                     />
//                                                 </div>

//                                                 <div className="flex items-center gap-2">
//                                                     <div className="text-sm text-gray-700">
//                                                         Subtotal:{" "}
//                                                         {Number(item.quantity || 0) * Number(item.unit_price || 0)}
//                                                     </div>
//                                                     <Button
//                                                         type="button"
//                                                         size="icon"
//                                                         variant="destructive"
//                                                         onClick={() => removeItem(index)}
//                                                     >
//                                                         <Trash className="w-4 h-4" />
//                                                     </Button>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                     <div className="mt-4 text-right text-lg font-semibold text-slate-700">
//                                         Total: {totalVisual.toFixed(2)}
//                                     </div>
//                                 </div>

//                                 <div className="mt-6 text-end">
//                                     <Button
//                                         type="submit"
//                                         size="lg"
//                                         className="bg-blue-500 text-white"
//                                         disabled={processing}
//                                     >
//                                         {processing && (
//                                             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                         )}
//                                         <span>Crear</span>
//                                     </Button>
//                                 </div>
//                             </form>
//                         </CardContent>
//                     </Card>
//                 </div>
//             </div>
//         </AppLayout>
//     );
// }

import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ComboBox } from "@/components/ui/comboBox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { CreateSaleFormData, SaleItem, CreateSaleProps } from "@/types/sale";
import { Head, Link, useForm } from "@inertiajs/react";
import { Loader2, Plus, Trash } from "lucide-react";
import { useState } from "react";
import * as Yup from "yup";
import { ValidationError } from "yup";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Crear Venta",
        href: "/sales/create",
    },
];

const saleSchema = Yup.object().shape({
    customer_id: Yup.number()
        .nullable()
        .typeError("El cliente debe ser válido"),
    date: Yup.string().required("La fecha de venta es obligatoria"),
    status: Yup.mixed<"pendiente" | "pagado" | "cancelado">()
        .oneOf(["pendiente", "pagado", "cancelado"])
        .required("El estado es obligatorio"),
    items: Yup.array()
        .of(
            Yup.object().shape({
                product_id: Yup.number()
                    .typeError("Selecciona un producto")
                    .required("Selecciona un producto"),
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
    payments: Yup.array()
        .of(
            Yup.object().shape({
                method: Yup.mixed<"efectivo" | "qr" | "transferencia" | "otros">()
                    .oneOf(["efectivo", "qr", "transferencia", "otros"])
                    .required("Método de pago obligatorio"),
                amount: Yup.number()
                    .typeError("Debe ser un número")
                    .positive("Debe ser mayor a 0")
                    .required("Monto obligatorio"),
            })
        )
        .min(1, "Agrega al menos un pago"),
});

export default function Create({ customers, products }: CreateSaleProps) {
    const { data, setData, post, processing, errors } = useForm<CreateSaleFormData>({
        customer_id: null,
        date: "",
        status: "pendiente",
        items: [
            {
                product_id: null,
                quantity: "",
                unit_price: "",
            },
        ],
        payments: [
            {
                method: "efectivo",
                amount: "",
            },
        ],
    });

    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const validateField = async (field: keyof CreateSaleFormData, value: unknown) => {
        try {
            await saleSchema.validateAt(field as string, { ...data, [field]: value });
            setClientErrors(prev => ({ ...prev, [field]: "" }));
        } catch (error) {
            if (error instanceof ValidationError) {
                setClientErrors(prev => ({ ...prev, [field]: error.message }));
            }
        }
    };

    const validateItemField = async (index: number, field: keyof SaleItem, value: string | number) => {
        try {
            const items = [...data.items];
            items[index] = { ...items[index], [field]: value };
            await saleSchema.validateAt(`items[${index}].${field}`, { ...data, items });
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

    const validatePaymentField = async (index: number, field: keyof typeof data.payments[0], value: string | number) => {
        try {
            const payments = [...data.payments];
            payments[index] = { ...payments[index], [field]: value };
            await saleSchema.validateAt(`payments[${index}].${field}`, { ...data, payments });
            setClientErrors(prev => ({ ...prev, [`payments.${index}.${field}`]: "" }));
        } catch (error) {
            if (error instanceof ValidationError) {
                setClientErrors(prev => ({
                    ...prev,
                    [`payments.${index}.${field}`]: error.message,
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

    const addPayment = () => {
        setData("payments", [...data.payments, { method: "efectivo", amount: "" }]);
    };

    const removePayment = (index: number) => {
        const updated = data.payments.filter((_, i) => i !== index);
        setData("payments", updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await saleSchema.validate(data, { abortEarly: false });
            post("/sales");
        } catch (error) {
            if (error instanceof ValidationError) {
                const newErrors: Record<string, string> = {};
                error.inner.forEach(err => {
                    if (err.path) {
                        const normalizedPath = err.path.replace(/\[(\d+)\]/g, ".$1");
                        newErrors[normalizedPath] = err.message;
                    }
                });
                setClientErrors(newErrors);
            }
        }
    };

    const totalVisual = data.items.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unit_price) || 0;
        return sum + quantity * unitPrice;
    }, 0);

    const totalPayments = data.payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Venta" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded border p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-5">
                        <div className="text-xl text-slate-600">Crear Venta</div>
                        <Button>
                            <Link href="/sales" prefetch>Volver</Link>
                        </Button>
                    </div>
                    <Card>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* CABECERA */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 md:col-span-1">
                                        <Label>Cliente</Label>
                                        <ComboBox
                                            options={customers}
                                            value={data.customer_id}
                                            onChange={(id) => { setData("customer_id", id); validateField("customer_id", id); }}
                                            placeholder="Seleccionar cliente"
                                        />
                                        <InputError message={clientErrors.customer_id || errors.customer_id} />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <Label>Fecha de venta</Label>
                                        <Input
                                            type="date"
                                            value={data.date}
                                            onChange={e => { setData("date", e.target.value); validateField("date", e.target.value); }}
                                        />
                                        <InputError message={clientErrors.date || errors.date} />
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <Label>Estado</Label>
                                        <select
                                            value={data.status}
                                            onChange={e => setData("status", e.target.value as "pendiente" | "pagado" | "cancelado")}
                                            className="w-full rounded-md border p-2"
                                        >
                                            <option value="pendiente">Pendiente</option>
                                            <option value="pagado">Pagado</option>
                                            <option value="cancelado">Cancelado</option>
                                        </select>
                                        <InputError message={clientErrors.status || errors.status} />
                                    </div>
                                </div>

                                {/* DETALLE PRODUCTOS */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-medium text-slate-700">Productos</h3>
                                        <Button type="button" onClick={addItem} size="sm" className="bg-green-500 text-white">
                                            <Plus className="w-4 h-4 mr-1" /> Agregar
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {data.items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-4 gap-4 items-end border p-3 rounded-lg">
                                                <div>
                                                    <Label>Producto</Label>
                                                    <ComboBox
                                                        options={products}
                                                        value={item.product_id}
                                                        onChange={(val) => {
                                                            const selectedProduct = products.find(p => p.id === val);
                                                            const updated = [...data.items];
                                                            updated[index].product_id = val;
                                                            if (selectedProduct) updated[index].unit_price = selectedProduct.sale_price;
                                                            setData("items", updated);
                                                            validateItemField(index, "product_id", val);
                                                        }}
                                                        placeholder="Seleccionar producto"
                                                    />
                                                    <InputError message={clientErrors[`items.${index}.product_id`] || errors[`items.${index}.product_id`]} />
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
                                                            validateItemField(index, "quantity", val);
                                                        }}
                                                    />
                                                    <InputError message={clientErrors[`items.${index}.quantity`] || errors[`items.${index}.quantity`]} />
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
                                                            validateItemField(index, "unit_price", val);
                                                        }}
                                                    />
                                                    <InputError message={clientErrors[`items.${index}.unit_price`] || errors[`items.${index}.unit_price`]} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm text-gray-700">Subtotal: {Number(item.quantity || 0) * Number(item.unit_price || 0)}</div>
                                                    <Button type="button" size="icon" variant="destructive" onClick={() => removeItem(index)}>
                                                        <Trash className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 text-right text-lg font-semibold text-slate-700">Total: {totalVisual.toFixed(2)}</div>
                                </div>

                                {/* DETALLE PAGOS */}
                                <div className="mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-medium text-slate-700">Pagos</h3>
                                        <Button type="button" onClick={addPayment} size="sm" className="bg-green-500 text-white">
                                            <Plus className="w-4 h-4 mr-1" /> Agregar
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {data.payments.map((payment, index) => (
                                            <div key={index} className="grid grid-cols-3 gap-4 items-end border p-3 rounded-lg">
                                                <div>
                                                    <Label>Método</Label>
                                                    <select
                                                        value={payment.method}
                                                        onChange={e => {
                                                            const val = e.target.value as "efectivo" | "qr" | "transferencia" | "otros";
                                                            const updated = [...data.payments];
                                                            updated[index].method = val;
                                                            setData("payments", updated);
                                                            validatePaymentField(index, "method", val);
                                                        }}
                                                        className="w-full rounded-md border p-2"
                                                    >
                                                        <option value="efectivo">Efectivo</option>
                                                        <option value="qr">QR</option>
                                                        <option value="transferencia">Transferencia</option>
                                                        <option value="otros">Otros</option>
                                                    </select>
                                                    <InputError message={clientErrors[`payments.${index}.method`] || errors[`payments.${index}.method`]} />
                                                </div>
                                                <div>
                                                    <Label>Monto</Label>
                                                    <Input
                                                        type="number"
                                                        value={payment.amount}
                                                        onChange={e => {
                                                            const val = e.target.value;
                                                            const updated = [...data.payments];
                                                            updated[index].amount = val;
                                                            setData("payments", updated);
                                                            validatePaymentField(index, "amount", val);
                                                        }}
                                                    />
                                                    <InputError message={clientErrors[`payments.${index}.amount`] || errors[`payments.${index}.amount`]} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button type="button" size="icon" variant="destructive" onClick={() => removePayment(index)}>
                                                        <Trash className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 text-right text-lg font-semibold text-slate-700">Total Pagos: {totalPayments.toFixed(2)}</div>
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
