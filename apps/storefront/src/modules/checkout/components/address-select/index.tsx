import { Listbox, Transition } from "@headlessui/react"
import { ChevronUpDown } from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { Fragment, useMemo } from "react"

import compareAddresses from "@lib/util/compare-addresses"
import { HttpTypes } from "@medusajs/types"
import Radio from "@modules/common/components/radio"

type AddressSelectProps = {
  addresses: HttpTypes.StoreCustomerAddress[]
  addressInput: HttpTypes.StoreCartAddress | null
  // Which saved address is chosen, when the caller tracks that itself
  // (null = none). Left undefined, it is inferred by comparing `addressInput`
  // with each saved address — fine for a form that holds every address
  // field (checkout), but a form with only some of them never matches, so it
  // would always read "Choose an address" even right after picking one.
  selectedId?: string | null
  onSelect: (
    address: HttpTypes.StoreCartAddress | undefined,
    email?: string
  ) => void
}

const AddressSelect = ({
  addresses,
  addressInput,
  selectedId,
  onSelect,
}: AddressSelectProps) => {
  const handleSelect = (id: string) => {
    const savedAddress = addresses.find((a) => a.id === id)
    if (savedAddress) {
      onSelect(savedAddress as HttpTypes.StoreCartAddress)
    }
  }

  const selectedAddress = useMemo(() => {
    if (selectedId !== undefined) {
      return addresses.find((a) => a.id === selectedId)
    }
    return addresses.find((a) => addressInput && compareAddresses(a, addressInput))
  }, [addresses, addressInput, selectedId])

  return (
    <Listbox onChange={handleSelect} value={selectedAddress?.id ?? ""}>
      <div className="relative">
        <Listbox.Button
          className="relative w-full flex justify-between items-center gap-x-3 px-4 py-4 text-left bg-white cursor-pointer shadow-sm focus:outline-none border border-brand-300 hover:border-brand-500 rounded-rounded focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 text-large-semi"
          data-testid="shipping-address-select"
        >
          {({ open }) => (
            <>
              {/* Once one is chosen, say which: the start of the address and,
                  smaller, where it is — like the address picker on
                  Flipkart/Amazon — so the box no longer reads as if nothing
                  has been picked. */}
              <span className="flex min-w-0 flex-col">
                <span className="block truncate text-gray-900">
                  {selectedAddress
                    ? selectedAddress.address_1
                    : "Choose an address"}
                </span>
                {selectedAddress && (
                  <span className="block truncate text-small-regular font-normal text-ui-fg-subtle">
                    {[selectedAddress.city, selectedAddress.postal_code]
                      .filter(Boolean)
                      .join(" - ")}
                  </span>
                )}
              </span>
              {/* Spelled out, so the control reads as "you can change this"
                  rather than as a pre-filled form field. */}
              <span className="flex shrink-0 items-center gap-x-2 text-brand-600 text-base-semi">
                {selectedAddress ? "Change" : "Select"}
                <ChevronUpDown
                  className={clx("transition-rotate duration-200", {
                    "transform rotate-180": open,
                  })}
                />
              </span>
            </>
          )}
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className="absolute z-20 w-full overflow-auto text-small-regular bg-white border border-top-0 max-h-60 focus:outline-none sm:text-sm"
            data-testid="shipping-address-options"
          >
            {addresses.map((address) => {
              return (
                <Listbox.Option
                  key={address.id}
                  value={address.id}
                  className="cursor-default select-none relative pl-6 pr-10 hover:bg-gray-50 py-4"
                  data-testid="shipping-address-option"
                >
                  <div className="flex gap-x-4 items-start">
                    <Radio
                      checked={selectedAddress?.id === address.id}
                      data-testid="shipping-address-radio"
                    />
                    <div className="flex flex-col">
                      <span className="text-left text-base-semi">
                        {address.first_name} {address.last_name}
                      </span>
                      {address.company && (
                        <span className="text-small-regular text-ui-fg-base">
                          {address.company}
                        </span>
                      )}
                      <div className="flex flex-col text-left text-base-regular mt-2">
                        <span>
                          {address.address_1}
                          {address.address_2 && (
                            <span>, {address.address_2}</span>
                          )}
                        </span>
                        <span>
                          {address.postal_code}, {address.city}
                        </span>
                        <span>
                          {address.province && `${address.province}, `}
                          {address.country_code?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Listbox.Option>
              )
            })}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}

export default AddressSelect
