import { SolutionConfig } from "./solutions";

/**
 * TPV platform module registry — the open/closed composition seam
 * (design.md D1/D2). Each entry describes one bespoke home-page section.
 *
 * Order is FROZEN (business decision) and doubles as each module's public
 * in-page anchor (`href === "#" + id`) — do not reorder or rename ids
 * without updating downstream SEO/marketing references.
 *
 * Invariant (enforced by tpvModules.test.ts): every entry here MUST have a
 * matching component in `TPV_MODULE_SECTIONS`
 * (`shared/components/tpv/TpvModuleSections.tsx`), and vice versa — never
 * advertise an unbuilt module. In PR4 all 13 section components are
 * placeholders except `tienda-carta-digital`, which reuses the existing
 * CartaDigitalSection sub-tree. PR5-7 replace each placeholder with a real
 * bespoke component (single map-line change), never touching this file's
 * registry entries or App.tsx.
 */
export interface TpvModuleConfig extends SolutionConfig {
  /** 1-based rendering/display order. Frozen — see module list above. */
  order: number;
}

export const TPV_MODULES: TpvModuleConfig[] = [
  {
    id: "tpv-cobro",
    order: 1,
    icon: "CreditCard",
    titleKey: "tpvCobroTitle",
    descKey: "tpvCobroDesc",
    href: "#tpv-cobro",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "TPV y Cobro",
    jsonLd: {
      description:
        "Terminal de punto de venta para hostelería con múltiples métodos de pago, tickets y cierre de caja integrado.",
      serviceType: "Point of Sale System",
      areaServed: ["Tenerife", "Canarias", "España"],
    },
  },
  {
    id: "comandero-movil",
    order: 2,
    icon: "Tablet",
    titleKey: "comanderoMovilTitle",
    descKey: "comanderoMovilDesc",
    href: "#comandero-movil",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "Comandero Móvil",
    jsonLd: {
      description:
        "Toma de comandas desde tablet o móvil, enviadas en tiempo real a cocina o barra.",
      serviceType: "Mobile Order Taking",
      areaServed: ["Tenerife", "Canarias", "España"],
    },
  },
  {
    id: "kds-cocina",
    order: 3,
    icon: "ChefHat",
    titleKey: "kdsCocinaTitle",
    descKey: "kdsCocinaDesc",
    href: "#kds-cocina",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "KDS Cocina",
    jsonLd: {
      description:
        "Pantalla de cocina (KDS) que organiza pedidos por prioridad y tiempo de preparación.",
      serviceType: "Kitchen Display System",
      areaServed: ["Tenerife", "Canarias", "España"],
    },
  },
  {
    id: "gestion-reservas",
    order: 4,
    icon: "CalendarCheck",
    titleKey: "gestionReservasTitle",
    descKey: "gestionReservasDesc",
    href: "#gestion-reservas",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "Gestión de Reservas",
    jsonLd: {
      description:
        "Control de mesas y reservas en tiempo real para evitar overbooking en el local.",
      serviceType: "Reservation Management",
      areaServed: ["Tenerife", "Canarias", "España"],
    },
  },
  {
    id: "fichajes-control-horario",
    order: 5,
    icon: "Clock",
    titleKey: "fichajesTitle",
    descKey: "fichajesDesc",
    href: "#fichajes-control-horario",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "Fichajes y Control Horario",
    jsonLd: {
      description:
        "Registro legal y automático de entradas y salidas del equipo, sin hojas de cálculo.",
      serviceType: "Time & Attendance System",
      areaServed: ["Tenerife", "Canarias", "España"],
    },
  },
  {
    id: "delivery-takeaway",
    order: 6,
    icon: "Bike",
    titleKey: "deliveryTakeawayTitle",
    descKey: "deliveryTakeawayDesc",
    href: "#delivery-takeaway",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "Delivery y Takeaway",
    jsonLd: {
      description:
        "Gestión de pedidos para llevar y a domicilio desde el mismo sistema, sin comisiones por pedido.",
      serviceType: "Delivery Management",
      areaServed: ["Tenerife", "Canarias", "España"],
    },
  },
  {
    id: "stock-inventario",
    order: 7,
    icon: "Package",
    titleKey: "stockInventarioTitle",
    descKey: "stockInventarioDesc",
    href: "#stock-inventario",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "Stock e Inventario",
    jsonLd: {
      description:
        "Control de existencias en tiempo real con avisos antes de agotar producto clave.",
      serviceType: "Inventory Management System",
      areaServed: ["Tenerife", "Canarias", "España"],
    },
  },
  {
    id: "multi-iva-igic",
    order: 8,
    icon: "Scale",
    titleKey: "multiIvaIgicTitle",
    descKey: "multiIvaIgicDesc",
    href: "#multi-iva-igic",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "Multi-IVA / IGIC",
    jsonLd: {
      description:
        "Aplicación automática de IVA, IGIC y otros tipos impositivos según producto y ubicación.",
      serviceType: "Tax Compliance Software",
      areaServed: ["Tenerife", "Canarias", "España"],
    },
  },
  {
    id: "rbac-roles",
    order: 9,
    icon: "Users",
    titleKey: "rbacRolesTitle",
    descKey: "rbacRolesDesc",
    href: "#rbac-roles",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "Roles y Permisos",
    jsonLd: {
      description:
        "Permisos por rol de empleado para proteger caja, informes y configuración sensible.",
      serviceType: "Role-Based Access Control",
      areaServed: ["Tenerife", "Canarias", "España"],
    },
  },
  {
    id: "food-cost-avanzado",
    order: 10,
    icon: "Calculator",
    titleKey: "foodCostAvanzadoTitle",
    descKey: "foodCostAvanzadoDesc",
    href: "#food-cost-avanzado",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "Food Cost Avanzado",
    jsonLd: {
      description:
        "Cálculo del coste real de cada plato para detectar fugas de margen a tiempo.",
      serviceType: "Food Cost Management",
      areaServed: ["Tenerife", "Canarias", "España"],
    },
  },
  {
    id: "sistema-alergenos",
    order: 11,
    icon: "ShieldAlert",
    titleKey: "sistemaAlergenosTitle",
    descKey: "sistemaAlergenosDesc",
    href: "#sistema-alergenos",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "Sistema de Alérgenos",
    jsonLd: {
      description:
        "Información de alérgenos por plato, clara y alineada con la normativa alimentaria.",
      serviceType: "Allergen Management System",
      areaServed: ["Tenerife", "Canarias", "España"],
    },
  },
  {
    id: "compras-sialti",
    order: 12,
    icon: "ClipboardList",
    titleKey: "comprasSialtiTitle",
    descKey: "comprasSialtiDesc",
    href: "#compras-sialti",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "Compras y SIALTI",
    jsonLd: {
      description:
        "Gestión de pedidos a proveedores con trazabilidad alineada al sistema SIALTI de Canarias.",
      serviceType: "Procurement Management",
      areaServed: ["Tenerife", "Canarias", "España"],
    },
  },
  {
    id: "tienda-carta-digital",
    order: 13,
    icon: "Utensils",
    titleKey: "tiendaCartaDigitalTitle",
    descKey: "tiendaCartaDigitalDesc",
    href: "#tienda-carta-digital",
    internal: true,
    iconColor: "text-[var(--color-icon-emerald)]",
    serviceValue: "Tienda / Carta Digital",
    jsonLd: {
      description:
        "Menú digital con pedidos en tiempo real desde la mesa a barra y cocina. Sin comisiones por pedido.",
      serviceType: "Digital Menu Platform",
      areaServed: ["Tenerife", "Gran Canaria", "Lanzarote", "Canarias"],
    },
  },
];
