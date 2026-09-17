// Interpretación del test de visión. Función pura (sin React) para poder
// probarla sola. Los textos dicen "puede ser" o "es frecuente": el test orienta,
// no diagnostica, y siempre deriva al médico oftalmólogo.

export type Ojo = 'derecho' | 'izquierdo';
export type Lentes = 'no' | 'lejos' | 'cerca' | 'multifocales';
export type Diagrama = 'normal' | 'miopia' | 'hipermetropia' | 'presbicia' | 'astigmatismo' | 'retina' | 'contraste';

export type Respuestas = {
  edad: number;
  lentes: Lentes;
  calibrada: boolean;
  /** agudeza decimal de lejos alcanzada por ojo; tope = llegó al nivel más chico que dibuja la pantalla */
  lejos: Partial<Record<Ojo, { valor: number; tope: boolean }>>;
  maximoLejos: number;
  astigmatismo: Partial<Record<Ojo, boolean>>;
  amsler: Partial<Record<Ojo, boolean>>;
  /** menor contraste visto (1 = ninguno) */
  contraste?: number;
  /** letra más chica leída de cerca, en puntos tipográficos (null = ninguna) */
  cerca?: number | null;
};

export type Nivel = 'bien' | 'atencion' | 'pronto';

export type Medida = { prueba: string; detalle: string; nivel: Nivel; porcentaje?: number };

export type Hallazgo = {
  titulo: string;
  explicacion: string;
  diagrama: Diagrama;
  nivel: Nivel;
  enlace?: { texto: string; href: string };
};

export type Analisis = {
  nivel: Nivel;
  titular: string;
  bajada: string;
  medidas: Medida[];
  hallazgos: Hallazgo[];
};

export const AGUDEZAS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0];
export const PUNTOS_CERCA = [24, 18, 14, 12, 10, 8, 6, 5];
const decimo = (a: number) => `${Math.round(a * 10)}/10`;

export function analizar(r: Respuestas): Analisis {
  const medidas: Medida[] = [];
  const hallazgos: Hallazgo[] = [];
  const ojos: Ojo[] = ['derecho', 'izquierdo'];

  // ── Lejos ──
  let lejosMal = false;
  for (const ojo of ojos) {
    const a = r.lejos[ojo];
    if (!a) continue;
    const bien = a.valor >= 0.8 || (a.tope && a.valor >= r.maximoLejos);
    if (!bien) lejosMal = true;
    medidas.push({
      prueba: `De lejos, ojo ${ojo}`,
      detalle:
        a.valor === 0
          ? 'No llegaste a ver la letra más grande.'
          : `Viste hasta ${decimo(a.valor)}${a.tope && r.maximoLejos < 1 ? ', lo más chico que dibuja tu pantalla a esa distancia' : ''}.`,
      nivel: bien ? 'bien' : 'atencion',
      porcentaje: Math.round(Math.min(a.valor, 1) * 100),
    });
  }
  const d = r.lejos.derecho?.valor;
  const i = r.lejos.izquierdo?.valor;
  const diferencia = d !== undefined && i !== undefined && Math.abs(AGUDEZAS.indexOf(d) - AGUDEZAS.indexOf(i)) >= 2;

  // ── Cerca ──
  let cercaMal = false;
  if (r.cerca !== undefined) {
    const p = r.cerca;
    cercaMal = p === null || p >= 10;
    medidas.push({
      prueba: 'De cerca, a 40 cm',
      detalle:
        p === null
          ? 'No llegaste a leer la palabra más grande.'
          : p <= 6
            ? `Leíste letra muy chica (${p} puntos, como un prospecto de remedio).`
            : p <= 8
              ? `Leíste letra de diario (${p} puntos).`
              : `Leíste hasta letra de ${p} puntos: la letra de un diario te costó.`,
      nivel: p === null || p >= 14 ? 'atencion' : p >= 10 ? 'atencion' : 'bien',
      porcentaje: p === null ? 0 : Math.round(((PUNTOS_CERCA.length - PUNTOS_CERCA.indexOf(p)) / PUNTOS_CERCA.length) * 100),
    });
  }

  // ── Astigmatismo, Amsler y contraste ──
  const astig = ojos.filter((o) => r.astigmatismo[o] === false);
  for (const ojo of ojos) {
    const v = r.astigmatismo[ojo];
    if (v === undefined) continue;
    medidas.push({
      prueba: `Astigmatismo, ojo ${ojo}`,
      detalle: v ? 'Todas las líneas se vieron iguales.' : 'Algunas líneas se vieron más oscuras o borrosas.',
      nivel: v ? 'bien' : 'atencion',
    });
  }
  const amsler = ojos.filter((o) => r.amsler[o] === false);
  for (const ojo of ojos) {
    const v = r.amsler[ojo];
    if (v === undefined) continue;
    medidas.push({
      prueba: `Rejilla de Amsler, ojo ${ojo}`,
      detalle: v ? 'Las líneas se vieron rectas.' : 'Viste líneas torcidas, borrosas o que faltaban.',
      nivel: v ? 'bien' : 'pronto',
    });
  }
  const contrasteBajo = r.contraste !== undefined && r.contraste > 0.063;
  if (r.contraste !== undefined) {
    medidas.push({
      prueba: 'Contraste',
      detalle:
        r.contraste >= 1
          ? 'No llegaste a ver la primera letra clara.'
          : `Viste letras hasta un ${Math.round(r.contraste * 1000) / 10}% de contraste.`,
      nivel: contrasteBajo ? 'atencion' : 'bien',
    });
  }

  // ── Qué puede estar pasando ──
  const mayor40 = r.edad >= 40;

  if (cercaMal && mayor40) {
    hallazgos.push({
      titulo: 'Puede ser presbicia (vista cansada)',
      explicacion:
        'Con los años el cristalino, la lente de adentro del ojo, pierde flexibilidad y cuesta enfocar de cerca. Es muy frecuente a partir de los 40 o 45 años: se nota al alejar el celular o el diario para leer. Se corrige con lentes para leer o con multifocales.' +
        (lejosMal
          ? ' Como además te costó ver de lejos, muchas personas en tu situación usan multifocales: un mismo lente con la graduación de lejos arriba y la de cerca abajo.'
          : ''),
      diagrama: 'presbicia',
      nivel: 'atencion',
      enlace: lejosMal ? { texto: 'Cómo son los multifocales', href: '/projects/multifocales' } : undefined,
    });
  }

  if (cercaMal && !mayor40 && lejosMal) {
    // Antes de los 40, que cueste a todas las distancias no se explica con una sola causa
    hallazgos.push({
      titulo: 'Te cuesta ver de lejos y de cerca',
      explicacion:
        'Cuando cuesta enfocar a todas las distancias puede deberse a astigmatismo, a una hipermetropía alta u otras causas. El médico oftalmólogo lo confirma con un examen completo.',
      diagrama: 'hipermetropia',
      nivel: 'atencion',
    });
  } else if (cercaMal && !mayor40) {
    hallazgos.push({
      titulo: 'Puede ser hipermetropía',
      explicacion:
        'En la hipermetropía el ojo enfoca las imágenes detrás de la retina y cuesta más ver de cerca. A tu edad el ojo suele compensarlo haciendo fuerza, por eso puede dar cansancio, ardor o dolor de cabeza al leer o al usar pantallas.',
      diagrama: 'hipermetropia',
      nivel: 'atencion',
    });
  }

  if (lejosMal && !(cercaMal && !mayor40)) {
    hallazgos.push({
      titulo: 'Te cuesta ver de lejos: puede ser miopía',
      explicacion:
        'En la miopía el ojo enfoca las imágenes delante de la retina y lo lejano se ve borroso: carteles, la tele, el pizarrón. También puede deberse a astigmatismo u otras causas; el oftalmólogo lo confirma.',
      diagrama: 'miopia',
      nivel: 'atencion',
    });
  }

  if (astig.length > 0) {
    hallazgos.push({
      titulo: 'Puede ser astigmatismo',
      explicacion: `En ${astig.length === 2 ? 'los dos ojos' : `el ojo ${astig[0]}`} algunas líneas se vieron distintas. En el astigmatismo la córnea no es pareja y el ojo enfoca mejor en unas direcciones que en otras: las cosas se ven un poco borrosas o estiradas, de lejos y de cerca.`,
      diagrama: 'astigmatismo',
      nivel: 'atencion',
    });
  }

  if (amsler.length > 0) {
    hallazgos.push({
      titulo: 'Consultá pronto por lo que viste en la rejilla',
      explicacion: `Ver líneas torcidas, manchas o partes que faltan en ${amsler.length === 2 ? 'los dos ojos' : `el ojo ${amsler[0]}`} puede indicar un problema en la mácula, el centro de la retina. No siempre es algo grave, pero conviene que lo revise un médico oftalmólogo pronto${r.edad >= 50 ? ', sobre todo después de los 50' : ''}.`,
      diagrama: 'retina',
      nivel: 'pronto',
    });
  }

  if (contrasteBajo) {
    hallazgos.push({
      titulo: 'Te costó ver con poco contraste',
      explicacion:
        'Distinguir tonos parecidos ayuda a manejar de noche, bajar escaleras o ver con poca luz. Puede bajar por muchas razones, como el cansancio o cambios en el cristalino con la edad. Tené en cuenta que depende mucho del brillo de tu pantalla.',
      diagrama: 'contraste',
      nivel: 'atencion',
    });
  }

  if (diferencia) {
    medidas.push({ prueba: 'Diferencia entre ojos', detalle: 'Un ojo vio bastante menos que el otro.', nivel: 'atencion' });
  }

  const hayPronto = hallazgos.some((h) => h.nivel === 'pronto');
  const todoBien = hallazgos.length === 0 && !diferencia;
  const usaLentes = r.lentes !== 'no';

  let bajada: string;
  if (hayPronto) {
    bajada =
      'Lo que viste en la rejilla conviene revisarlo pronto con un médico oftalmólogo, antes que cualquier otra cosa. Si no tenés receta, te derivamos.';
  } else if (todoBien) {
    bajada = mayor40
      ? 'Aunque hoy veas bien, a partir de los 40 es común que la vista de cerca empiece a cambiar. Hacete controles con el médico oftalmólogo cada tanto.'
      : 'Igual es bueno hacerse un control con el médico oftalmólogo cada tanto, y antes si notás cambios.';
  } else if (usaLentes) {
    bajada =
      'Como ya usás lentes, puede ser que tu graduación haya cambiado. Te recomendamos un control con un médico oftalmólogo; si no tenés receta, te derivamos.';
  } else {
    bajada = 'Te recomendamos un control con un médico oftalmólogo para confirmarlo. Si no tenés receta, te derivamos.';
  }

  return {
    nivel: hayPronto ? 'pronto' : todoBien ? 'bien' : 'atencion',
    titular: todoBien
      ? 'Tu vista respondió bien en este test'
      : hayPronto
        ? 'Te recomendamos consultar pronto con un oftalmólogo'
        : 'Te recomendamos consultar con un oftalmólogo',
    bajada,
    medidas,
    hallazgos,
  };
}
