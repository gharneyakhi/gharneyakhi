export function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  dir = 'auto',
  type = 'text',
  textarea = false,
  required = false,
  invalid = false,
}) {
  const input = textarea ? (
    <textarea
      rows={3}
      dir={dir}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  ) : (
    <input
      type={type}
      dir={dir}
      inputMode={type === 'number' ? 'decimal' : undefined}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(event) => onChange(type === 'number' ? Number(event.target.value.replace(/[^\d.]/g, '')) || 0 : event.target.value)}
    />
  );

  return (
    <label className={`field ${invalid ? 'invalid' : ''}`}>
      <span className="field-label">
        {label}
        {required && <i className="field-required">ضروری</i>}
      </span>
      {input}
      {hint && <small className="field-hint">{hint}</small>}
    </label>
  );
}

export function ToggleRow({ title, text, value, onChange }) {
  return (
    <div className="toggle-row">
      <div>
        <strong>{title}</strong>
        {text && <p>{text}</p>}
      </div>
      <button
        type="button"
        className={`toggle ${value ? 'on' : ''}`}
        onClick={() => onChange(!value)}
        aria-pressed={Boolean(value)}
        aria-label={title}
      >
        <span />
      </button>
    </div>
  );
}

export function SectionCard({ icon: Icon, title, hint, children, action }) {
  return (
    <section className="panel settings-card">
      <header className="settings-card-head">
        {Icon && <span className="settings-card-icon"><Icon size={19} /></span>}
        <div>
          <h3>{title}</h3>
          {hint && <p>{hint}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={28} />}
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
