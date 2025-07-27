// src/utils/stringToHex.ts

/**
 * Convert a string to hexadecimal format
 * @param str - The string to convert
 * @returns The hexadecimal representation of the string
 */
export const stringToHex = (str: string): string => {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const hexValue = charCode.toString(16);
    hex += hexValue.padStart(2, '0');
  }
  return hex.toUpperCase();
};

/**
 * Convert a hexadecimal string back to regular string
 * @param hex - The hexadecimal string to convert
 * @returns The regular string
 */
export const hexToString = (hex: string): string => {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const charCode = parseInt(hex.substr(i, 2), 16);
    str += String.fromCharCode(charCode);
  }
  return str;
};