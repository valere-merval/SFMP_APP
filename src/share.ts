export const formatMatchDateTime = (date: string, time: string): string => {
  const dateTime = new Date(`${date}T${time}:00`);

  const locale = Intl.DateTimeFormat().resolvedOptions().locale;

  const formattedDate = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(dateTime);

  const formattedTime = new Intl.DateTimeFormat(locale, {
    timeStyle: 'short',
  }).format(dateTime);

  return `${formattedDate} · ${formattedTime}`;
};
