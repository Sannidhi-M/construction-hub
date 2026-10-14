"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import PhoneLogin from "@modules/account/components/phone-login"
import { Button, Text } from "@modules/common/components/ui"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const router = useRouter()
  const [notFoundPhone, setNotFoundPhone] = useState<string | null>(null)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Welcome back</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Sign in to access an enhanced shopping experience.
      </p>
      {notFoundPhone ? (
        <div className="w-full text-center" data-testid="phone-not-found">
          <Text className="text-base-regular text-ui-fg-base mb-4">
            We couldn&apos;t find an account for {notFoundPhone}.
          </Text>
          <Button
            onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
            className="w-full"
            data-testid="go-to-create-account-button"
          >
            Create an account
          </Button>
        </div>
      ) : (
        <PhoneLogin
          onVerified={() => router.refresh()}
          onNewPhone={({ phone }) => setNotFoundPhone(phone)}
          requireExistingAccount
          onPhoneNotFound={(phone) => setNotFoundPhone(phone)}
        />
      )}
      {!notFoundPhone && (
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          Not a member?{" "}
          <button
            onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
            className="underline"
            data-testid="register-button"
          >
            Create account
          </button>
          .
        </span>
      )}
    </div>
  )
}

export default Login
