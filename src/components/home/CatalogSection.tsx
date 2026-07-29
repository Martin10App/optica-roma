'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import { ChevronDown, ChevronUp, Check, Filter, X, SearchX } from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface Product {
  id: number;
  modelo: string;
  marca: string;
  categoria: string;
  precio: number;
  imagen_url: string;
}

const CATEGORIES = ['Todas', 'Armazones de Receta', 'Lentes de Sol', 'Lentes de Contacto', 'Accesorios'];
const LOCKED_BRAND_CATEGORIES = ['Todas', 'Armazones de Receta', 'Lentes de Sol'];

function CatalogContent({ lockedBrand, title }: { lockedBrand?: string; title?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  useScrollReveal();
  // State from URL or defaults
  const initialCategory = searchParams.get('categoria');
  // Match initial category from URL to our exact names (case insensitive)
  const matchedCategory = initialCategory 
    ? CATEGORIES.find(c => c.toLowerCase().replace(/-/g, ' ') === initialCategory.toLowerCase().replace(/-/g, ' ')) || 'Todas'
    : 'Todas';

  const [activeCategory, setActiveCategory] = useState<string>(matchedCategory);
  const initialBrands = searchParams.get('marcas') ? searchParams.get('marcas')!.split(',').filter(Boolean) : [];
  const [activeBrands, setActiveBrands] = useState<string[]>(initialBrands);
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI states
  const [isBrandsOpen, setIsBrandsOpen] = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Fetch unique brands based on category
  useEffect(() => {
    async function fetchBrands() {
      try {
        const params = new URLSearchParams();
        if (activeCategory !== 'Todas') {
          params.set('categoria', activeCategory.toLowerCase().replace(/\s+/g, '-'));
        }
        const res = await fetch(`/api/armazones/marcas?${params.toString()}`);
        const json = await res.json();
        if (json.success) setAvailableBrands(json.data);
      } catch (err) {
        console.error("Failed to load brands", err);
      }
    }
    fetchBrands();
  }, [activeCategory]);

  // Fetch products based on filters
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', limit.toString());
      params.set('sort', sortOrder);
      
      if (activeCategory !== 'Todas') {
        params.set('categoria', activeCategory.toLowerCase().replace(/\s+/g, '-'));
      }
      if (lockedBrand) {
        params.set('marcas', lockedBrand);
      } else if (activeBrands.length > 0) {
        params.set('marcas', activeBrands.join(','));
      }

      const res = await fetch(`/api/armazones?${params.toString()}`);
      if (!res.ok) throw new Error('Error al cargar catálogo');
      const json = await res.json();
      
      if (json.success) {
        setProducts(json.data);
        setTotalItems(json.pagination.total);
        setTotalPages(json.pagination.totalPages);
      } else {
        throw new Error(json.error || 'Error desconocido');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, activeBrands, sortOrder, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync category and brand state when URL changes
  useEffect(() => {
    let changed = false;
    const catUrl = searchParams.get('categoria');
    if (catUrl) {
      const matched = CATEGORIES.find(c => c.toLowerCase().replace(/-/g, ' ') === catUrl.toLowerCase().replace(/-/g, ' '));
      if (matched && matched !== activeCategory) {
        setActiveCategory(matched);
        changed = true;
      }
    }
    
    const marcasUrl = searchParams.get('marcas');
    const urlBrands = marcasUrl ? marcasUrl.split(',').filter(Boolean) : [];
    if (JSON.stringify(urlBrands) !== JSON.stringify(activeBrands)) {
      setActiveBrands(urlBrands);
      changed = true;
    }
    
    if (changed) {
      setCurrentPage(1);
    }
  }, [searchParams]);

  const pathname = usePathname();

  // Update URL when category changes to allow sharing links
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (!lockedBrand) {
      setActiveBrands([]); // Clear brands when changing category
      params.delete('marcas');
    }
    
    if (cat === 'Todas') {
      params.delete('categoria');
    } else {
      params.set('categoria', cat.toLowerCase().replace(/\s+/g, '-'));
    }
    router.push(`${pathname}?${params.toString()}#catalogo`, { scroll: false });
  };

  const toggleBrand = (brand: string) => {
    setActiveBrands(prev => {
      const newBrands = prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand];
      
      // Sync URL
      const params = new URLSearchParams(searchParams.toString());
      if (newBrands.length > 0) {
        params.set('marcas', newBrands.join(','));
      } else {
        params.delete('marcas');
      }
      
      router.push(`${pathname}?${params.toString()}#catalogo`, { scroll: false });
      
      return newBrands;
    });
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
  };

  const clearBrands = () => {
    setActiveBrands([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('marcas');
    router.push(`${pathname}?${params.toString()}#catalogo`, { scroll: false });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActiveCategory('Todas');
    setActiveBrands([]);
    router.push(`${pathname}#catalogo`, { scroll: false });
    setCurrentPage(1);
  };

  return (
    <section id="catalogo" className="py-20 md:py-28 bg-white relative">
      {/* Separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="section-label mb-5 inline-flex">
            <span className={`w-1.5 h-1.5 rounded-full animate-ping-slow ${lockedBrand ? 'bg-[#c0203a]' : 'bg-brand-400'}`} />
            {lockedBrand ? 'Colección Exclusiva' : 'Catálogo'}
          </div>
          {title ? (
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
          ) : (
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Explorá nuestros <span className="gradient-text">armazones</span>
            </h2>
          )}
        </div>
        
        {/* Mobile Filter Button */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <p className="text-slate-500 text-sm">{totalItems} productos</p>
          <button 
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2 rounded-full font-medium text-sm"
          >
            <Filter size={16} />
            Filtros
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className={`w-full md:w-1/4 flex-shrink-0 ${isMobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
            <div className="sticky top-28">
              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Categorías</h3>
                <ul className="space-y-1">
                  {(lockedBrand ? LOCKED_BRAND_CATEGORIES : CATEGORIES).map(cat => (
                    <li key={cat}>
                      <button
                        onClick={() => handleCategoryChange(cat)}
                        className={`w-full text-left py-2 px-3 rounded-xl text-sm transition-all duration-200 ${
                          activeCategory === cat 
                            ? (lockedBrand ? 'bg-[#fdf2f2] text-[#c0203a] font-bold border border-[#c0203a]/40' : 'bg-brand-50 text-brand-800 font-bold border border-brand-300') 
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Brands */}
              {!lockedBrand && (
                <div className="border-t border-slate-200 pt-5">
                  <button 
                    onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-4"
                  >
                    Marcas
                    {isBrandsOpen ? <ChevronUp size={16} className="text-brand-400" /> : <ChevronDown size={16} className="text-brand-400" />}
                  </button>
                  
                  {isBrandsOpen && (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {availableBrands.map(brand => (
                        <label 
                          key={brand} 
                          onClick={() => toggleBrand(brand)}
                          className="flex items-center gap-3 cursor-pointer group py-0.5 select-none"
                        >
                          <div
                            className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all duration-200 ${
                              activeBrands.includes(brand) 
                                ? 'bg-brand-500 border-brand-500' 
                                : 'border-slate-300 group-hover:border-brand-400'
                            }`}
                          >
                            {activeBrands.includes(brand) && <Check size={10} className="text-white" />}
                          </div>
                          <span className="text-sm text-slate-500 group-hover:text-slate-900 transition-colors">{brand}</span>
                        </label>
                      ))}
                      {availableBrands.length === 0 && (
                        <p className="text-sm text-slate-600 italic">Cargando marcas...</p>
                      )}
                    </div>
                  )}

                  {/* Clear filters */}
                  {activeBrands.length > 0 && (
                    <button
                      onClick={clearBrands}
                      className="mt-4 flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                      <X size={12} />
                      Limpiar marcas ({activeBrands.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="w-full md:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-slate-200">
              <div className="mb-4 sm:mb-0 flex items-center gap-4">
                <p className="text-sm text-slate-500">
                  Mostrando <span className="font-bold text-slate-900">{totalItems}</span> productos
                  {activeCategory !== 'Todas' && <span> en <span className={`font-bold ${lockedBrand ? 'text-[#c0203a]' : 'text-brand-800'}`}>{activeCategory}</span></span>}
                </p>
                {(activeBrands.length > 0 || activeCategory !== 'Todas') && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      const btn = document.getElementById('share-btn-text');
                      if (btn) {
                        const original = btn.innerText;
                        btn.innerText = '¡Copiado!';
                        setTimeout(() => { btn.innerText = original; }, 2000);
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-800 bg-brand-50 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                    <span id="share-btn-text">Copiar Enlace</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm font-medium text-slate-500">Ordenar por:</label>
                <select 
                  id="sort"
                  value={sortOrder}
                  onChange={handleSortChange}
                  className="bg-white border border-slate-300 text-slate-600 text-sm rounded-xl focus:ring-brand-500 focus:border-brand-500 block p-2.5"
                >
                  <option value="newest">Más recientes</option>
                  <option value="bestsellers">Más vendidos</option>
                  <option value="price_asc">Precio: Menor a Mayor</option>
                  <option value="price_desc">Precio: Mayor a Menor</option>
                </select>
              </div>
            </div>

            <div className="relative min-h-[600px]">
              {isLoading && (
                <div className="absolute inset-0 bg-white/70 z-10 flex flex-col items-center justify-start pt-32 backdrop-blur-[2px]">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-brand-800 animate-spin shadow-lg" />
                    <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent animate-spin" style={{borderBottomColor:'#06b6d4', animationDirection:'reverse', animationDuration:'0.8s'}} />
                  </div>
                  <p className="text-slate-700 font-semibold text-sm mt-4 bg-white px-4 py-1 rounded-full shadow-sm">Cargando...</p>
                </div>
              )}

              {error ? (
                <div className="text-center py-20 card p-8 relative z-0">
                  <p className="text-red-600 font-medium">No se pudo cargar el catálogo.</p>
                  <p className="text-slate-500 text-sm mt-2">{error}</p>
                </div>
              ) : products.length === 0 && !isLoading ? (
                <div className="text-center py-20 card p-8 relative z-0">
                  <SearchX className="mx-auto mb-3 text-slate-400" size={30} strokeWidth={1.5} aria-hidden="true" />
                  <p className="text-slate-600 font-semibold text-lg mb-2">No encontramos productos</p>
                  <p className="text-slate-500 text-sm mb-6">No hay productos que coincidan con tu búsqueda.</p>
                  <button 
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-brand-800 hover:bg-brand-900 rounded-full text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className={`transition-opacity duration-300 relative z-0 ${isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  {/* `stagger` hace que las tarjetas entren de a una, 45ms
                      aparte, en vez de aparecer las doce de golpe. */}
                  <div className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-12">
                      <button 
                        onClick={() => {
                          setCurrentPage(p => Math.max(1, p - 1));
                          const section = document.getElementById('catalogo');
                          if (section) {
                            const y = section.getBoundingClientRect().top + window.scrollY - 100;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                          }
                        }}
                        disabled={currentPage === 1}
                        className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 font-medium text-sm transition-all"
                      >
                        ← Anterior
                      </button>
                      <span className="text-sm font-medium text-slate-500 px-2">
                        {currentPage} / {totalPages}
                      </span>
                      <button 
                        onClick={() => {
                          setCurrentPage(p => Math.min(totalPages, p + 1));
                          const section = document.getElementById('catalogo');
                          if (section) {
                            const y = section.getBoundingClientRect().top + window.scrollY - 100;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                          }
                        }}
                        disabled={currentPage === totalPages}
                        className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 font-medium text-sm transition-all"
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

export default function CatalogSection({ lockedBrand, title }: { lockedBrand?: string; title?: string }) {
  return (
    <Suspense fallback={
      <div className="py-24 text-center bg-white">
        <div className="inline-block w-12 h-12 rounded-full border-2 border-brand-950 animate-spin" style={{borderTopColor:'#4f8ef7'}} />
        <p className="mt-4 text-slate-500">Cargando catálogo...</p>
      </div>
    }>
      <CatalogContent lockedBrand={lockedBrand} title={title} />
    </Suspense>
  );
}
