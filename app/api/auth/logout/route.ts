import { jsonWithClearedAuthCookies } from "@/lib/auth";

export async function POST() {
  return jsonWithClearedAuthCookies({ ok: true });
}
