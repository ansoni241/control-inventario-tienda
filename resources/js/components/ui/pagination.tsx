import { Link } from '@inertiajs/react';
import { PaginationLink } from '@/types/user';

interface PaginationProps {
    links: PaginationLink[];
}

const Pagination = ({ links }: PaginationProps) => {
    // Obtener el parámetro 'search' de la URL actual
    const searchParam = new URLSearchParams(window.location.search).get('search') || '';

    // Función para agregar el parámetro 'search' a la URL de paginación
    const addSearchToUrl = (url: string) => {
        const urlObj = new URL(url, window.location.origin);
        urlObj.searchParams.set('search', searchParam); // Agregar el parámetro 'search'
        return urlObj.toString();
    };

    return (
        <div className="mt-6 flex items-center justify-center overflow-x-auto">
            <div className="flex gap-2 flex-wrap">
                {/* Enlace de Anterior: solo aparece si hay una página anterior */}
                {links.find((link) => link.label === 'Previous' && link.url) && (
                    <Link
                        href={addSearchToUrl(links.find((link) => link.label === 'Previous' && link.url)?.url || '#')}
                        className="px-4 py-2 border rounded-md text-sm font-medium bg-white text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-300"
                    >
                        Previous
                    </Link>
                )}

                {/* Enlaces de paginación (números de página) */}
                {links.map(
                    (link, index) =>
                        link.label !== 'Previous' && link.label !== 'Next' && (
                            <Link
                                key={index}
                                href={link.url ? addSearchToUrl(link.url) : '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-4 py-2 border rounded-md text-sm font-medium ${
                                    link.active ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
                                } hover:bg-blue-500 hover:text-white transition-all duration-300 ${
                                    !link.url ? 'cursor-not-allowed opacity-50' : ''
                                }`}
                            />
                        )
                )}

                {/* Enlace de Siguiente: solo aparece si hay una página siguiente */}
                {links.find((link) => link.label === 'Next' && link.url) && (
                    <Link
                        href={addSearchToUrl(links.find((link) => link.label === 'Next' && link.url)?.url || '#')}
                        className="px-4 py-2 border rounded-md text-sm font-medium bg-white text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-300"
                    >
                        Next
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Pagination;
