import Cookies from "js-cookie";
export const id = Cookies.get("id");
export const adminId = Cookies.get("adminId");
export const username = Cookies.get("username");
export const admin = Cookies.get("admin");
export const API_URL = process.env.NEXT_PUBLIC_API_URL;
