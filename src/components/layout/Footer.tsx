import { MapPin, Phone, Mail } from 'lucide-react';

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

export default function Footer() {
  const links = {
    catalogo: [
      { name: 'Armazones de Receta', href: '/?categoria=armazones-de-receta#catalogo' },
      { name: 'Lentes de Sol', href: '/?categoria=lentes-de-sol#catalogo' },
      { name: 'Lentes de Contacto', href: '/?categoria=lentes-de-contacto#catalogo' },
      { name: 'Accesorios', href: '/?categoria=accesorios#catalogo' },
    ],
    cristales: [
      { name: 'Materiales', href: '/projects/materiales' },
      { name: 'Multifocales', href: '/projects/multifocales' },
      { name: 'Blue Block', href: '/projects/blue-block' },
      { name: 'Varilux X Series', href: '/projects/varilux-x-series' },
    ],
    servicios: [
      { name: 'Revisión Visual Gratuita', href: '/#chequeo' },
      { name: 'Taller Óptico', href: '/#servicios' },
      { name: 'Coberturas', href: '/#coberturas' },
    ],
  };

  return (
    <footer id="footer" className="bg-slate-900 text-slate-400">
      {/* Top CTA */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
            ¿Listo para ver el mundo con más claridad?
          </h3>
          <p className="text-slate-400 mb-6">
            Agendá tu revisión visual gratuita hoy. Estamos en Las Piedras y Canelones.
          </p>
          <a
            href="https://wa.me/598098871673?text=Hola!%20Quiero%20agendarme%20para%20una%20revisión%20visual%20gratuita."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
          >
            <Phone size={18} />
            Agendá tu cita
          </a>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-extrabold text-white tracking-tight mb-3">ÓPTICA ROMA</h3>
            <p className="text-sm leading-relaxed mb-5">
              Tu visión es nuestra prioridad. Ofrecemos los mejores armazones y cristales con atención personalizada en Las Piedras y Canelones.
            </p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/opticaromalaspiedras/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                <InstagramIcon />
              </a>
              <a href="https://www.facebook.com/RomaLasPiedras" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                <FacebookIcon />
              </a>
            </div>
          </div>

          {/* Catalog links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Catálogo</h4>
            <ul className="space-y-3">
              {links.catalogo.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Crystals & Services */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Cristales & Servicios</h4>
            <ul className="space-y-3">
              {links.cristales.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
              {links.servicios.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-5">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-white font-medium">Las Piedras</p>
                  <p>Rivera 617 (Frente a la plaza)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-white font-medium">Canelones</p>
                  <p>Enrique Rodó 319</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-green-400 flex-shrink-0" />
                <a href="https://wa.me/598098871673" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-green-400 transition-colors">
                  +598 098 871 673
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-blue-400 flex-shrink-0" />
                <span className="text-sm">opticaromalaspiedras@hotmail.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-slate-800 py-8 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <p className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">Medios de Pago Aceptados</p>
          <div className="w-full max-w-4xl relative overflow-hidden flex justify-center">
            <img 
              src="/media/medios-de-pago.png" 
              alt="Medios de pago: Visa, Mastercard, OCA, Lider, Diners Club, Abitab, Redpagos, Mercado Pago"
              className="w-full h-auto object-contain max-h-16"
            />
          </div>
          <div className="text-xs text-slate-400 mt-6 text-center">
            <p>Trabajamos con todas las tarjetas de crédito y débito.</p>
            <p className="mt-1">También puedes pagar con Mercado Pago o solicitar presupuesto con mutualistas.</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Óptica Roma. Todos los derechos reservados.</p>
          <p>Las Piedras & Canelones, Uruguay</p>
        </div>
      </div>
    </footer>
  );
}
