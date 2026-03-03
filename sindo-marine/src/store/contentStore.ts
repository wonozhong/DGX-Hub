import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Define types for our content
interface HeroContent {
  title: string;
  subtitle: string;
}

interface AboutContent {
  description: string;
  vision: string;
  mission: string;
}

interface ContactContent {
  phone1: string;
  phone2: string;
  fax: string;
  emailGeneral: string;
  emailPerson: string;
  address: string;
}

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  images: string[];
}

interface ContentState {
  hero: HeroContent;
  about: AboutContent;
  contact: ContactContent;
  products: ProductItem[];
  isLoading: boolean;
  
  // Actions
  fetchContent: () => Promise<void>;
  updateHero: (data: Partial<HeroContent>) => Promise<void>;
  updateAbout: (data: Partial<AboutContent>) => Promise<void>;
  updateContact: (data: Partial<ContactContent>) => Promise<void>;
  addProduct: (product: ProductItem) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

const defaultHero = {
  title: "Excellence in <br /> <span class='text-secondary'>Marine Solutions</span>",
  subtitle: "Founded in 2006, Sindo Marine is a leading ship building and marine specialist offering comprehensive construction services, vessel repairing, and marine accommodation across Asia.",
};

const defaultAbout = {
  description: "Located in Batam-Indonesia, Sindo Marine is a leading ship building and marine specialist offering a wide range of construction services and vessel repairing, enhanced with marine accommodation supply and works capabilities across Asia.",
  vision: "Sindo Marine - A customer-focused, responsive provider of innovative solutions and to excel in providing diverse marine accommodation services.",
  mission: "To exceed the expectations of every client by offering outstanding customer service, increased flexibility, and greater value, thus optimizing functionality and improving operation efficiency.",
};

const defaultContact = {
  phone1: "+62 (778) 396228",
  phone2: "+62 (778) 7058408",
  fax: "+62 (778) 3581228",
  emailGeneral: "sm@ptsindomarine.co.id",
  emailPerson: "sam@ptsindomarine.co.id",
  address: "Jl. Brigjend Katamso RT 02 RW 01, Kel. Tanjung Uncang Kec. Batu Aji, Batam - Indonesia",
};

export const useContentStore = create<ContentState>((set, get) => ({
  hero: defaultHero,
  about: defaultAbout,
  contact: defaultContact,
  products: [],
  isLoading: false,

  fetchContent: async () => {
    set({ isLoading: true });
    try {
      // Fetch Settings
      const { data: settingsData } = await supabase.from('sindo_settings').select('*');
      
      if (settingsData) {
        const heroData = settingsData.find(item => item.key === 'hero')?.value;
        const aboutData = settingsData.find(item => item.key === 'about')?.value;
        const contactData = settingsData.find(item => item.key === 'contact')?.value;

        set({
          hero: heroData || defaultHero,
          about: aboutData || defaultAbout,
          contact: contactData || defaultContact,
        });
      }

      // Fetch Products
      const { data: productsData } = await supabase.from('sindo_products').select('*').order('created_at', { ascending: true });
      if (productsData) {
        set({ products: productsData });
      }

    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateHero: async (data) => {
    const newHero = { ...get().hero, ...data };
    set({ hero: newHero });
    await supabase.from('sindo_settings').upsert({ key: 'hero', value: newHero });
  },

  updateAbout: async (data) => {
    const newAbout = { ...get().about, ...data };
    set({ about: newAbout });
    await supabase.from('sindo_settings').upsert({ key: 'about', value: newAbout });
  },

  updateContact: async (data) => {
    const newContact = { ...get().contact, ...data };
    set({ contact: newContact });
    await supabase.from('sindo_settings').upsert({ key: 'contact', value: newContact });
  },

  addProduct: async (product) => {
    set((state) => ({ products: [...state.products, product] }));
    await supabase.from('sindo_products').insert(product);
  },

  removeProduct: async (id) => {
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
    await supabase.from('sindo_products').delete().eq('id', id);
  },
}));
