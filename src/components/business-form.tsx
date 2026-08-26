"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusinessActionState, createBusinessAction, updateBusinessAction } from "@/app/cuenta/negocios/actions";
import { BusinessProfile } from "@/lib/types/domain";
import { getAvatarUrl } from "@/lib/format";

function LogoPicker({ currentUrl }: { currentUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentUrl);

  return (
    <div className="flex items-center gap-4">
      <label
        htmlFor="logo"
        className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted text-xs text-muted-foreground hover:border-primary"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          "+ logo"
        )}
      </label>
      <input
        id="logo"
        name="logo"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setPreview(file ? URL.createObjectURL(file) : currentUrl);
        }}
      />
    </div>
  );
}

export function BusinessForm({ business }: { business?: BusinessProfile }) {
  const action = business ? updateBusinessAction : createBusinessAction;
  const [state, formAction, pending] = useActionState<BusinessActionState, FormData>(action, null);
  const email = (business?.socialLinks as { email?: string } | undefined)?.email ?? "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {business && <input type="hidden" name="businessId" value={business.id} />}

      <div>
        <Label>Logo</Label>
        <LogoPicker currentUrl={getAvatarUrl(business?.logoUrl)} />
      </div>

      <div>
        <Label htmlFor="businessName">Nombre del negocio</Label>
        <Input
          id="businessName"
          name="businessName"
          required
          defaultValue={business?.businessName}
          placeholder="Ej: Textiles Riachuelo"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="businessPhone">WhatsApp del negocio</Label>
          <Input
            id="businessPhone"
            name="businessPhone"
            required
            defaultValue={business?.contactPhone ?? ""}
            placeholder="+54 9 ..."
          />
        </div>
        <div>
          <Label htmlFor="businessEmail">Mail de contacto</Label>
          <Input id="businessEmail" name="businessEmail" type="email" defaultValue={email} placeholder="opcional" />
        </div>
      </div>

      <div>
        <Label htmlFor="businessAddress">Dirección</Label>
        <Input
          id="businessAddress"
          name="businessAddress"
          defaultValue={business?.addressText ?? ""}
          placeholder="opcional"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="hoursText">Horario de atención</Label>
          <Input
            id="hoursText"
            name="hoursText"
            defaultValue={business?.hoursText ?? ""}
            placeholder="Ej: Lun a Vie 9 a 18hs"
          />
        </div>
        <div>
          <Label htmlFor="leadTime">Tiempo de entrega</Label>
          <Input
            id="leadTime"
            name="leadTime"
            defaultValue={business?.leadTime ?? ""}
            placeholder="Ej: 7 a 10 días"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="minProduction">Mínimo de producción</Label>
          <Input
            id="minProduction"
            name="minProduction"
            defaultValue={business?.minProduction ?? ""}
            placeholder="Ej: desde 40 prendas"
          />
        </div>
        <div>
          <Label htmlFor="fabricTypes">Tipos de tela que trabaja</Label>
          <Input
            id="fabricTypes"
            name="fabricTypes"
            defaultValue={business?.fabricTypes ?? ""}
            placeholder="Ej: algodón, gabardina, jersey"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="acceptsOwnPatterns">¿Acepta moldes propios del cliente?</Label>
        <select
          id="acceptsOwnPatterns"
          name="acceptsOwnPatterns"
          defaultValue={business?.acceptsOwnPatterns == null ? "no_especifica" : business.acceptsOwnPatterns ? "si" : "no"}
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        >
          <option value="no_especifica">No especifica</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="acceptsOrders"
          defaultChecked={business?.acceptsOrders ?? true}
          className="h-4 w-4 rounded border-border"
        />
        Estoy tomando pedidos/trabajos nuevos ahora
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isFeatured"
          defaultChecked={business?.isFeatured ?? false}
          className="h-4 w-4 rounded border-border"
        />
        Marcar como mi negocio/marca principal (se muestra con protagonismo en mi perfil)
      </label>

      {state && !state.ok && (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" disabled={pending} size="lg" className="w-fit rounded-full font-semibold">
        {pending ? "Guardando..." : business ? "Guardar cambios" : "Crear negocio"}
      </Button>
    </form>
  );
}
