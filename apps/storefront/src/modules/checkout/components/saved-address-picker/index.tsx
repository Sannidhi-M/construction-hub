import { MapPin } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import AddressSelect from "../address-select"

/**
 * The "use one of your saved addresses" control, shared by the checkout
 * address form and the Labour booking form.
 *
 * It's a highlighted callout rather than a bare dropdown on purpose: a
 * dropdown that's pre-filled with the default address looks exactly like one
 * more form field, so customers never realised they could pick a different
 * saved address — the tint, icon and larger heading are what say "you can
 * choose here".
 */
const SavedAddressPicker = ({
  heading,
  addresses,
  addressInput,
  selectedId,
  onSelect,
}: {
  heading: string
  addresses: HttpTypes.StoreCustomerAddress[]
  addressInput: HttpTypes.StoreCartAddress | null
  selectedId?: string | null
  onSelect: (
    address: HttpTypes.StoreCartAddress | undefined,
    email?: string
  ) => void
}) => (
  <div
    className="mb-6 flex flex-col gap-y-3 rounded-lg border border-brand-200 bg-brand-50 p-5"
    data-testid="saved-address-picker"
  >
    <div className="flex items-center gap-x-2 text-brand-700">
      <MapPin className="shrink-0" />
      <p className="text-base-semi">{heading}</p>
    </div>
    <AddressSelect
      addresses={addresses}
      addressInput={addressInput}
      selectedId={selectedId}
      onSelect={onSelect}
    />
  </div>
)

export default SavedAddressPicker
