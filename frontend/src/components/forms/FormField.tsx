type FormFieldProps = {
  id: string;
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
};

const FormField = ({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
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
      />
    </div>
  );
};

export default FormField;
