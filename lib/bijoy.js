// Bijoy (Unicode) keyboard layout. State: { t: text, p: pending pre-base vowel, a: armed }
const M = {
  q:'ঙ',w:'য',e:'ড',r:'প',t:'ট',y:'চ',u:'জ',i:'হ',o:'গ',p:'ড়',
  Q:'ং',W:'য়',E:'ঢ',R:'ফ',T:'ঠ',Y:'ছ',U:'ঝ',I:'ঈ',O:'ঘ',P:'ঢ়',
  a:'ৃ',s:'ু',d:'ি',f:'া',g:'্',h:'ব',j:'ক',k:'ত',l:'দ',
  A:'র্',S:'ূ',D:'ী',F:'অ',G:'।',H:'ভ',J:'খ',K:'থ',L:'ধ',
  z:'্র',x:'ও',c:'ে',v:'র',b:'ন',n:'স',m:'ম',
  Z:'্য',X:'ঔ',C:'ৈ',V:'ল',B:'ণ',N:'ষ',M:'শ',
  ...Object.fromEntries([...'০১২৩৪৫৬৭৮৯'].map((d, i) => [String(i), d])),
};
const isCons = (c) => !!c && /[\u0995-\u09B9\u09DC-\u09DF]/.test(c);

export function bijoy(s, k) {
  let { t, p, a } = s;
  if (k === 'Backspace') {
    if (a) { t += p; p = ''; a = 0; }
    return p ? { t, p: '', a } : { t: t.slice(0, -1), p, a };
  }
  const c = M[k];
  if (a && !(c && c[0] === '্')) { t += p; p = ''; a = 0; }
  if (c && 'িেৈ'.includes(c) && !p) return { t, p: c, a: 0 };
  if (p && !a && isCons(c)) return { t: t + c, p, a: 1 };
  if (p && !a) { t += p; p = ''; }
  return { t: t + (c ?? k), p, a };
}
