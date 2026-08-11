export interface RbacRolesCopy {
  rbacRolesEyebrow: string;
  rbacRolesTitle: string;
  rbacRolesDesc: string;
  rbacRolesBullet1Title: string;
  rbacRolesBullet1Desc: string;
  rbacRolesBullet2Title: string;
  rbacRolesBullet2Desc: string;
  rbacRolesBullet3Title: string;
  rbacRolesBullet3Desc: string;
  rbacRolesBullet4Title: string;
  rbacRolesBullet4Desc: string;
  rbacRolesCtaLabel: string;
  rbacRolesFigureAlt: string;
}

export const rbacRolesCopy: { es: RbacRolesCopy; en: RbacRolesCopy } = {
  es: {
    rbacRolesEyebrow: "ROLES Y PERMISOS",
    rbacRolesTitle: "Cada empleado ve y hace solo lo que le corresponde",
    rbacRolesDesc:
      "Asigna un rol a cada miembro del equipo — cajero, encargado, cocina — y controla qué puede consultar, cobrar o modificar cada uno, sin dar acceso de más.",
    rbacRolesBullet1Title: "Permisos por rol",
    rbacRolesBullet1Desc:
      "El cajero cobra y cierra tickets; el encargado accede además a informes y configuración.",
    rbacRolesBullet2Title: "Protege las acciones sensibles",
    rbacRolesBullet2Desc:
      "Anulaciones, descuentos y cierres de caja solo los ejecuta quien tiene el rol adecuado.",
    rbacRolesBullet3Title: "Trazabilidad de quién hizo qué",
    rbacRolesBullet3Desc:
      "Cada acción queda asociada al usuario que la realizó, lista para revisar si hace falta.",
    rbacRolesBullet4Title: "Alta y baja de empleados en segundos",
    rbacRolesBullet4Desc:
      "Da o retira acceso al momento cuando entra o se va alguien del equipo.",
    rbacRolesCtaLabel: "Pide una demo de roles y permisos",
    rbacRolesFigureAlt:
      "Empleada de sala con un cuaderno de tareas en un restaurante",
  },
  en: {
    rbacRolesEyebrow: "ROLES & PERMISSIONS",
    rbacRolesTitle: "Every employee sees and does only what they should",
    rbacRolesDesc:
      "Assign a role to each team member — cashier, manager, kitchen — and control what each one can view, charge, or change, without over-granting access.",
    rbacRolesBullet1Title: "Role-based permissions",
    rbacRolesBullet1Desc:
      "Cashiers charge and close tickets; managers also get reports and settings access.",
    rbacRolesBullet2Title: "Protects sensitive actions",
    rbacRolesBullet2Desc:
      "Voids, discounts, and cash-drawer closes only run for the role that's allowed to.",
    rbacRolesBullet3Title: "Accountability for every action",
    rbacRolesBullet3Desc:
      "Every action is tied to the user who performed it, ready to review whenever you need it.",
    rbacRolesBullet4Title: "Onboard or offboard in seconds",
    rbacRolesBullet4Desc:
      "Grant or revoke access instantly when someone joins or leaves the team.",
    rbacRolesCtaLabel: "Request a roles & permissions demo",
    rbacRolesFigureAlt:
      "Front-of-house employee holding a task notebook in a restaurant",
  },
};
