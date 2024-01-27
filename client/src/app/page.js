import Login from "@/components/Login";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container">
      <div className="display-vertical-center">
        <div className="app-name">
          Chat App
        </div>
        <div className="mb-3">
          <Login />
        </div>
        <div className="mb-3">Or</div>
        <div className="">
          <Link href="/signup">Sign up to create a new account</Link> 
        </div>
      </div>
    </div>
  )
}
