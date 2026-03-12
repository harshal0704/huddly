import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8] py-12 px-4 sm:px-6 lg:px-8">
            <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </div>
    );
}
