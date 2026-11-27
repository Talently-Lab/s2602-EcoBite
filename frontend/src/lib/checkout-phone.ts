type PhoneCountry = {
  value: string;
  label: string;
  digits?: number;
  pattern?: string;
  hint?: string;
};

// Longitudes móviles sin código de país; incluyen área y prefijos internacionales móviles cuando corresponden.
export const PHONE_CODES: PhoneCountry[] = [
  { value: "+54", label: "Argentina (+54)", digits: 11, pattern: "9[0-9]{10}", hint: "Incluí el 9, el código de área y el número, sin 0 ni 15." },
  { value: "+51", label: "Perú (+51)", digits: 9, pattern: "9[0-9]{8}", hint: "Debe comenzar con 9." },
  { value: "+56", label: "Chile (+56)", digits: 9 },
  { value: "+57", label: "Colombia (+57)", digits: 10, pattern: "3[0-9]{9}", hint: "Debe comenzar con 3." },
  { value: "+593", label: "Ecuador (+593)", digits: 9, pattern: "9[0-9]{8}", hint: "Debe comenzar con 9, sin el 0 inicial." },
  { value: "+591", label: "Bolivia (+591)", digits: 8, pattern: "(?:5[367][0-9]{6}|[67][0-9]{7})" },
  { value: "+598", label: "Uruguay (+598)", digits: 8, pattern: "9[1-9][0-9]{6}", hint: "Debe comenzar con 9, sin el 0 inicial." },
  { value: "+595", label: "Paraguay (+595)", digits: 9, pattern: "9[0-9]{8}", hint: "Debe comenzar con 9, sin el 0 inicial." },
  { value: "+55", label: "Brasil (+55)", digits: 11, pattern: "[1-9][0-9]9[0-9]{8}", hint: "Incluí los 2 dígitos del DDD y los 9 dígitos del celular." },
  { value: "+58", label: "Venezuela (+58)", digits: 10, pattern: "4[0-9]{9}", hint: "Incluí el código móvil, sin el 0 inicial." },
  { value: "+52", label: "México (+52)", digits: 10 },
  { value: "+1", label: "Estados Unidos / Canadá (+1)", digits: 10, pattern: "[2-9][0-9]{2}[2-9][0-9]{6}", hint: "Incluí el código de área." },
  { value: "+34", label: "España (+34)", digits: 9, pattern: "(?:6[0-9]{8}|7[1-4][0-9]{7})" },
  { value: "other", label: "Otro país" },
];

export function getMobilePhoneRules(code: string) {
  const country = PHONE_CODES.find((item) => item.value === code);
  const maxLength = country?.digits ?? 15 - code.replace(/\D/g, "").length;
  // shortcut: para otros países solo se valida el formato internacional; ampliar la lista para validar su plan móvil.
  const pattern = country?.pattern ?? (country?.digits ? `[1-9][0-9]{${country.digits - 1}}` : `[1-9][0-9]{5,${maxLength - 1}}`);
  const help = country?.digits
    ? `Ingresá ${country.digits} dígitos sin el código de país. ${country.hint ?? ""}`.trim()
    : `Ingresá de 6 a ${maxLength} dígitos sin el código de país.`;
  return { pattern, maxLength, help };
}
