/**
 * TPV module i18n barrel (design.md D3).
 *
 * `LanguageContext.tsx` is refactored ONCE (PR4) to `interface Translation
 * extends TpvModuleTranslations` + a spread-merge of `tpvModuleEs`/`tpvModuleEn`
 * into its `es`/`en` translation objects. Every future module PR (5-7) only
 * needs to: (1) add one new `src/shared/i18n/modules/{id}.ts` file, (2) add
 * two lines here (import + extend/spread) — LanguageContext.tsx itself is
 * never reopened again.
 */
import { TpvCobroCopy, tpvCobroCopy } from "./tpv-cobro";
import { ComanderoMovilCopy, comanderoMovilCopy } from "./comandero-movil";
import { KdsCocinaCopy, kdsCocinaCopy } from "./kds-cocina";
import { GestionReservasCopy, gestionReservasCopy } from "./gestion-reservas";
import { FichajesCopy, fichajesCopy } from "./fichajes-control-horario";
import {
  DeliveryTakeawayCopy,
  deliveryTakeawayCopy,
} from "./delivery-takeaway";
import {
  StockInventarioCopy,
  stockInventarioCopy,
} from "./stock-inventario";
import { MultiIvaIgicCopy, multiIvaIgicCopy } from "./multi-iva-igic";
import { RbacRolesCopy, rbacRolesCopy } from "./rbac-roles";
import {
  FoodCostAvanzadoCopy,
  foodCostAvanzadoCopy,
} from "./food-cost-avanzado";
import {
  SistemaAlergenosCopy,
  sistemaAlergenosCopy,
} from "./sistema-alergenos";
import { ComprasSialtiCopy, comprasSialtiCopy } from "./compras-sialti";
import {
  TiendaCartaDigitalCopy,
  tiendaCartaDigitalCopy,
} from "./tienda-carta-digital";

export interface TpvModuleTranslations
  extends TpvCobroCopy,
    ComanderoMovilCopy,
    KdsCocinaCopy,
    GestionReservasCopy,
    FichajesCopy,
    DeliveryTakeawayCopy,
    StockInventarioCopy,
    MultiIvaIgicCopy,
    RbacRolesCopy,
    FoodCostAvanzadoCopy,
    SistemaAlergenosCopy,
    ComprasSialtiCopy,
    TiendaCartaDigitalCopy {}

export const tpvModuleEs: TpvModuleTranslations = {
  ...tpvCobroCopy.es,
  ...comanderoMovilCopy.es,
  ...kdsCocinaCopy.es,
  ...gestionReservasCopy.es,
  ...fichajesCopy.es,
  ...deliveryTakeawayCopy.es,
  ...stockInventarioCopy.es,
  ...multiIvaIgicCopy.es,
  ...rbacRolesCopy.es,
  ...foodCostAvanzadoCopy.es,
  ...sistemaAlergenosCopy.es,
  ...comprasSialtiCopy.es,
  ...tiendaCartaDigitalCopy.es,
};

export const tpvModuleEn: TpvModuleTranslations = {
  ...tpvCobroCopy.en,
  ...comanderoMovilCopy.en,
  ...kdsCocinaCopy.en,
  ...gestionReservasCopy.en,
  ...fichajesCopy.en,
  ...deliveryTakeawayCopy.en,
  ...stockInventarioCopy.en,
  ...multiIvaIgicCopy.en,
  ...rbacRolesCopy.en,
  ...foodCostAvanzadoCopy.en,
  ...sistemaAlergenosCopy.en,
  ...comprasSialtiCopy.en,
  ...tiendaCartaDigitalCopy.en,
};
