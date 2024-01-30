import SignUp from "@/components/SignUp";

export default function SignUpPage() {
  return (
    <div className="container">
      <div className="display-vertical-center">
        <div className="signup-title mb-2">Sign Up</div>
        <div className="mb-4">Provide the below details to create an account</div>
        <SignUp />
      </div>
    </div>
  )
}
