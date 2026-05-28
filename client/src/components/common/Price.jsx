export default function Price({ value, className = '' }) {
  return <span className={className}>€{Number(value).toFixed(2)}</span>;
}
