import Link from 'next/link';

const InstagramIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const COLUMNAS = [
  {
    titulo: 'Catálogo',
    links: [
      { nombre: 'Armazones de receta', href: '/catalogo/armazones-de-receta' },
      { nombre: 'Lentes de sol', href: '/catalogo/lentes-de-sol' },
      { nombre: 'Lentes de contacto', href: '/catalogo/lentes-de-contacto' },
      { nombre: 'Accesorios', href: '/catalogo/accesorios' },
    ],
  },
  {
    titulo: 'Cristales',
    links: [
      { nombre: 'Materiales', href: '/projects/materiales' },
      { nombre: 'Multifocales', href: '/projects/multifocales' },
      { nombre: 'Blue Block', href: '/projects/blue-block' },
      { nombre: 'Varilux X Series', href: '/projects/varilux-x-series' },
    ],
  },
  {
    titulo: 'Servicios',
    links: [
      { nombre: 'Test de visión online', href: '/test-de-vision' },
      { nombre: 'Si no tenés receta', href: '/#chequeo' },
      { nombre: 'Taller propio', href: '/#servicios' },
      { nombre: 'Mutualistas y BPS', href: '/#coberturas' },
      { nombre: 'Promociones', href: '/#promociones' },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="footer" className="bg-tinta text-white/70">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 md:pt-20 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="titular text-3xl text-white">Óptica Roma</p>
            <address className="mt-5 space-y-3 text-[15px] not-italic leading-relaxed">
              <p>
                <span className="text-white">Las Piedras</span>
                <br />
                Rivera 617, frente a la plaza · 2364 1800
              </p>
              <p>
                <span className="text-white">Canelones</span>
                <br />
                Enrique Rodó 319 · 4333 9869
              </p>
              <p>
                Lunes a viernes de 9:00 a 18:30
                <br />
                Sábados de 9:00 a 13:00
              </p>
            </address>
            <div className="mt-6 flex gap-3">
              <a
                href="https://www.instagram.com/opticaromalaspiedras/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Óptica Roma"
                className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-white/20 transition hover:bg-white hover:text-tinta"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://www.facebook.com/RomaLasPiedras"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de Óptica Roma"
                className="flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-white/20 transition hover:bg-white hover:text-tinta"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>

          {COLUMNAS.map((columna) => (
            <nav key={columna.titulo} aria-label={columna.titulo} className="lg:col-span-2">
              <p className="text-sm font-semibold text-white">{columna.titulo}</p>
              <ul className="mt-5 space-y-3">
                {columna.links.map((link) => (
                  <li key={link.nombre}>
                    <Link href={link.href} className="text-[15px] transition-colors hover:text-white">
                      {link.nombre}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="lg:col-span-2">
            <p className="text-sm font-semibold text-white">Contacto</p>
            <ul className="mt-5 space-y-3 text-[15px]">
              <li>
                <a href="https://wa.me/598098871673" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  WhatsApp 098 871 673
                </a>
              </li>
              <li>
                <a href="mailto:opticaromalaspiedras@hotmail.com" className="break-all hover:text-white">
                  opticaromalaspiedras@hotmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/60">Tarjetas de crédito y débito, Mercado Pago, Abitab y Redpagos</p>
            {/* La imagen tiene fondo gris claro (#eeeeee): va sobre una franja del mismo color */}
            <div className="mt-3 inline-flex rounded-xl bg-[#eeeeee] px-4 py-2">
              <img
                src="/media/medios-de-pago.png"
                alt="Visa, Mastercard, OCA, Lider, Diners Club, Abitab, Redpagos y Mercado Pago"
                loading="lazy"
                className="h-7 w-auto max-w-full object-contain"
              />
            </div>
          </div>
          <p className="text-sm text-white/50">© {new Date().getFullYear()} Óptica Roma · Las Piedras y Canelones, Uruguay</p>
        </div>
      </div>
    </footer>
  );
}
