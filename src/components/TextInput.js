export function TextInput({ label, value, onChange, placeholder }) {
  const handleChange = (e) => {
    const value = e.target.value;
    onChange(value);
  };
  return (
    <label className="flex flex-col mb-4">
      {label}
      <input
        value={value}
        onChange={handleChange}
        type="text"
        placeholder={placeholder}
        className="drop-shadow-lg appearance-none border rounded py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline"
      />
    </label>
  );
}
