import { InternshipRegistrationForm } from '@/components/InternshipRegistrationForm'

export default function TestFormPage() {
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <InternshipRegistrationForm 
                userId="test-user"
                userName="João da Silva"
                userEmail="joao@test.com"
            />
        </div>
    )
}
