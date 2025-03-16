export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
        <p className="text-gray-600">Sorry, there was a problem authenticating your account.</p>
        <a 
          href="/" 
          className="inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Return to Login
        </a>
      </div>
    </div>
  )
} 