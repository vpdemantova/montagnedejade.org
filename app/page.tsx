import { redirect } from "next/navigation"

// A home redireciona para o Atlas — o EntryCard aparece sobre qualquer página na primeira visita
export default function RootPage() {
  redirect("/atlas")
}
