import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImagePreviewProps {
    src: string | null; // Ruta de la imagen
    alt?: string;
    size?: number; // Tamaño del thumbnail
    className?: string; // Estilos extra
    imageName?: string; // Nombre de la imagen
}

export default function ImagePreview({
    src,
    alt = "Image",
    size = 40,
    className = "",
    imageName,
}: ImagePreviewProps) {
    const [open, setOpen] = useState(false);

    // Imagen por defecto si no hay src
    const imageUrl = src ? `/storage/${src}` : "/images/default-avatar.webp";

    return (
        <>
            <img
                src={imageUrl}
                alt={alt}
                className={`object-cover rounded ${src ? "cursor-pointer" : "opacity-50"} ${className}`}
                style={{ width: size, height: size }}
                onClick={() => src && setOpen(true)}
            />

            {src && (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Vista previa de imagen</DialogTitle>
                            <DialogDescription>{imageName
                                ? `${imageName}.`
                                : "Estás visualizando la imagen actual."}</DialogDescription>
                        </DialogHeader>
                        <img
                            src={`/storage/${src}`}
                            alt={alt}
                            className="w-full h-auto rounded"
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
