type FormFieldProps = {
  id: string;
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

const FormField = ({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
}: FormFieldProps) => {
  return (
    <div>
      <label htmlFor={id}>{label}</label>

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />

      {error && <p>{error}</p>}
    </div>
  );
};

export default FormField;
