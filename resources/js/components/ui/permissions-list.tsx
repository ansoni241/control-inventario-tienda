import { Permission } from "@/types/rol";
import { useState } from "react";

interface PermissionsListProps {
  permissions: Permission[];
  limit?: number; // cantidad a mostrar antes del "mostrar más"
}

export default function PermissionsList({ permissions, limit = 3 }: PermissionsListProps) {
  const [expanded, setExpanded] = useState(false);

  if (permissions.length === 0) {
    return <span className="text-muted-foreground">Sin permisos</span>;
  }

  const visiblePermissions = expanded ? permissions : permissions.slice(0, limit);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-1">
        {visiblePermissions.map((p) => (
          <span
            key={p.id}
            className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-700"
          >
            {p.name}
          </span>
        ))}
      </div>

      {permissions.length > limit && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-blue-600 hover:underline self-start"
        >
          {expanded ? "Mostrar menos" : `Mostrar más (${permissions.length - limit})`}
        </button>
      )}
    </div>
  );
}
