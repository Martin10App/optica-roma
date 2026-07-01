'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';
import { Star, ThumbsUp, Share2 } from 'lucide-react';
import Image from 'next/image';

interface Review {
  name: string;
  initial: string;
  color: string;
  opinions: string;
  date: string;
  text: string;
  ownerResponse?: string;
  image?: string;
}

const baseReviews: Review[] = [
  {
    name: 'Rosario Martinez',
    initial: 'R',
    color: 'bg-indigo-500',
    opinions: '1 opinión',
    date: 'Hace 3 meses',
    text: 'Es la mejor óptica! Siempre atienden con la mejor onda y te asesoran muy bien; los recomiendo siempre.',
    ownerResponse: '¡Muchísimas gracias, Rosario! 😊\n\nNos pone muy felices saber que siempre te sentís bien atendida y asesorada 👓✨ Gracias por recomendarnos y por la buena onda de siempre.\n\n¡Es un placer recibirte!'
  },
  {
    name: 'Sofia Albanese',
    initial: 'S',
    color: 'bg-blue-500',
    opinions: '2 opiniones',
    date: 'Hace 3 meses',
    text: 'La compra resulta muy sencilla y la entrega super rápida, en todos los casos me lo han resuelto en el momento y en 20 minutos me voy con mis lentes nuevos. La atención es un 10.',
    ownerResponse: '¡Gracias por tu confianza! 👓✨\n¡Nos alegra haberte ayudado!'
  },
  {
    name: 'Yanira Moreira',
    initial: 'Y',
    color: 'bg-orange-500',
    opinions: '1 opinión · 1 foto',
    date: 'Hace 3 meses',
    text: 'Compré 5 pares de lentes para niña y adulto y son los mejores en la atención y buena calidad, me resolvieron rápido unos cristales y con eso para mí es gran ayuda gracias óptica',
    ownerResponse: '¡Muchas gracias, Yanira! 😊\nNos alegra que tu hija esté viendo bien y disfrutando sus lentes 👓✨\n\n¡Te esperamos cuando quieras!'
  },
  {
    name: 'Elsa Camejo',
    initial: 'E',
    color: 'bg-amber-700',
    opinions: '1 opinión',
    date: 'Hace 3 meses',
    text: 'Hace muchos años me atiendo con el Doctor y me hacen los lentes en la Óptica, son muy responsables , buen trabajo y excelente atención',
    ownerResponse: '¡Elsa, gracias por acompañarnos tantos años! 😊\nValoramos muchísimo tu confianza 👓✨'
  },
  {
    name: 'Maria Noel Arrascaeta',
    initial: 'M',
    color: 'bg-pink-600',
    opinions: 'Local Guide · 49 opiniones · 57 fotos',
    date: 'Hace 3 meses',
    text: 'Me cambio el día a día. Son cómodos y muy livianos los lentes. Espectacular. La atención de la óptica un lujo.'
  },
  {
    name: 'Susana Silva',
    initial: 'S',
    color: 'bg-stone-500',
    opinions: '1 opinión',
    date: 'Hace 3 meses',
    text: 'Muy buena atención, yo me hice un par de aumento y también me gane unos lentes de sol, super feliz 🙌💪',
    ownerResponse: '¡Gracias por tu comentario! 🙌\n\nNos pone muy contentos que estés feliz con tus lentes 👓✨\n¡Y felicitaciones por esos lentes de sol! 😎\n\n¡Te esperamos!'
  },
  {
    name: 'Estrella Acuña',
    initial: 'E',
    color: 'bg-emerald-600',
    opinions: 'Local Guide · 49 opiniones · 27 fotos',
    date: 'Hace 3 meses',
    text: 'Excelente optica. Muy cordiales y atentos. Los precios no me parecieron caros Gracias'
  },
  {
    name: 'Sandra Gutierrez',
    initial: 'S',
    color: 'bg-red-500',
    opinions: '9 opiniones · 5 fotos',
    date: 'Hace 3 meses',
    text: 'Muy buena atención. Y entrega ràpida. Siempre muy conforme. Gracias.',
    ownerResponse: '¡Muchas gracias, Sandra! 😊\nNos alegra muchísimo que sigas confiando en nosotros después de tantos años 👓✨\n\n¡Un placer atenderte siempre!'
  },
  {
    name: 'RODRIGO almada gimenez',
    initial: 'R',
    color: 'bg-blue-700',
    opinions: '2 opiniones',
    date: 'Hace 3 meses',
    text: 'Excelente servicio, atención y variedad a la hora de elegir cualquier tipo de Lentes!'
  },
  {
    name: 'Florencia Amil',
    initial: 'F',
    color: 'bg-fuchsia-600',
    opinions: '1 opinión',
    date: 'Hace 3 meses',
    text: 'Impecable todo, súper bien todo el armazón los cristales y la atención y sobre todo a un buen precio !!!',
    ownerResponse: '¡Muchas gracias por tu reseña, Florencia! 😊\nNos alegra que hayas quedado conforme en todo 👓✨\n\n¡Te esperamos cuando quieras!'
  },
  {
    name: 'Cintia Tejera',
    initial: 'C',
    color: 'bg-orange-600',
    opinions: '2 opiniones',
    date: 'Hace 3 meses',
    text: 'Hace años me hago los lentes alli exelente atencion !!!',
    ownerResponse: '¡Muchas gracias, Cintia! 😊'
  },
  {
    name: 'Daniela Rodriguez',
    initial: 'D',
    color: 'bg-purple-600',
    opinions: '4 opiniones · 8 fotos',
    date: 'Hace 3 meses',
    text: 'Siempre excelente atención y los anteojos ,lo mejor de lo mejor en Las Piedras',
    ownerResponse: '¡Gracias por tus palabras Daniela! 🙌\n\nNos pone muy contentos saber que tu experiencia fue excelente y que nuestros anteojos cumplieron con tus expectativas 👓✨\n\n¡Un placer atenderte siempre!'
  },
  {
    name: 'Karina Perez',
    initial: 'K',
    color: 'bg-teal-600',
    opinions: '2 opiniones',
    date: 'Hace 3 meses',
    text: 'Excelente en Todo... Recomiendo 100%'
  }
];

// Duplicamos el array para lograr el scroll infinito continuo
const reviews = [...baseReviews, ...baseReviews];

export default function TestimonialsSection() {
  useScrollReveal();

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden border-t border-blue-900/10">
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 reveal">
          <div className="section-label mb-5 inline-flex bg-white shadow-sm border border-slate-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping-slow" />
            Lo que dicen de nosotros
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Nuestros clientes <span className="gradient-text">recomiendan</span>
          </h2>
          <p className="mt-4 text-slate-500 text-lg max-w-2xl mx-auto flex items-center justify-center gap-2">
            Más de <span className="font-bold text-slate-900">42 opiniones</span> en Google con 
            <span className="flex items-center text-amber-400 font-bold text-xl"><Star size={20} className="fill-amber-400 mr-1"/> 4.9</span>
          </p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="w-full overflow-hidden reveal relative z-10 py-4">
        {/* Fading Edges */}
        <div className="absolute top-0 left-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-slate-50 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-slate-50 to-transparent z-20 pointer-events-none" />
        
        <div className="flex w-max animate-marquee hover:pause">
          {reviews.map((review, idx) => (
            <div 
              key={idx}
              aria-hidden={idx >= baseReviews.length ? "true" : undefined}
              className="w-[300px] md:w-[350px] bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl transition-shadow duration-300 flex flex-col mx-3 flex-shrink-0"
              style={{ minHeight: '280px' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${review.color} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>
                    {review.initial}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-slate-900 font-semibold text-sm leading-tight">{review.name}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{review.opinions}</p>
                  </div>
                </div>
                {/* Google "G" mock */}
                <div className="w-6 h-6">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" width="24" height="24" />
                </div>
              </div>

              {/* Stars and date */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-500">{review.date}</span>
              </div>

              {/* Text */}
              <p className="text-slate-700 leading-relaxed text-sm mb-4 whitespace-pre-line flex-grow">
                {review.text}
              </p>

              {/* Image if any */}
              {review.image && (
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                  <Image src={review.image} alt="Reseña foto" fill className="object-cover" sizes="128px" />
                </div>
              )}

              {/* Interactions (mock) */}
              <div className="flex items-center gap-4 text-slate-500 text-xs mb-4 border-b border-slate-100 pb-4">
                <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <ThumbsUp size={14} /> Útil
                </button>
                <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                  <Share2 size={14} /> Compartir
                </button>
              </div>

              {/* Owner Response */}
              {review.ownerResponse && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center p-1">
                      <Image src="/media/logooptica.png" alt="Óptica Roma" width={16} height={16} className="object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 leading-tight">Optica Roma (propietario)</span>
                      <span className="text-[10px] text-slate-500">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {review.ownerResponse}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
