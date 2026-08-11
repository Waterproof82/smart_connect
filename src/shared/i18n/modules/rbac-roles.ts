export interface RbacRolesCopy {
  rbacRolesTitle: string;
  rbacRolesDesc: string;
}

export const rbacRolesCopy: { es: RbacRolesCopy; en: RbacRolesCopy } = {
  es: {
    rbacRolesTitle: "Roles y Permisos",
    rbacRolesDesc:
      "Define qué puede ver y hacer cada empleado según su rol, protegiendo caja, informes y configuración sensible.",
  },
  en: {
    rbacRolesTitle: "Roles & Permissions",
    rbacRolesDesc:
      "Define what each employee can see and do based on their role, protecting cash, reports, and sensitive settings.",
  },
};
