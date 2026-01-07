import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { UserInfo } from "@/types/user";
import axios from "axios";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: number;
}

export default function UserInfoModal({ open, setOpen, userId }: Props) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError(null);

    axios
      .get(`/users/${userId}`)
      .then(res => {
        setUser(res.data);
      })
      .catch(() => setError("Error al cargar datos del usuario"))
      .finally(() => setLoading(false));
  }, [open, userId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Información del usuario</DialogTitle>
          <DialogDescription>Detalle completo (solo lectura)</DialogDescription>
        </DialogHeader>

        {loading && <p className="text-center py-6 text-gray-500">Cargando datos…</p>}
        {error && <p className="text-center py-6 text-red-600 font-semibold">{error}</p>}

        {user && (
          <div className="bg-white dark:bg-black shadow-md rounded-lg p-6 space-y-4 text-gray-700 dark:text-gray-200">
            <div className="flex items-center space-x-6">
              {user.image ? (
                <img
                  src={`/storage/${user.image}`}
                  alt={user.name}
                  className="h-32 w-32 rounded-lg object-cover border border-gray-200 shadow-sm"
                />
              ) : (
                <div className="h-32 w-32 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                  Sin imagen
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className={`inline-block mt-1 px-2 py-1 text-xs rounded ${user.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {user.status ? "Activo" : "Inactivo"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <p><span role="img" aria-label="phone">📱</span> <b>Celular:</b> {user.phone ?? "No registrado"}</p>
              <p><span role="img" aria-label="address">🏠</span> <b>Dirección:</b> {user.address ?? "No registrada"}</p>
              <p><span role="img" aria-label="city">🏙️</span> <b>Ciudad:</b> {user.city ?? "No registrada"}</p>
              <p className="sm:col-span-2"><span role="img" aria-label="roles">🔑</span> <b>Rol:</b> {user.roles?.map(r => r.name).join(", ") || "Sin roles"}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
