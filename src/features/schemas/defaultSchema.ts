import { number } from "zod";

export const defaultSchemaMessage = {
  nonempty: "Wajib diisi",
  email: "Format email salah",
  regex: "Format salah",
  choose_one: "Pilih salah satu",
  only: {
    alphabet: "Hanya huruf",
    number: "Hanya angka",
  },
  at_least_one: {
    character: "Minimal 1 karakter",
    alphabet: "Minimal 1 huruf",
    uppercase: "Minimal 1 huruf besar",
    lowercase: "Minimal 1 huruf kecil",
    number: "Minimal 1 angka",
    special_character: "Minimal 1 karakter khusus",
  },
  min(num: number) {
    return { message: `Minimal ${num} karakter` };
  },
  max(num: number) {
    return { message: `Maksimal ${num} karakter` };
  },
  passwordMismatch: "Password tidak sesuai",
};
