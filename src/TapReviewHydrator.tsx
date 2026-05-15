import React from "react";
import { TapReviewPage } from "@features/tap-review/presentation/TapReviewPage";
import TapReviewContainer from "@features/tap-review/TapReviewContainer";

const TapReviewPageWithData: React.FC = () => {
  const [whatsappPhone, setWhatsappPhone] = React.useState<string>("");

  React.useEffect(() => {
    const fetchWhatsApp = async () => {
      try {
        const settings = await TapReviewContainer.getInstance()
          .getGetAppSettingsUseCase()
          .execute();
        if (settings?.value) {
          const pairs = settings.value.split(";");
          for (const pair of pairs) {
            const [key, value] = pair.split("=");
            if (key === "whatsappPhone" && value) {
              setWhatsappPhone(value.replaceAll(/[^\d+]/g, ""));
              break;
            }
          }
        }
      } catch {
        // Silently fail
      }
    };
    fetchWhatsApp();
  }, []);

  return <TapReviewPage whatsappPhone={whatsappPhone} />;
};

export default TapReviewPageWithData;
