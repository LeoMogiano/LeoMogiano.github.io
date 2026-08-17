/**
 * El reloj de La Paz en la cabecera. El idioma sale de <html lang>, así que en
 * /ja/ el formato ya es el japonés sin ninguna rama extra.
 */
const el = document.querySelector<HTMLTimeElement>('.clock');

if (el) {
  const locale = document.documentElement.lang || 'es';
  const format = new Intl.DateTimeFormat(locale, {
    timeZone: 'America/La_Paz',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const tick = () => {
    const text = format.format(new Date());
    if (el.textContent !== text) {
      el.textContent = text;
      el.dateTime = text;
    }
  };

  tick();
  // Cada 20 s: el reloj solo muestra minutos y no vale la pena despertar más.
  setInterval(tick, 20_000);
}

export {};
