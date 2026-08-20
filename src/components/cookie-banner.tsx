import { useEffect, useState } from "react";

type CookieChoice = "accepted" | "refused";

const COOKIE_STORAGE_KEY = "pharmacie-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = localStorage.getItem(COOKIE_STORAGE_KEY);

    if (!choice) {
      setVisible(true);
    }
  }, []);

  function saveChoice(choice: CookieChoice) {
    localStorage.setItem(COOKIE_STORAGE_KEY, choice);
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] border-t border-border bg-background/95 p-4 shadow-2xl backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="font-serif text-base font-semibold text-foreground">
            Gestion des cookies
          </p>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Nous utilisons les éléments nécessaires au bon fonctionnement
            du site. Vous pouvez accepter ou refuser les cookies
            facultatifs.
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => saveChoice("refused")}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Refuser
          </button>

          <button
            type="button"
            onClick={() => saveChoice("accepted")}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
