import { WHATSAPP_URL } from "@lib/constants"
import WhatsApp from "@modules/common/icons/whatsapp"

/**
 * Floating "chat on WhatsApp" button, bottom right of every main page and of
 * checkout (a shopper stuck on the address or review step is exactly who may
 * want to ask a question). It is
 * a plain link to wa.me with the business number and a prefilled message —
 * no script, so it works as a server component; the grow-on-hover is CSS
 * only. It gives four hops about two seconds after the page loads (once per
 * page load: the layout persists across in-site navigation) to catch the eye;
 * both that and the hover grow are switched off for visitors who prefer
 * reduced motion.
 *
 * z-40 sits BELOW the mobile product bar and the modals/menus (z-50), so
 * those simply cover it rather than fighting it for the corner.
 */
const WhatsAppButton = () => (
  // The hops live on this wrapper, NOT on the link: Tailwind's `duration-*`
  // and `ease-*` utilities (needed on the link for the hover grow) also set
  // `animation-duration` / `animation-timing-function`, which squashed the
  // four hops into 0.2s so they read as one blink.
  <div className="fixed bottom-[calc(var(--bottom-nav-offset)+1.25rem)] right-5 z-40 animate-whatsapp-hop motion-reduce:animate-none">
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className="flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform duration-200 ease-out hover:scale-110 focus-visible:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:focus-visible:scale-100"
      data-testid="whatsapp-button"
    >
      <WhatsApp size={36} />
    </a>
  </div>
)

export default WhatsAppButton
