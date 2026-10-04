import { useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";
import { Link } from "@/i18n/navigation";

export function PageNotFound() {
  const t = useTranslations("notFound");

  return (
    <StateMessage
      title={t("title")}
      description={t("description")}
      action={
        <Link href="/" className={buttonClasses()}>
          {t("goHome")}
        </Link>
      }
    />
  );
}
