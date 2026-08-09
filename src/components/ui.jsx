import { useId } from "react";

export function Panel({ eyebrow = "Customise", title, description, children }) {
  return (
    <section className="panel">
      <header className="panel-heading">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </header>

      <div className="panel-body">{children}</div>
    </section>
  );
}

export function SectionTitle({ icon: Icon, title, hint }) {
  return (
    <div className="section-title">
      {Icon && <Icon size={16} aria-hidden />}
      <span>{title}</span>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function Slider({ label, value, min, max, step = 1, suffix = "", onChange, hint }) {
  const id = useId();

  return (
    <div className="slider">
      <label htmlFor={id}>
        <span>{label}</span>
        <strong>
          {Number(value).toFixed(step < 1 ? 1 : 0)}
          {suffix}
        </strong>
      </label>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />

      {hint && <small>{hint}</small>}
    </div>
  );
}

export function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          className={value === option.value ? "active" : ""}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.hint && <small>{option.hint}</small>}
        </button>
      ))}
    </div>
  );
}

export function OptionGrid({ options, value, onChange, columns = 2 }) {
  return (
    <div className="option-grid" style={{ "--columns": columns }}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          className={value === option.id ? "selected" : ""}
          onClick={() => onChange(option.id)}
        >
          <strong>{option.name}</strong>
          {option.description && <small>{option.description}</small>}
        </button>
      ))}
    </div>
  );
}

export function SwatchGrid({ options, value, onChange }) {
  return (
    <div className="swatch-grid">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          className={value === option.id ? "swatch selected" : "swatch"}
          onClick={() => onChange(option)}
          title={option.name}
        >
          <span style={{ background: option.color }} />
          {option.name}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ icon: Icon, label, hint, active, onClick }) {
  return (
    <button
      type="button"
      className={active ? "toggle active" : "toggle"}
      aria-pressed={active}
      onClick={onClick}
    >
      {Icon && <Icon size={17} aria-hidden />}

      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>

      <i aria-hidden />
    </button>
  );
}

export function Stepper({ icon: Icon, label, hint, value, min, max, onChange }) {
  return (
    <div className="stepper">
      <div>
        {Icon && <Icon size={17} aria-hidden />}
        <span>
          {label}
          {hint && <small>{hint}</small>}
        </span>
      </div>

      <div className="stepper-controls">
        <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
          −
        </button>

        <strong>{value}</strong>

        <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
          +
        </button>
      </div>
    </div>
  );
}

export function ColorField({ label, value, onChange }) {
  const id = useId();

  return (
    <div className="color-field">
      <label htmlFor={id}>{label}</label>

      <div>
        <code>{value}</code>
        <input id={id} type="color" value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </div>
  );
}
