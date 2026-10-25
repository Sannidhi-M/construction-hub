import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import { checkPincodeServiceable } from "@lib/data/delivery-area"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useRef, useState } from "react"
import SavedAddressPicker from "../saved-address-picker"
import CountrySelect from "../country-select"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  // A signed-in customer's default saved address, if any — used below so a
  // returning customer sees their address pre-selected instead of a blank
  // form and an unselected "Choose an address" dropdown.
  const defaultAddress = customer?.addresses.find((a) => a.is_default_shipping)

  const [formData, setFormData] = useState<Record<string, string>>({
    "shipping_address.first_name":
      cart?.shipping_address?.first_name ||
      defaultAddress?.first_name ||
      customer?.first_name ||
      "",
    "shipping_address.last_name":
      cart?.shipping_address?.last_name ||
      defaultAddress?.last_name ||
      customer?.last_name ||
      "",
    "shipping_address.address_1":
      cart?.shipping_address?.address_1 || defaultAddress?.address_1 || "",
    "shipping_address.company":
      cart?.shipping_address?.company || defaultAddress?.company || "",
    "shipping_address.postal_code":
      cart?.shipping_address?.postal_code ||
      defaultAddress?.postal_code ||
      "",
    "shipping_address.city":
      cart?.shipping_address?.city || defaultAddress?.city || "",
    "shipping_address.country_code":
      cart?.shipping_address?.country_code ||
      defaultAddress?.country_code ||
      "",
    "shipping_address.province":
      cart?.shipping_address?.province || defaultAddress?.province || "",
    "shipping_address.phone":
      cart?.shipping_address?.phone ||
      defaultAddress?.phone ||
      customer?.phone ||
      "",
    email: cart?.email || customer?.email || "",
  })

  // Fast, non-blocking feedback for delivery-area coverage. This is purely
  // a UX hint — the authoritative check (and the one that actually blocks
  // checkout) runs server-side in setAddresses when the form is submitted.
  const [pincodeNotice, setPincodeNotice] = useState<string | null>(null)
  const [checkingPincode, setCheckingPincode] = useState(false)

  const handlePincodeBlur = async () => {
    const pincode = formData["shipping_address.postal_code"]?.trim()
    if (!pincode) {
      setPincodeNotice(null)
      return
    }

    setCheckingPincode(true)
    try {
      const serviceable = await checkPincodeServiceable(pincode)
      setPincodeNotice(
        serviceable
          ? null
          : `We don't currently deliver to pincode ${pincode}.`
      )
    } catch {
      // Network/server error checking the pincode — don't block typing or
      // show a false "not deliverable" notice; the submit-time server
      // check still catches an actually undeliverable pincode.
      setPincodeNotice(null)
    } finally {
      setCheckingPincode(false)
    }
  }

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    if (address) {
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))
    }

    if (email) {
      setFormData((prevState: Record<string, string>) => ({
        ...prevState,
        email: email,
      }))
    }
  }

  useEffect(() => {
    // `cart.shipping_address` can exist as a blank stub (every field "") —
    // e.g. created automatically when the cart's region/country is set,
    // before the customer has ever filled in a real address. Syncing from
    // it unconditionally would wipe out the customer/default-address
    // prefill below with blanks — only sync when it actually has content.
    if (cart && cart.shipping_address?.address_1) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart]) // Add cart as a dependency

  // `customer` can arrive after this component's first render (e.g. the
  // shopper signs in without navigating away, so this component isn't
  // remounted and useState's initial value — computed back when `customer`
  // was still null — never gets revisited). Apply the same prefill here
  // once customer data shows up, same as the cart-driven effect above.
  const appliedCustomerPrefillRef = useRef(false)
  useEffect(() => {
    if (
      appliedCustomerPrefillRef.current ||
      !customer ||
      cart?.shipping_address?.address_1
    ) {
      return
    }
    appliedCustomerPrefillRef.current = true

    if (defaultAddress) {
      setFormAddress(defaultAddress as HttpTypes.StoreCartAddress)
    } else {
      setFormData((prevState) => ({
        ...prevState,
        "shipping_address.first_name":
          prevState["shipping_address.first_name"] || customer.first_name || "",
        "shipping_address.last_name":
          prevState["shipping_address.last_name"] || customer.last_name || "",
        "shipping_address.phone":
          prevState["shipping_address.phone"] || customer.phone || "",
      }))
    }

    if (!cart?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [customer, cart?.shipping_address?.address_1, defaultAddress])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <SavedAddressPicker
          heading={`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          addresses={customer.addresses}
          addressInput={
            mapKeys(formData, (_, key) =>
              key.replace("shipping_address.", "")
            ) as unknown as HttpTypes.StoreCartAddress
          }
          onSelect={setFormAddress}
        />
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          label="Last name"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-last-name-input"
        />
        <Input
          label="Address"
          name="shipping_address.address_1"
          autoComplete="address-line1"
          value={formData["shipping_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="shipping-address-input"
        />
        <Input
          label="Landmark"
          name="shipping_address.company"
          value={formData["shipping_address.company"]}
          onChange={handleChange}
          autoComplete="off"
          data-testid="shipping-landmark-input"
        />
        <div>
          <Input
            label="Postal code"
            name="shipping_address.postal_code"
            autoComplete="postal-code"
            value={formData["shipping_address.postal_code"]}
            onChange={handleChange}
            onBlur={handlePincodeBlur}
            required
            data-testid="shipping-postal-code-input"
          />
          {checkingPincode && (
            <Text
              className="text-ui-fg-subtle txt-small mt-1"
              data-testid="pincode-checking-message"
            >
              Checking delivery availability...
            </Text>
          )}
          {!checkingPincode && pincodeNotice && (
            <Text
              className="text-rose-500 txt-small mt-1"
              data-testid="pincode-not-serviceable-message"
            >
              {pincodeNotice}
            </Text>
          )}
        </div>
        <Input
          label="City"
          name="shipping_address.city"
          autoComplete="address-level2"
          value={formData["shipping_address.city"]}
          onChange={handleChange}
          required
          data-testid="shipping-city-input"
        />
        <CountrySelect
          name="shipping_address.country_code"
          autoComplete="country"
          region={cart?.region}
          value={formData["shipping_address.country_code"]}
          onChange={handleChange}
          required
          data-testid="shipping-country-select"
        />
        <Input
          label="State / Province"
          name="shipping_address.province"
          autoComplete="address-level1"
          value={formData["shipping_address.province"]}
          onChange={handleChange}
          data-testid="shipping-province-input"
        />
      </div>
      <div className="my-8">
        <Checkbox
          label="Billing address same as shipping address"
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          label="Email"
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          data-testid="shipping-email-input"
        />
        <Input
          label="Phone"
          name="shipping_address.phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          value={formData["shipping_address.phone"]}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10)
            handleChange(e)
          }}
          data-testid="shipping-phone-input"
        />
      </div>
    </>
  )
}

export default ShippingAddress
