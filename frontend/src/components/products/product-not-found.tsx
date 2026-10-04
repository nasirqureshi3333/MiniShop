"use client";

import { useTranslations } from "next-intl";

import { buttonClasses } from "@/components/ui/button";
import { BackArrowIcon } from "@/components/ui/icons";
import { StateMessage } from "@/components/ui/state-message";
import { useDocumentTitle } from "@/hooks/use-document-title";

import { BackToProductsLink } from "./back-to-products-link";

export function ProductNotFound() {
  const t = useTranslations();
  useDocumentTitle(`${t("productNotFound.title")} | ${t("metadata.title")}`);

  return (
    <>
      <StateMessage
        title={t("productNotFound.title")}
        description={t("productNotFound.description")}
        action={
          <BackToProductsLink className={buttonClasses()}>
            <BackArrowIcon />
            {t("product.backToProducts")}
          </BackToProductsLink>
        }
      />
    </>
  );
}
