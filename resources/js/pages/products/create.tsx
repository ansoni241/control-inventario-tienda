import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ComboBox } from "@/components/ui/comboBox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { CreateProductFormData } from "@/types/product";
import { Head, Link, useForm } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import * as Yup from "yup";
import { ValidationError } from "yup";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Crear Producto',
        href: '/products/create',
    },
];

const productSchema = Yup.object().shape({
    category_id: Yup.number().nullable().required('La categoría es obligatoria'),
    supplier_id: Yup.number()
        .nullable()
        .typeError('El proveedor debe ser válido'),
    name: Yup.string().required('El nombre es obligatorio'),
    description: Yup.string().nullable(),
    stock: Yup.number().min(0, 'El stock no puede ser negativo').required('El stock es obligatorio'),
    purchase_price: Yup.number().min(0, 'Debe ser mayor o igual a 0').required('El precio de compra es obligatorio'),
    sale_price: Yup.number().min(0, 'Debe ser mayor o igual a 0').required('El precio de venta es obligatorio'),
    status: Yup.mixed<'activo' | 'inactivo'>().oneOf(['activo', 'inactivo']).required('El estado es obligatorio'),
});

interface CreateProductProps {
    categories: { id: number; name: string }[];
    suppliers: { id: number; name: string }[];
}

export default function Create({ categories, suppliers }: CreateProductProps) {
    const { data, setData, post, errors, processing } = useForm<CreateProductFormData>({
        category_id: null,
        supplier_id: null,
        name: '',
        description: '',
        stock: 0,
        purchase_price: 0,
        sale_price: 0,
        status: 'activo',
    });

    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const validateField = async (field: keyof CreateProductFormData, value: unknown) => {
        try {
            await productSchema.validateAt(field as string, { ...data, [field]: value });
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
            await productSchema.validate(data, { abortEarly: false });
            post('/products');
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
            <Head title="Crear Producto" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="rounded border p-6 shadow-xl">
                    <div className='flex items-center justify-between mb-5'>
                        <div className="text-xl text-slate-600">Crear Producto</div>
                        <Button><Link href='/products' prefetch>Volver</Link></Button>
                    </div>
                    <Card>
                        <CardContent>
                            <form onSubmit={handleFormSubmit}>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Categoría */}
                                    <div className="col-span-2 md:col-span-1">
                                        <Label>Categoría</Label>
                                        <ComboBox
                                            options={categories}
                                            value={data.category_id}
                                            onChange={(id) => {
                                                setData('category_id', id);
                                                validateField('category_id', id);
                                            }}
                                            placeholder="Seleccionar categoría"
                                        />
                                        <InputError message={clientErrors.category_id || errors.category_id} />
                                    </div>

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

                                    {/* Nombre */}
                                    <div className="col-span-2">
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

                                    {/* Descripción */}
                                    <div className="col-span-2">
                                        <Label htmlFor="description">Descriptión</Label>
                                        <Textarea
                                            rows={4}
                                            id="description"
                                            value={data.description ?? ''}
                                            onChange={e => {
                                                setData('description', e.target.value);
                                                validateField('description', e.target.value);
                                            }}
                                        />
                                        <InputError message={clientErrors.description || errors.description} />
                                    </div>

                                    {/* Stock */}
                                    <div className="col-span-2 md:col-span-1">
                                        <Label htmlFor="stock">Stock</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            value={data.stock}
                                            onChange={e => {
                                                setData('stock', Number(e.target.value));
                                                validateField('stock', Number(e.target.value));
                                            }}
                                        />
                                        <InputError message={clientErrors.stock || errors.stock} />
                                    </div>

                                    {/* Precio compra */}
                                    <div className="col-span-2 md:col-span-1">
                                        <Label htmlFor="purchase_price">Precio de Compra</Label>
                                        <Input
                                            id="purchase_price"
                                            type="number"
                                            step="0.01"
                                            value={data.purchase_price}
                                            onChange={e => {
                                                setData('purchase_price', Number(e.target.value));
                                                validateField('purchase_price', Number(e.target.value));
                                            }}
                                        />
                                        <InputError message={clientErrors.purchase_price || errors.purchase_price} />
                                    </div>

                                    {/* Precio venta */}
                                    <div className="col-span-2 md:col-span-1">
                                        <Label htmlFor="sale_price">Precio de Venta</Label>
                                        <Input
                                            id="sale_price"
                                            type="number"
                                            step="0.01"
                                            value={data.sale_price}
                                            onChange={e => {
                                                setData('sale_price', Number(e.target.value));
                                                validateField('sale_price', Number(e.target.value));
                                            }}
                                        />
                                        <InputError message={clientErrors.sale_price || errors.sale_price} />
                                    </div>

                                    {/* Estado */}
                                    <div className="col-span-2 md:col-span-1">
                                        <Label htmlFor="status">Estado</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) => {
                                                setData('status', value as 'activo' | 'inactivo');
                                                validateField('status', value);
                                            }}
                                        >
                                            <SelectTrigger id="status">
                                                <SelectValue placeholder="Seleccionar estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="activo">Activo</SelectItem>
                                                <SelectItem value="inactivo">Inactivo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={clientErrors.status || errors.status} />
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
