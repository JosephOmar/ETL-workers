export function toUnicodeBold(text: string): string {
  const offsetUpper = 0x1d400 - 65; // A-Z
  const offsetLower = 0x1d41a - 97; // a-z
  const offsetNum = 0x1d7ce - 48;   // 0-9

  const combiningAccent = "\u0301";

  const specialMap: Record<string, string> = {
    ñ: "𝗻" + combiningAccent,
    Ñ: "𝗡" + combiningAccent,
  };

  return text
    .normalize("NFD")
    .split("")
    .map((char) => {

      if (specialMap[char]) {
        return specialMap[char];
      }

      const code = char.charCodeAt(0);

      if (code >= 65 && code <= 90) {
        return String.fromCodePoint(code + offsetUpper);
      }

      if (code >= 97 && code <= 122) {
        return String.fromCodePoint(code + offsetLower);
      }

      if (code >= 48 && code <= 57) {
        return String.fromCodePoint(code + offsetNum);
      }

      if (char === combiningAccent) {
        return combiningAccent;
      }

      return char;
    })
    .join("");
}


export const bold = (text: string) => toUnicodeBold(text);