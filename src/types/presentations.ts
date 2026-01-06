export interface Presentation {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  date: string;
  tags?: string[];
}

export type Presentations = Presentation[];
