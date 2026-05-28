export default function Empty({ title = 'Nothing here', subtitle, action }) {
  return (
    <div className="py-20 text-center">
      <p className="text-lg font-medium text-graphite">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
