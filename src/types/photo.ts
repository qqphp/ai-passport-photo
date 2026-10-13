export type PhotoToolTab = "background" | "size";

export interface PhotoState {
  originalImage: string | null;
  processedImage: string | null;
  rotation?: number;
}

export interface PhotoSize {
  id: string;
  name: string;
  width: number;
  height: number;
  print: 1 | 2;
  specs: string;
  sd_width: number;
  sd_height: number;
  sd_dpi: number;
  sd_size_min?: number;
  sd_size_max?: number;
}

export interface PhotoCategory {
  id: string;
  name: string;
  subcategories?: PhotoCategory[];
  sizes?: PhotoSize[];
}
