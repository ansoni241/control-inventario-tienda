import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import * as Yup from 'yup';
import InputError from "@/components/input-error";

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    userId: number;
    userEmail?: string;
}

const passwordSchema = Yup.object().shape({
    password: Yup.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .required('La contraseña es obligatoria'),
    password_confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
        .required('La confirmación es obligatoria'),
});

export default function EditPasswordModal({ open, setOpen, userId, userEmail }: Props) {
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState<{ password?: string; password_confirmation?: string }>({});
    const validateField = async (field: 'password' | 'password_confirmation', value: string) => {
        try {
            // Construimos el objeto con los nombres correctos
            const obj = {
                password,
                password_confirmation: passwordConfirmation, // aquí usamos la variable real
            };

            // Actualizamos solo el campo que estamos editando
            if (field === 'password') obj.password = value;
            if (field === 'password_confirmation') obj.password_confirmation = value;

            await passwordSchema.validateAt(field, obj);
            setErrors(prev => ({ ...prev, [field]: '' }));
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                setErrors(prev => ({ ...prev, [field]: err.message }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await passwordSchema.validate(
                { password, password_confirmation: passwordConfirmation },
                { abortEarly: false }
            );

            router.put(`/users/${userId}/password`,
                { password, password_confirmation: passwordConfirmation },
                {
                    onSuccess: () => {
                        setPassword('');
                        setPasswordConfirmation('');
                        setOpen(false);
                    },
                    onError: (errs) => {
                        Object.values(errs).forEach(err => toast.error(err as string));
                    },
                }
            );
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const newErrors: typeof errors = {};
                err.inner.forEach(error => {
                    if (error.path) newErrors[error.path as keyof typeof newErrors] = error.message;
                });
                setErrors(newErrors);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar password</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Llene los campos a continuación para actualizar la contraseña del usuario.
                </DialogDescription>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        <span className="text-red-500">Usuario:</span> <strong> {userEmail} </strong>
                    </p>
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Nueva contraseña"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            validateField('password', e.target.value);
                        }}
                        required
                    />
                    <InputError message={errors.password} />
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirmar contraseña"
                        value={passwordConfirmation}
                        onChange={(e) => {
                            setPasswordConfirmation(e.target.value);
                            validateField('password_confirmation', e.target.value);
                        }}
                        required
                    />
                    <InputError message={errors.password_confirmation} />
                    <label className="flex items-center space-x-2 text-sm">
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        <span>Mostrar contraseña</span>
                    </label>
                    <DialogFooter>
                        <Button type="submit">Guardar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
