export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  location: string;
  category: string;
  featured: boolean;
  description: string | null;
  url: string | null;
  created_at: string;
  // Eligibility fields
  min_gpa: number | null;
  eligible_levels: string[] | null;       // e.g. ["Undergraduate", "Graduate"]
  eligible_genders: string | null;        // "Any" | "Female" | "Male"
  income_level: string | null;            // "Any" | "Low" | "Middle" | "High"
  min_age: number | null;
  max_age: number | null;
  eligible_nationalities: string | null;  // "All" | specific nationality
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  field_of_study: string | null;
  graduation_year: number | null;
  age: number | null;
  gender: string | null;
  nationality: string | null;
  income_level: string | null;
  academic_level: string | null;
  gpa: number | null;

  created_at: string;
}

export interface SavedScholarship {
  id: string;
  user_id: string;
  scholarship_id: string;
  saved_at: string;
  scholarship?: Scholarship;
}
