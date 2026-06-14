export class CreateProjectDto {
  title: string;
  category?: string;
  projectType?: string;
  desc?: string;
  longDesc?: string;
  image?: string;
  images?: string[] | string;
  videoUrl?: string;
  tags?: string[] | string;
  role?: string;
  date?: string;
  github?: string;
  demo?: string;
}
