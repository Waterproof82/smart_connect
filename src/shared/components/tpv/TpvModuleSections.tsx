/**
 * TPV_MODULE_SECTIONS — component half of the registry/component split
 * (design.md D1). Maps every `TPV_MODULES` id to the React component that
 * renders its home-page section.
 *
 * PR5 status: `tpv-cobro`, `comandero-movil`, `kds-cocina`, and
 * `delivery-takeaway` shipped real bespoke components.
 * PR6 status: `gestion-reservas`, `fichajes-control-horario`,
 * `stock-inventario`, and `multi-iva-igic` shipped real bespoke components.
 * PR7 status (this PR, FINAL batch): `rbac-roles`, `food-cost-avanzado`,
 * `sistema-alergenos`, and `compras-sialti` now also ship real bespoke
 * components. ALL 13 `TPV_MODULES` entries now have real components — zero
 * `createStubModuleSection` usages remain (registry-completion gate, see
 * `tpvModules.test.ts`). `tienda-carta-digital` reuses the existing,
 * fully-built CartaDigitalSection sub-tree (shipped in PR4).
 *
 * Every bespoke component follows design.md D4: `<section id={module.id}
 * aria-labelledby="{id}-title">` is the sole DOM anchor for that module —
 * the id itself is not a prop, it's known at authoring time
 * (closure/constant), matching `TpvModuleSectionProps`
 * (`{ whatsappPhone?: string }` only).
 */
import React from "react";
import CartaDigitalSection from "@features/landing/presentation/components/CartaDigitalSection";
import TpvCobroSection from "./TpvCobroSection";
import ComanderoMovilSection from "./ComanderoMovilSection";
import KdsCocinaSection from "./KdsCocinaSection";
import DeliveryTakeawaySection from "./DeliveryTakeawaySection";
import GestionReservasSection from "./GestionReservasSection";
import FichajesControlHorarioSection from "./FichajesControlHorarioSection";
import StockInventarioSection from "./StockInventarioSection";
import MultiIvaIgicSection from "./MultiIvaIgicSection";
import RbacRolesSection from "./RbacRolesSection";
import FoodCostAvanzadoSection from "./FoodCostAvanzadoSection";
import SistemaAlergenosSection from "./SistemaAlergenosSection";
import ComprasSialtiSection from "./ComprasSialtiSection";

export interface TpvModuleSectionProps {
  /** Pre-fetched, wa.me-ready phone number. Not every module needs it. */
  whatsappPhone?: string;
}

const TiendaCartaDigitalModuleSection: React.FC<TpvModuleSectionProps> = ({
  whatsappPhone,
}) => (
  <CartaDigitalSection
    id="tienda-carta-digital"
    whatsappPhone={whatsappPhone ?? ""}
  />
);

export const TPV_MODULE_SECTIONS: Record<
  string,
  React.FC<TpvModuleSectionProps>
> = {
  "tpv-cobro": TpvCobroSection,
  "comandero-movil": ComanderoMovilSection,
  "kds-cocina": KdsCocinaSection,
  "gestion-reservas": GestionReservasSection,
  "fichajes-control-horario": FichajesControlHorarioSection,
  "delivery-takeaway": DeliveryTakeawaySection,
  "stock-inventario": StockInventarioSection,
  "multi-iva-igic": MultiIvaIgicSection,
  "rbac-roles": RbacRolesSection,
  "food-cost-avanzado": FoodCostAvanzadoSection,
  "sistema-alergenos": SistemaAlergenosSection,
  "compras-sialti": ComprasSialtiSection,
  "tienda-carta-digital": TiendaCartaDigitalModuleSection,
};
