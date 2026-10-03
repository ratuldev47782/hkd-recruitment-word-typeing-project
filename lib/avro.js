// Simplified Avro Phonetic: type roman letters, get Bangla.
const C = 'kh খ|k ক|gh ঘ|g গ|Ng ঙ|chh ছ|ch চ|c চ|jh ঝ|j জ|Th ঠ|T ট|Dh ঢ|D ড|N ণ|th থ|t ত|dh ধ|d দ|n ন|ph ফ|p প|f ফ|bh ভ|b ব|v ভ|m ম|z য|r র|l ল|Sh ষ|sh শ|S শ|s স|h হ|Rh ঢ়|R ড়|y য়|x ক্স|q ক';
const V = 'oi ঐ ৈ|ou ঔ ৌ|ii ঈ ী|ee ঈ ী|uu ঊ ূ|oo উ ু|rri ঋ ৃ|o অ|a আ া|i ই ি|I ঈ ী|u উ ু|U ঊ ূ|e এ ে|O ও ো|w ও ো';
const O = [['ng', 'ং'], [':', 'ঃ'], ['^', 'ঁ'], ['.', '।'], ...[...'০১২৩৪৫৬৭৮৯'].map((d, i) => [String(i), d])];
const T = [
  ...C.split('|').map((s) => { const [p, b] = s.split(' '); return [p, b, '', 'c']; }),
  ...V.split('|').map((s) => { const [p, b, k] = s.split(' '); return [p, b, k || '', 'v']; }),
  ...O.map(([p, b]) => [p, b, '', 'o']),
].sort((a, b) => b[0].length - a[0].length);

export function avro(s) {
  let o = '', pc = 0, i = 0;
  while (i < s.length) {
    const m = T.find((x) => s.startsWith(x[0], i));
    if (!m) { o += s[i++]; pc = 0; continue; }
    const [p, b, k, ty] = m; i += p.length;
    if (ty === 'c') { o += (pc ? '্' : '') + b; pc = 1; }
    else if (ty === 'v') { o += pc ? k : b; pc = 0; }
    else { o += b; pc = 0; }
  }
  return o;
}
