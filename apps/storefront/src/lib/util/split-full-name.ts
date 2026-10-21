// Medusa's customer model has separate first_name/last_name fields, not a
// single "full name" — split on the first space, everything after it is
// the last name (handles multi-word last names better than splitting on
// the last space).
export const splitFullName = (fullName: string) => {
  const trimmed = fullName.trim()
  const firstSpace = trimmed.indexOf(" ")
  if (firstSpace === -1) {
    return { firstName: trimmed, lastName: "" }
  }
  return {
    firstName: trimmed.slice(0, firstSpace),
    lastName: trimmed.slice(firstSpace + 1).trim(),
  }
}
