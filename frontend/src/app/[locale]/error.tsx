"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { StateMessage } from "@/components/ui/state-message";

export default function LocaleError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const t = useTranslations("errorBoundary");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StateMessage
      tone="error"
      title={t("title")}
      description={t("description")}
      action={<Button onClick={retry}>{t("retry")}</Button>}
    />
  );
}
