/**
 * TpvModulesSection — sorts `TPV_MODULES` by their frozen `order` and mounts
 * each module's looked-up component from `TPV_MODULE_SECTIONS` (design.md
 * D1/D2). This is the seam App.tsx mounts exactly once (PR4); PR5-7 never
 * touch App.tsx again, only replace individual `TPV_MODULE_SECTIONS` map
 * entries with real bespoke components.
 *
 * Each looked-up component owns its own `<section id={module.id}>` wrapper
 * (design.md D4) — this component is a pure sort+map+mount, no wrapping JSX
 * of its own.
 */
import React from "react";
import { TPV_MODULES } from "@shared/config/tpvModules";
import { TPV_MODULE_SECTIONS } from "./TpvModuleSections";

interface TpvModulesSectionProps {
  whatsappPhone?: string;
}

export const TpvModulesSection: React.FC<TpvModulesSectionProps> = ({
  whatsappPhone,
}) => {
  const sortedModules = [...TPV_MODULES].sort((a, b) => a.order - b.order);

  return (
    <>
      {sortedModules.map((module) => {
        const Section = TPV_MODULE_SECTIONS[module.id];
        if (!Section) return null;
        return <Section key={module.id} whatsappPhone={whatsappPhone} />;
      })}
    </>
  );
};
