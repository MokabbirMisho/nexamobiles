export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-100 bg-gray-50">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-graphite">Nexa<span className="text-accent">Mobiles</span></p>
          <p className="mt-2 text-sm text-gray-500">Premium new phones & accessories. Shipped across Germany.</p>
        </div>
        <div className="text-sm text-gray-500">
          <p className="font-medium text-graphite">Brands</p>
          <p className="mt-2">Apple · Samsung · Vivo · Oppo · Realme</p>
        </div>
        <div className="text-sm text-gray-500">
          <p className="font-medium text-graphite">Why NexaMobiles</p>
          <p className="mt-2">Genuine products · Secure payment · Fast checkout</p>
        </div>
      </div>
      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} NexaMobiles. All rights reserved.
      </div>
    </footer>
  );
}
