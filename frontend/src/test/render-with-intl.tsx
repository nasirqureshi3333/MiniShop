import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";

import ar from "../../messages/ar.json";
import en from "../../messages/en.json";

const MESSAGES = { en, ar } as const;

export function renderWithIntl(ui: ReactElement, locale: keyof typeof MESSAGES = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="UTC">
      {ui}
    </NextIntlClientProvider>,
  );
}
