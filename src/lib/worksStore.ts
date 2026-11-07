/**
 * src/lib/worksStore.ts
 * ─────────────────────
 * Unified store for completed work showcase items (Hamara Kaam).
 * Works seamlessly with Supabase when configured, or persistent JSON file
 * storage during local development/mock mode.
 */

import fs from "node:fs";
import path from "node:path";
import { getServiceClient } from "@/lib/supabase/server";

export interface WorkItem {
  id: string;
  title: string;
  category: string;
  description: string;
  before_image?: string | null;
  after_image: string;
  tags?: string[];
  tag_text?: string | null;
  customer_note?: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at?: string;
}

const DEFAULT_WORKS: WorkItem[] = [
  {
    id: "work-1",
    title: "Bridal Silk Lehenga Zari & Spot Care",
    category: "Saree & Lehenga",
    description:
      "Shaadi ke baad haldi aur mehendi ke daag safe eco-solvent spotting se 100% remove kiye gaye, gota-patti aur zari ki original shine restore hui.",
    before_image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    after_image:
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    tags: ["Bridal Care", "Haldi Daag Clean", "Zari Polish"],
    tag_text: "100% Zari Safe · Haldi Daag Clean",
    customer_note: "Bhilwara mein sabse safe bridal lehenga cleaning!",
    is_featured: true,
    is_active: true,
    display_order: 1,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "work-2",
    title: "Groom Designer Sherwani & Stole Finishing",
    category: "Wedding Wear",
    description:
      "Delicate embroidery aur velvet work par special dry solvent clean kiya gaya aur Italian steam mannequin par crisp shape diya.",
    before_image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    after_image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    tags: ["Sherwani", "Steam Press", "Wedding"],
    tag_text: "Steam Iron Finish · Zero Shrink",
    customer_note: "Shaadi ke din bilkul showroom jaisa fresh look mila.",
    is_featured: true,
    is_active: true,
    display_order: 2,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "work-3",
    title: "Pure Woolen Blazer & Coat Lint Restoration",
    category: "Winter Care",
    description:
      "Thand ke mausam mein lint, odour aur dust remove karke fabric soft conditioner treatment diya gaya.",
    before_image:
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
    after_image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
    tags: ["Woolmark Safe", "Lint Free", "Winter Wear"],
    tag_text: "Lint-Free · Woolmark Approved",
    customer_note: "Puraani coat bilkul nayi jaisi mulayam ho gayi.",
    is_featured: true,
    is_active: true,
    display_order: 3,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "work-4",
    title: "Double Bed Mink Blanket Deep Hygiene Wash",
    category: "Rajai & Kambal",
    description:
      "Heavy kambal ki anti-bacterial hygiene wash aur vacuum packaging, taaki agle season tak khushbudar aur safe rahe.",
    before_image:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
    after_image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
    tags: ["Anti-Bacterial", "Heavy Wash", "Fragrance Pack"],
    tag_text: "Anti-Bacterial · Vacuum Pack",
    customer_note: "Ghar par wash karna mushkil tha, Balaji ne bohot badhiya safai ki.",
    is_featured: false,
    is_active: true,
    display_order: 4,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "work-5",
    title: "White Formal Shirt Tea & Ink Stain Removal",
    category: "Stain Removal",
    description:
      "Collar par chai aur pen ki ink ka ziddi daag specialised spotting reagent se bina fabric kamzor kiye mitaya.",
    before_image:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
    after_image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    tags: ["Spotting", "Ink Removal", "Tea Stain"],
    tag_text: "Spotting Specialist · Daag Mukt",
    customer_note: "Daag bilkul gayab ho gaya, collar bilkul safed!",
    is_featured: true,
    is_active: true,
    display_order: 5,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];

function isMockMode(): boolean {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT") ||
    process.env.NODE_ENV === "test"
  );
}

function getDataFilePath(): string {
  return path.join(process.cwd(), "data", "works.json");
}

function readLocalWorks(): WorkItem[] {
  try {
    const filePath = getDataFilePath();
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(DEFAULT_WORKS, null, 2), "utf8");
      return DEFAULT_WORKS;
    }
    const data = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : DEFAULT_WORKS;
  } catch (err) {
    console.error("[WorksStore:readLocalWorks]", err);
    return DEFAULT_WORKS;
  }
}

function writeLocalWorks(items: WorkItem[]): void {
  try {
    const filePath = getDataFilePath();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf8");
  } catch (err) {
    console.error("[WorksStore:writeLocalWorks]", err);
  }
}

/**
 * Fetch public active works
 */
export async function getPublicWorks(): Promise<WorkItem[]> {
  if (isMockMode()) {
    const items = readLocalWorks();
    return items
      .filter((w) => w.is_active)
      .sort((a, b) => a.display_order - b.display_order);
  }

  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from("works")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return readLocalWorks().filter((w) => w.is_active);
    }
    return data.map((d) => ({ ...d, tags: d.tags || [] }));
  } catch (err) {
    console.error("[WorksStore:getPublicWorks]", err);
    return readLocalWorks().filter((w) => w.is_active);
  }
}

/**
 * Fetch all works for admin (including inactive)
 */
export async function getAllWorksForAdmin(): Promise<WorkItem[]> {
  if (isMockMode()) {
    const items = readLocalWorks();
    return items.sort((a, b) => a.display_order - b.display_order);
  }

  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from("works")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return readLocalWorks();
    }
    return data.map((d) => ({ ...d, tags: d.tags || [] }));
  } catch (err) {
    console.error("[WorksStore:getAllWorksForAdmin]", err);
    return readLocalWorks();
  }
}

/**
 * Create a new work item
 */
export async function createWorkItem(item: Omit<WorkItem, "id" | "created_at">): Promise<WorkItem> {
  const newId = `work-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newRecord: WorkItem = {
    ...item,
    id: newId,
    created_at: now,
    updated_at: now,
  };

  if (isMockMode()) {
    const current = readLocalWorks();
    current.unshift(newRecord);
    writeLocalWorks(current);
    return newRecord;
  }

  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from("works")
      .insert({
        title: item.title,
        category: item.category,
        description: item.description,
        before_image: item.before_image || null,
        after_image: item.after_image,
        tags: item.tags || [],
        tag_text: item.tag_text || null,
        customer_note: item.customer_note || null,
        is_featured: !!item.is_featured,
        is_active: item.is_active !== false,
        display_order: item.display_order || 0,
      })
      .select("*")
      .single();

    if (error || !data) {
      console.warn("[WorksStore:createSupabaseFallback]", error);
      const current = readLocalWorks();
      current.unshift(newRecord);
      writeLocalWorks(current);
      return newRecord;
    }
    return { ...data, tags: data.tags || [] };
  } catch (err) {
    console.error("[WorksStore:createWorkItem]", err);
    const current = readLocalWorks();
    current.unshift(newRecord);
    writeLocalWorks(current);
    return newRecord;
  }
}

/**
 * Update an existing work item
 */
export async function updateWorkItem(
  id: string,
  updates: Partial<Omit<WorkItem, "id" | "created_at">>
): Promise<WorkItem | null> {
  const now = new Date().toISOString();

  if (isMockMode()) {
    const items = readLocalWorks();
    const index = items.findIndex((w) => w.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      updated_at: now,
    };
    writeLocalWorks(items);
    return items[index];
  }

  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from("works")
      .update({
        ...updates,
        updated_at: now,
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      console.warn("[WorksStore:updateSupabaseFallback]", error);
      const items = readLocalWorks();
      const index = items.findIndex((w) => w.id === id);
      if (index === -1) return null;
      items[index] = { ...items[index], ...updates, updated_at: now };
      writeLocalWorks(items);
      return items[index];
    }
    return { ...data, tags: data.tags || [] };
  } catch (err) {
    console.error("[WorksStore:updateWorkItem]", err);
    return null;
  }
}

/**
 * Delete a work item
 */
export async function deleteWorkItem(id: string): Promise<boolean> {
  if (isMockMode()) {
    const items = readLocalWorks();
    const filtered = items.filter((w) => w.id !== id);
    if (filtered.length === items.length) return false;
    writeLocalWorks(filtered);
    return true;
  }

  try {
    const db = getServiceClient();
    const { error } = await db.from("works").delete().eq("id", id);
    if (error) {
      console.warn("[WorksStore:deleteSupabaseFallback]", error);
      const items = readLocalWorks();
      const filtered = items.filter((w) => w.id !== id);
      writeLocalWorks(filtered);
      return true;
    }
    return true;
  } catch (err) {
    console.error("[WorksStore:deleteWorkItem]", err);
    return false;
  }
}
