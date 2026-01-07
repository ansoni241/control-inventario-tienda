import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { router } from "@inertiajs/react";

interface PurchaseDetail {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Purchase {
    id: number;
    supplier_name: string;
    user_name: string;
    date: string;
    invoice_number?: string;
    notes?: string;
    total: number | null;
}

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    purchaseId: number;
}

export default function PurchaseInfoModal({ open, setOpen, purchaseId }: Props) {
    const [purchase, setPurchase] = useState<Purchase | null>(null);
    const [details, setDetails] = useState<PurchaseDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [editRow, setEditRow] = useState<number | null>(null);
    const [tempDetail, setTempDetail] = useState<Partial<PurchaseDetail>>({});
    const [confirmSave, setConfirmSave] = useState(false);

    // Cargar datos de la compra
    useEffect(() => {
        if (!open) return;

        setLoading(true);
        axios.get(`/purchases/${purchaseId}`)
            .then(res => {
                setPurchase(res.data.purchase);
                setDetails(res.data.details);
            })
            .finally(() => setLoading(false));
    }, [open, purchaseId]);

    const handleSave = () => {
        if (!editRow || !tempDetail) return;
        setConfirmSave(true);
    };

    const confirmSaveChanges = () => {
        if (!editRow || !tempDetail) return;

        const payload = {
            quantity: tempDetail.quantity ?? 0,
            unit_price: tempDetail.unit_price ?? 0,
        };

        axios.put(`/purchase-details/${editRow}`, payload)
            .then(res => {
                // Actualizamos solo el detalle que cambió
                setDetails(prev =>
                    prev.map(d =>
                        d.id === editRow ? res.data.detail : d
                    )
                );

                // Actualizamos el total de la compra
                if (purchase) {
                    setPurchase({
                        ...purchase,
                        total: res.data.total,
                    });
                }

                setEditRow(null);
                setTempDetail({});
            })
            .catch(err => {
                console.error('Error al actualizar detalle:', err.response?.data || err.message);
            })
            .finally(() => setConfirmSave(false));
    };

    const handleDelete = (detailId: number) => {
        if (!confirm("¿Estás seguro de eliminar este producto?")) return;

        // Si solo hay un producto, advertimos que se eliminará toda la compra
        if (details.length === 1) {
            if (!confirm("Este es el último producto. Se eliminará la compra completa. ¿Deseas continuar?")) {
                return;
            }
        }

        axios.delete(`/purchase-details/${detailId}`)
            .then((res) => {
                if (details.length === 1) {
                    // Si se eliminó el último, simplemente cerramos el modal
                    setOpen(false);
                    router.reload(); // ✅ recargar por completo el index de compras
                } else {
                    // Quitamos el detalle del estado
                    setDetails(prev => prev.filter(d => d.id !== detailId));

                    // Actualizamos el total usando el valor que devuelve el backend
                    if (purchase) {
                        setPurchase({
                            ...purchase,
                            total: res.data.total ?? 0,
                        });
                    }
                }
            })
            .catch(err => {
                console.error("Error al eliminar detalle:", err.response?.data || err.message);
            });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                {/* <DialogContent className="sm:max-w-[800px]"> */}
                <DialogContent className="w-full max-w-[95vw] sm:max-w-[800px] overflow-x-hidden">
                    <DialogHeader>
                        <DialogTitle>Detalles de la compra</DialogTitle>
                        <DialogDescription>
                            Información completa de la compra y sus productos
                        </DialogDescription>
                    </DialogHeader>

                    {loading && <p className="text-center py-6 text-gray-500">Cargando…</p>}

                    {purchase && (
                        <div className="space-y-6">
                            {/* Encabezado solo lectura */}
                            <div className="bg-gray-50 dark:bg-gray-800 border rounded-lg p-4 shadow-sm dark:text-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 dark:text-white">Compra #{purchase.id}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-white">
                                    <p><b>Proveedor:</b> {purchase.supplier_name}</p>
                                    <p><b>Fecha:</b> {purchase.date}</p>
                                    <p><b>Factura Nº:</b> {purchase.invoice_number || "—"}</p>
                                    <p><b>Creado por:</b> {purchase.user_name}</p>
                                    <p className="col-span-2"><b>Notas:</b> {purchase.notes || "Sin notas"}</p>
                                    <p className="col-span-2 text-right text-lg text-blue-600 font-semibold">
                                        Total: {purchase.total != null ? Number(purchase.total).toFixed(2) : '0.00'} Bs.
                                    </p>
                                </div>
                            </div>

                            {/* Detalles editables */}
                            <div>
                                <h4 className="text-md font-semibold text-gray-800 mb-3 dark:text-white">Productos</h4>
                                <div className="overflow-x-auto w-full">
                                    <table className="min-w-[700px] border text-sm text-gray-700 dark:text-white">
                                        <thead className="bg-gray-100 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Producto</th>
                                                <th className="px-3 py-2 text-center">Cantidad</th>
                                                <th className="px-3 py-2 text-center">Precio unitario</th>
                                                <th className="px-3 py-2 text-center">Subtotal</th>
                                                <th className="px-3 py-2 text-center">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {details.map(detail => (
                                                <tr key={detail.id} className="border-t">
                                                    <td className="px-3 py-2">{detail.product_name}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        {editRow === detail.id ? (
                                                            <Input
                                                                type="number"
                                                                value={tempDetail.quantity ?? detail.quantity}
                                                                onChange={e =>
                                                                    setTempDetail(d => ({
                                                                        ...d,
                                                                        quantity: Number(e.target.value),
                                                                    }))
                                                                }
                                                            />
                                                        ) : detail.quantity != null ? detail.quantity : 0}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {editRow === detail.id ? (
                                                            <Input
                                                                type="number"
                                                                value={tempDetail.unit_price ?? detail.unit_price}
                                                                onChange={e =>
                                                                    setTempDetail(d => ({
                                                                        ...d,
                                                                        unit_price: Number(e.target.value),
                                                                    }))
                                                                }
                                                            />
                                                        ) : detail.unit_price != null
                                                            ? Number(detail.unit_price).toFixed(2)
                                                            : '0.00'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {(editRow === detail.id
                                                            ? (tempDetail.quantity ?? detail.quantity) * (tempDetail.unit_price ?? detail.unit_price)
                                                            : detail.quantity * detail.unit_price
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {editRow === detail.id ? (
                                                            <div className="flex justify-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-500 text-white"
                                                                    onClick={handleSave}
                                                                    title="Guardar cambios"
                                                                >
                                                                    ✅
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setEditRow(null);
                                                                        setTempDetail({});
                                                                    }}
                                                                    title="Cancelar"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex justify-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setEditRow(detail.id);
                                                                        setTempDetail({
                                                                            quantity: detail.quantity,
                                                                            unit_price: detail.unit_price,
                                                                        });
                                                                    }}
                                                                    title="Editar"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleDelete(detail.id)}
                                                                    title="Eliminar"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de confirmación de guardado */}
            <Dialog open={confirmSave} onOpenChange={setConfirmSave}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Confirmar cambios</DialogTitle>
                        <DialogDescription>
                            ¿Seguro que deseas guardar los cambios en este producto?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmSave(false)}>Cancelar</Button>
                        <Button className="bg-blue-500 text-white" onClick={confirmSaveChanges}>Sí, guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
