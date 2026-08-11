/**
 * TPV_MODULE_SECTIONS — component half of the registry/component split
 * (design.md D1). Maps every `TPV_MODULES` id to the React component that
 * renders its home-page section.
 *
 * PR4 status: 12 of the 13 entries are minimal placeholder sections built
 * from `createStubModuleSection` — real bespoke content per module lands in
 * PR5-7 (design.md D4), each swapping in a dedicated component behind a
 * single map-line change here. `tienda-carta-digital` is the one exception:
 * it already reuses the existing, fully-built CartaDigitalSection sub-tree,
 * so it ships complete in this PR.
 *
 * Every stub (and every future bespoke component) follows design.md D4:
 * `<section id={module.id} aria-labelledby="{id}-title">` is the sole DOM
 * anchor for that module — the id itself is not a prop, it's known at
 * authoring time (closure/constant), matching `TpvModuleSectionProps`
 * (`{ whatsappPhone?: string }` only).
 */
import React from "react";
import { useLanguage, Translation } from "@shared/context/LanguageContext";
import CartaDigitalSection from "@features/landing/presentation/components/CartaDigitalSection";

export interface TpvModuleSectionProps {
  /** Pre-fetched, wa.me-ready phone number. Not every module needs it. */
  whatsappPhone?: string;
}

/**
 * Builds a minimal placeholder section for a module that doesn't have
 * bespoke content yet. Renders the module's id, i18n title and one-line
 * description — nothing else. PR5-7 replace the map entry pointing here
 * with a real, dedicated `{Id}Section.tsx` component (design.md D4).
 */
function createStubModuleSection(
  id: string,
  titleKey: keyof Translation,
  descKey: keyof Translation,
): React.FC<TpvModuleSectionProps> {
  const StubModuleSection: React.FC<TpvModuleSectionProps> = () => {
    const { t } = useLanguage();
    return (
      <section
        id={id}
        aria-labelledby={`${id}-title`}
        className="py-16 md:py-24 bg-[var(--color-bg)]"
      >
        <div className="container mx-auto px-6 max-w-3xl">
          <h2
            id={`${id}-title`}
            className="text-3xl md:text-4xl font-bold mb-4 text-default"
          >
            {t[titleKey]}
          </h2>
          <p className="text-muted leading-relaxed">{t[descKey]}</p>
        </div>
      </section>
    );
  };
  StubModuleSection.displayName = `StubModuleSection(${id})`;
  return StubModuleSection;
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
  "tpv-cobro": createStubModuleSection(
    "tpv-cobro",
    "tpvCobroTitle",
    "tpvCobroDesc",
  ),
  "comandero-movil": createStubModuleSection(
    "comandero-movil",
    "comanderoMovilTitle",
    "comanderoMovilDesc",
  ),
  "kds-cocina": createStubModuleSection(
    "kds-cocina",
    "kdsCocinaTitle",
    "kdsCocinaDesc",
  ),
  "gestion-reservas": createStubModuleSection(
    "gestion-reservas",
    "gestionReservasTitle",
    "gestionReservasDesc",
  ),
  "fichajes-control-horario": createStubModuleSection(
    "fichajes-control-horario",
    "fichajesTitle",
    "fichajesDesc",
  ),
  "delivery-takeaway": createStubModuleSection(
    "delivery-takeaway",
    "deliveryTakeawayTitle",
    "deliveryTakeawayDesc",
  ),
  "stock-inventario": createStubModuleSection(
    "stock-inventario",
    "stockInventarioTitle",
    "stockInventarioDesc",
  ),
  "multi-iva-igic": createStubModuleSection(
    "multi-iva-igic",
    "multiIvaIgicTitle",
    "multiIvaIgicDesc",
  ),
  "rbac-roles": createStubModuleSection(
    "rbac-roles",
    "rbacRolesTitle",
    "rbacRolesDesc",
  ),
  "food-cost-avanzado": createStubModuleSection(
    "food-cost-avanzado",
    "foodCostAvanzadoTitle",
    "foodCostAvanzadoDesc",
  ),
  "sistema-alergenos": createStubModuleSection(
    "sistema-alergenos",
    "sistemaAlergenosTitle",
    "sistemaAlergenosDesc",
  ),
  "compras-sialti": createStubModuleSection(
    "compras-sialti",
    "comprasSialtiTitle",
    "comprasSialtiDesc",
  ),
  "tienda-carta-digital": TiendaCartaDigitalModuleSection,
};
