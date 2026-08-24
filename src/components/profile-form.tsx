"use client";

import { useActionState, useState } from "react";
import { updateProfileAction, ProfileActionState } from "@/app/cuenta/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BusinessProfileData = {
  businessName: string;
  contactPhone: string;
  email: string;
  address: string;
};

export function ProfileForm({
  displayName,
  phone,
  businessProfile,
}: {
  displayName: string;
  phone: string;
  businessProfile: BusinessProfileData | null;
}) {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(
    updateProfileAction,
    null
  );
  const [hasBusiness, setHasBusiness] = useState(Boolean(businessProfile));

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Datos personales
        </h2>
        <div>
          <Label htmlFor="displayName">Nombre y apellido</Label>
          <Input id="displayName" name="displayName" defaultValue={displayName} required />
        </div>
        <div>
          <Label htmlFor="phone">WhatsApp / teléfono</Label>
          <Input id="phone" name="phone" defaultValue={phone} required />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Datos del negocio
        </h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="hasBusiness"
            checked={hasBusiness}
            onChange={(e) => setHasBusiness(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Tengo un negocio (taller, fábrica, proveedor)
        </label>

        {hasBusiness && (
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="businessName">Nombre del negocio</Label>
              <Input
                id="businessName"
                name="businessName"
                defaultValue={businessProfile?.businessName}
                required
                placeholder="Ej: Textiles Riachuelo"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="businessPhone">WhatsApp del negocio</Label>
                <Input
                  id="businessPhone"
                  name="businessPhone"
                  defaultValue={businessProfile?.contactPhone}
                  required
                  placeholder="+54 9 ..."
                />
              </div>
              <div>
                <Label htmlFor="businessEmail">Mail de contacto</Label>
                <Input
                  id="businessEmail"
                  name="businessEmail"
                  type="email"
                  defaultValue={businessProfile?.email}
                  placeholder="opcional"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="businessAddress">Dirección</Label>
              <Input
                id="businessAddress"
                name="businessAddress"
                defaultValue={businessProfile?.address}
                placeholder="opcional"
              />
            </div>
          </div>
        )}
      </section>

      {state && (
        <p
          className={`rounded-xl p-3 text-sm ${
            state.ok ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
          }`}
        >
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} size="lg" className="w-fit rounded-full font-semibold">
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
