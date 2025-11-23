import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * GenericForm
 * props:
 *  - fields: [{ name, label, type, placeholder, required, validate, options }]
 *  - initialValues: { [name]: value }
 *  - onSubmit: async (values) => {}
 *  - submitLabel: string
 *  - className
 *
 * Field types supported: text, email, password, number, textarea, select, checkbox
 */
function GenericForm({
  fields = [],
  initialValues = {},
  onSubmit,
  submitLabel = "Submit",
  className,
}) {
  const [values, setValues] = React.useState(() =>
    fields.reduce(
      (acc, f) => ({
        ...acc,
        [f.name]: initialValues[f.name] ?? (f.type === "checkbox" ? false : ""),
      }),
      {}
    )
  );
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  const validateField = React.useCallback(
    (f, value) => {
      if (
        f.required &&
        (value === "" ||
          value === null ||
          value === undefined ||
          (f.type === "checkbox" && value === false))
      ) {
        return `${f.label || f.name} là bắt buộc`;
      }
      if (typeof f.validate === "function") {
        return f.validate(value, values) || null;
      }
      return null;
    },
    [values]
  );

  const handleChange = (name, val) => {
    setValues((s) => ({ ...s, [name]: val }));
    setErrors((s) => ({ ...s, [name]: null }));
  };

  const handleBlur = (f) => {
    const err = validateField(f, values[f.name]);
    setErrors((s) => ({ ...s, [f.name]: err }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const nextErrors = {};
    for (const f of fields) {
      const err = validateField(f, values[f.name]);
      if (err) nextErrors[f.name] = err;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (typeof onSubmit === "function") {
      try {
        setSubmitting(true);
        await onSubmit(values);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-4 bg-white p-6 rounded-md shadow-md", className)}
      noValidate
    >
      {fields.map((f) => (
        <div key={f.name} className="flex flex-col">
          {f.label && (
            <label htmlFor={f.name} className="mb-1 text-sm font-medium">
              {f.label}
              {f.required ? " *" : ""}
            </label>
          )}

          {f.type === "textarea" ? (
            <textarea
              id={f.name}
              value={values[f.name]}
              placeholder={f.placeholder}
              onChange={(e) => handleChange(f.name, e.target.value)}
              onBlur={() => handleBlur(f)}
              className="px-3 py-2 border rounded-md bg-input"
            />
          ) : f.type === "select" ? (
            <select
              id={f.name}
              value={values[f.name]}
              onChange={(e) => handleChange(f.name, e.target.value)}
              onBlur={() => handleBlur(f)}
              className="px-3 py-2 border rounded-md bg-input"
            >
              <option value="">-- Chọn --</option>
              {(f.options || []).map((opt) => (
                <option key={opt.value ?? opt} value={opt.value ?? opt}>
                  {opt.label ?? opt}
                </option>
              ))}
            </select>
          ) : f.type === "checkbox" ? (
            <label className="inline-flex items-center gap-2">
              <input
                id={f.name}
                type="checkbox"
                checked={!!values[f.name]}
                onChange={(e) => handleChange(f.name, e.target.checked)}
                onBlur={() => handleBlur(f)}
                className="form-checkbox"
              />
              <span className="text-sm">{f.placeholder}</span>
            </label>
          ) : (
            <input
              id={f.name}
              type={f.type || "text"}
              value={values[f.name]}
              placeholder={f.placeholder}
              onChange={(e) => handleChange(f.name, e.target.value)}
              onBlur={() => handleBlur(f)}
              className="px-3 py-2 border rounded-md bg-input"
              autoFocus={f.autoFocus}
            />
          )}

          {errors[f.name] && (
            <div className="mt-1 text-xs text-destructive">
              {errors[f.name]}
            </div>
          )}
          {f.hint && !errors[f.name] && (
            <div className="mt-1 text-xs text-muted-foreground">{f.hint}</div>
          )}
        </div>
      ))}

      <div className="pt-2">
        <Button type="submit" disabled={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default GenericForm;
