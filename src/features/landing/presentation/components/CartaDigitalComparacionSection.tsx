import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";

const CartaDigitalComparacionSection: React.FC = () => {
  const { t } = useLanguage();

  const rows = [
    {
      label: t.cartaComparRow1Label,
      plataforma: t.cartaComparRow1Plataforma,
      papel: t.cartaComparRow1Papel,
      otras: t.cartaComparRow1Otras,
    },
    {
      label: t.cartaComparRow2Label,
      plataforma: t.cartaComparRow2Plataforma,
      papel: t.cartaComparRow2Papel,
      otras: t.cartaComparRow2Otras,
    },
    {
      label: t.cartaComparRow3Label,
      plataforma: t.cartaComparRow3Plataforma,
      papel: t.cartaComparRow3Papel,
      otras: t.cartaComparRow3Otras,
    },
    {
      label: t.cartaComparRow4Label,
      plataforma: t.cartaComparRow4Plataforma,
      papel: t.cartaComparRow4Papel,
      otras: t.cartaComparRow4Otras,
    },
    {
      label: t.cartaComparRow5Label,
      plataforma: t.cartaComparRow5Plataforma,
      papel: t.cartaComparRow5Papel,
      otras: t.cartaComparRow5Otras,
    },
  ];

  return (
    <section id="comparacion" className="py-16 md:py-24 bg-[var(--color-bg)]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.15] font-display mb-3">
              {t.cartaComparTitle}
            </h2>
            <p className="text-muted text-base">{t.cartaComparSubtitle}</p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-alt)]">
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-muted"
                  >
                    {t.cartaComparHeaderCriterio}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-bold text-[var(--color-primary)]"
                  >
                    {t.cartaComparHeaderPlataforma}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-muted"
                  >
                    {t.cartaComparHeaderPapel}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-muted"
                  >
                    {t.cartaComparHeaderOtras}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={row.label}
                    className={`border-b border-[var(--color-border)] last:border-0 ${idx % 2 === 0 ? "bg-[var(--color-surface)]" : "bg-[var(--color-bg)]"}`}
                  >
                    <th
                      scope="row"
                      className="px-4 py-3 text-left font-semibold text-default"
                    >
                      {row.label}
                    </th>
                    <td className="px-4 py-3 font-bold text-[var(--color-primary)]">
                      {row.plataforma}
                    </td>
                    <td className="px-4 py-3 text-muted">{row.papel}</td>
                    <td className="px-4 py-3 text-muted">{row.otras}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalComparacionSection;
