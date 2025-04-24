"use client"

import { useState, type FormEvent, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios, { AxiosError } from "axios"
import { EyeIcon, EyeOffIcon, AlertCircle, Check, RefreshCw } from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

export default function RegisterPage() {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [passwordStrength, setPasswordStrength] = useState<number>(0)
  const [suggestedPassword, setSuggestedPassword] = useState<string>("")
  const router = useRouter()
  const { data: session } = useSession()

  const [hasLowercase, setHasLowercase] = useState<boolean>(false)
  const [hasUppercase, setHasUppercase] = useState<boolean>(false)
  const [hasNumber, setHasNumber] = useState<boolean>(false)
  const [hasSpecial, setHasSpecial] = useState<boolean>(false)
  const [hasMinLength, setHasMinLength] = useState<boolean>(false)

  useEffect(() => {
    if (session?.user?.email) {
      localStorage.setItem("userId", session.user.email)
    }
  }, [session])

  useEffect(() => {
    checkPasswordStrength(password)
  }, [password])

  const checkPasswordStrength = (pass: string) => {
    let score = 0

    const hasLower = /[a-z]/.test(pass)
    setHasLowercase(hasLower)
    if (hasLower) score += 20

    const hasUpper = /[A-Z]/.test(pass)
    setHasUppercase(hasUpper)
    if (hasUpper) score += 20

    const hasNum = /[0-9]/.test(pass)
    setHasNumber(hasNum)
    if (hasNum) score += 20

    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)
    setHasSpecial(hasSpecialChar)
    if (hasSpecialChar) score += 20

    const isLongEnough = pass.length >= 8
    setHasMinLength(isLongEnough)
    if (isLongEnough) score += 20

    setPasswordStrength(score)
  }

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return ""
    if (passwordStrength <= 20) return "Very Weak"
    if (passwordStrength <= 40) return "Weak"
    if (passwordStrength <= 60) return "Medium"
    if (passwordStrength <= 80) return "Strong"
    return "Very Strong"
  }

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200"
    if (passwordStrength <= 20) return "bg-red-500"
    if (passwordStrength <= 40) return "bg-orange-500"
    if (passwordStrength <= 60) return "bg-yellow-500"
    if (passwordStrength <= 80) return "bg-blue-500"
    return "bg-green-500"
  }

  const generateStrongPassword = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const numbers = "0123456789"
    const special = "!@#$%^&*_-+="

    let password = ""

    // Ensure at least one of each character type
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
    password += numbers.charAt(Math.floor(Math.random() * numbers.length))
    password += special.charAt(Math.floor(Math.random() * special.length))

    const allChars = lowercase + uppercase + numbers + special
    for (let i = 0; i < 8; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }

    password = password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("")

    setSuggestedPassword(password)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Password validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (passwordStrength < 60) {
      setError("Please use a stronger password")
      setLoading(false)
      return
    }

    try {
      const response = await axios.post(`${baseUrl}/api/register`, {
        name,
        email,
        password,
        provider: "Credentials",
      })

      
      if (!response) {
        setError("Failed to sign in after registration")
      } else {
        router.push("/register/resend-verification")
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          setError("Email already in use");
        } else {
          setError(err.response?.data?.message || err.message || "Something went wrong");
        }
      } else if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred");
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  const useGeneratedPassword = () => {
    setPassword(suggestedPassword)
    setConfirmPassword(suggestedPassword)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border-t-4 border-purple-600">
        <h1 className="text-2xl font-bold text-center mb-6 text-purple-700">Create an Account</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="mb-2">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          {/* Password strength meter */}
          {password && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Password strength: {getStrengthLabel()}</span>
                <span
                  className={`text-sm ${
                    passwordStrength >= 80
                      ? "text-green-600"
                      : passwordStrength >= 60
                        ? "text-blue-600"
                        : passwordStrength >= 40
                          ? "text-yellow-600"
                          : "text-red-600"
                  }`}
                >
                  {passwordStrength}%
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStrengthColor()} transition-all duration-300`}
                  style={{ width: `${passwordStrength}%` }}
                ></div>
              </div>

              {/* Password requirements checklist */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className={`text-sm flex items-center ${hasLowercase ? "text-green-600" : "text-gray-500"}`}>
                  {hasLowercase ? <Check size={14} className="mr-1" /> : <span className="w-3.5 mr-1">·</span>}
                  Lowercase letter
                </div>
                <div className={`text-sm flex items-center ${hasUppercase ? "text-green-600" : "text-gray-500"}`}>
                  {hasUppercase ? <Check size={14} className="mr-1" /> : <span className="w-3.5 mr-1">·</span>}
                  Uppercase letter
                </div>
                <div className={`text-sm flex items-center ${hasNumber ? "text-green-600" : "text-gray-500"}`}>
                  {hasNumber ? <Check size={14} className="mr-1" /> : <span className="w-3.5 mr-1">·</span>}
                  Number
                </div>
                <div className={`text-sm flex items-center ${hasSpecial ? "text-green-600" : "text-gray-500"}`}>
                  {hasSpecial ? <Check size={14} className="mr-1" /> : <span className="w-3.5 mr-1">·</span>}
                  Special character
                </div>
                <div className={`text-sm flex items-center ${hasMinLength ? "text-green-600" : "text-gray-500"}`}>
                  {hasMinLength ? <Check size={14} className="mr-1" /> : <span className="w-3.5 mr-1">·</span>}
                  8+ characters
                </div>
              </div>
            </div>
          )}

          {/* Password suggestion */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={generateStrongPassword}
                className="text-sm text-purple-600 hover:text-purple-800 flex items-center"
              >
                <RefreshCw size={14} className="mr-1" />
                Generate strong password
              </button>
            </div>

            {suggestedPassword && (
              <div className="mt-2 p-3 bg-purple-50 rounded-md border border-purple-200">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">{suggestedPassword}</span>
                  <button
                    type="button"
                    onClick={useGeneratedPassword}
                    className="text-xs bg-purple-600 text-white py-1 px-2 rounded hover:bg-purple-700"
                  >
                    Use this
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  confirmPassword && password !== confirmPassword ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <div className="text-sm text-red-600 mt-1">Passwords do not match</div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 flex justify-center items-center"
            disabled={loading || password !== confirmPassword || passwordStrength < 60}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-purple-600 hover:underline font-medium">
              Login
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or register with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              Sign up with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
