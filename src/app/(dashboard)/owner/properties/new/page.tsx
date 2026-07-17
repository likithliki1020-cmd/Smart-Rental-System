import { PropertyForm } from "@/components/forms/property-form";

export default function NewPropertyPage() {
    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <p className="text-sm font-semibold text-brass-deep">Properties</p>
                <h1 className="font-display text-2xl font-bold text-ink">Add a property</h1>
            </div>
            <PropertyForm />
        </div>
    );
}