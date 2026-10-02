import { redirect } from "next/navigation"

// The account dashboard has no overview/landing page of its own — Profile
// Information is the default view once signed in.
export default function AccountDashboard() {
  redirect("/account/profile")
}
