import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type FormFieldProps = {
  id: string;
  label: string;
  type?: string;
  name: string;
  value: string;
  placeholder?: string;
  className?: string;
  onChange: (value: string) => void;
  error?: string;
};

const FormField = ({
  id,
  label,
  type = "text",
  name,
  value,
  placeholder,
  className,
  onChange,
  error,
}: FormFieldProps) => {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-2 ">
        {label}
      </Label>

      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required
        className="border-gray-600"
      />

      {error && <p>{error}</p>}
    </div>
  );
};

export default FormField;
