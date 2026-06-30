const fs = require('fs');

function fix(file, from, to) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    content = content.split(from).join(to);
    fs.writeFileSync(file, content);
}

// 1. Footer.tsx
fix('src/components/layout/Footer.tsx', 'Rivera 517', 'Rivera 617');
fix('src/components/layout/Footer.tsx', 'href="#"', 'href="https://instagram.com/opticaroma.laspiedras"'); // Placeholder

// 2. ContactSection.tsx
const cs = 'src/components/home/ContactSection.tsx';
fix(cs, 'Rivera 517', 'Rivera 617');
fix(cs, 'bg-[#030712]', 'bg-white');

// 3. CoverageSection.tsx
const cov = 'src/components/home/CoverageSection.tsx';
fix(cov, 'text-white mb-4', 'text-slate-900 mb-4');
fix(cov, 'text-white bg-slate-50', 'text-blue-700 bg-slate-50 hover:bg-blue-50');
fix(cov, 'hover:text-white', 'hover:text-blue-700 hover:bg-blue-50 hover:shadow-md');
fix(cov, 'border-blue-900/20', 'border-slate-100');
fix(cov, 'text-white bg-blue-700', 'text-white bg-blue-600'); // Actually keep shield text white, it's inside a blue box

// 4. AboutSection.tsx
const about = 'src/components/home/AboutSection.tsx';
fix(about, 'expositor-armazoens2.png', 'armazones-natalia-oreiro.jpeg');

// 5. CheckupSection.tsx
const check = 'src/components/home/CheckupSection.tsx';
fix(check, 'bg-gradient-to-r from-[#050a14] via-[#050a14]/85 to-[#050a14]/70', 'bg-gradient-to-r from-slate-50/90 via-slate-50/70 to-transparent');
fix(check, 'text-white', 'text-slate-900'); // Check if there's any text-white

// 6. TestimonialsSection.tsx
const testi = 'src/components/home/TestimonialsSection.tsx';
fix(testi, 'bg-[#0d1a2e]', 'bg-white');
fix(testi, 'border-blue-900/30', 'border-slate-200');
fix(testi, 'from-[#0a1224]', 'from-white');
fix(testi, 'hover:bg-[#11233e]', 'hover:bg-slate-50');

let tContent = fs.readFileSync(testi, 'utf8');
tContent = tContent.replace('María Fernández', 'Ana Silva');
tContent = tContent.replace('Excelente atención. Fui por unos multifocales y me asesoraron bárbaro. Tienen mucha variedad de armazones y los precios son muy accesibles. ¡Super recomendables!', 'Excelente atención y muy buenos precios. Llevé a mi hijo y nos trataron bárbaro. Tienen mucha variedad de armazones.');

tContent = tContent.replace('Carlos Rodríguez', 'Martín Castro');
tContent = tContent.replace('Hace años que me atiendo en Óptica Roma de Las Piedras. La calidad de los cristales y la garantía que te dan no la encontrás en otro lado. Mi familia entera compra acá.', 'Fui por primera vez a la sucursal de Las Piedras y quedé encantado. Te asesoran muy bien con los cristales.');

tContent = tContent.replace('Laura Gómez', 'Lucía Pérez');
tContent = tContent.replace('Fui con receta de mi mutualista y me resolvieron todo rapidísimo. El trato es muy humano y te explican todo con mucha paciencia. 10 puntos.', 'La mejor óptica de Canelones, sin dudas. Rápido, buena calidad y los anteojos me quedaron perfectos.');

tContent = tContent.replace('Jorge Martínez', 'Diego Fernández');
tContent = tContent.replace('Llevé a mi hijo a hacerse sus primeros lentes. La atención que tuvieron con él fue increíble, lo ayudaron a elegir un armazón resistente y moderno. Muy conformes.', 'Muy buena disposición para solucionar problemas. Se me rompió una patilla y en el taller me lo arreglaron enseguida.');

tContent = tContent.replace('Andrea Silva', 'Carmen Rodríguez');
tContent = tContent.replace('Fui por la promo complex y superó mis expectativas. Mis lentes quedaron divinos y veo perfecto. El taller propio es un gran plus.', 'Hace años que somos clientes. Siempre compramos nuestros multifocales acá y la calidad de Varilux es excelente.');

fs.writeFileSync(testi, tContent);

// 7. ServicesSection.tsx
const serv = 'src/components/home/ServicesSection.tsx';
fix(serv, 'text-white mb-3', 'text-slate-900 mb-3');
fix(serv, 'text-blue-200', 'text-slate-500');
fix(serv, 'text-slate-300', 'text-slate-500');

console.log('Fixed files');
