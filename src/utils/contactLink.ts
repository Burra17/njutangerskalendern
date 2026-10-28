import { villageConfig } from '../config/villageConfig';

// Ett mejl med ämne och en mall, så att den som lägger in händelsen får allt som behövs (beslut i #18).
// encodeURIComponent och inte URLSearchParams, eftersom mejlprogram läser + som ett plustecken och inte som ett mellanslag.
export function suggestEventMailto(email: string): string {
  const subject = `Händelse till ${villageConfig.siteName}`;
  const body = ['Vad:', 'När:', 'Var:', 'Arrangör:', ''].join('\r\n');
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
