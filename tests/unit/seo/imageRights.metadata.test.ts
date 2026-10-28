import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ImageRightsSchema,
  ORGANIZATION_ID,
} from "@shared/presentation/components/SeoSchema";

/**
 * F-07 follow-up (2026-10-28): every owner-verified NFC image carries
 * IPTC/XMP rights metadata (creator, credit, copyright, licence page),
 * written with exiftool so pixels are not re-encoded, and the NFC page
 * declares them as ImageObject with creator/licence for Google Images.
 */
const ROOT = path.resolve(__dirname, "../../..");
const NFC = path.join(ROOT, "public/assets/nfc");
const LICENSE_URL = "https://digitalizatenerife.es/legal/aviso";

const OWN_NFC_IMAGES = [
  "tarjeta_nfc.webp",
  "tarjeta_nfc_google.webp",
  "nfc-exhibidor-blanco-1.avif",
  "nfc-exhibidor-blanco-2.avif",
  "nfc-exhibidor-negro.avif",
  "nfc-stand-exhibidor.avif",
  "nfc-exhibidor-blanco-1-128w.webp",
  "nfc-exhibidor-blanco-2-128w.webp",
  "nfc-exhibidor-negro-128w.webp",
  "nfc-stand-exhibidor-128w.webp",
  "place_device.jpg",
  "review.webp",
];

describe("own NFC images carry rights metadata (XMP)", () => {
  it.each(OWN_NFC_IMAGES)("%s has creator, copyright and licence URL", async (name) => {
    const { xmp } = await sharp(fs.readFileSync(path.join(NFC, name))).metadata();
    const text = xmp?.toString("utf-8") ?? "";
    expect(text).toMatch(/Digitaliza Tenerife/);
    expect(text).toMatch(/© 2026 Digitaliza Tenerife/);
    expect(text).toContain(LICENSE_URL);
  });
});

describe("ImageRightsSchema", () => {
  const html = renderToStaticMarkup(
    createElement(ImageRightsSchema, {
      images: ["/assets/nfc/tarjeta_nfc.webp", "/assets/nfc/review.webp"],
    }),
  );
  const json = JSON.parse(
    html.match(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/)![1],
  ) as { "@graph": Record<string, unknown>[] };

  it("emits one ImageObject per image with absolute contentUrl", () => {
    expect(json["@graph"].map((n) => n.contentUrl)).toEqual([
      "https://digitalizatenerife.es/assets/nfc/tarjeta_nfc.webp",
      "https://digitalizatenerife.es/assets/nfc/review.webp",
    ]);
    json["@graph"].forEach((n) => expect(n["@type"]).toBe("ImageObject"));
  });

  it("credits the organisation by @id and links the licence page", () => {
    for (const node of json["@graph"]) {
      expect(node.creator).toEqual({ "@id": ORGANIZATION_ID });
      expect(node.copyrightHolder).toEqual({ "@id": ORGANIZATION_ID });
      expect(node.creditText).toBe("Digitaliza Tenerife");
      expect(node.copyrightNotice).toBe("© 2026 Digitaliza Tenerife");
      expect(node.license).toBe(LICENSE_URL);
    }
  });

  it("NFC page renders it", () => {
    const page = fs.readFileSync(
      path.join(ROOT, "src/features/tap-review/presentation/TapReviewPage.tsx"),
      "utf-8",
    );
    expect(page).toMatch(/<ImageRightsSchema\b/);
  });
});
