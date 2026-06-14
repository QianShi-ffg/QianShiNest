export class CreateResumeDto {
  title?: string;
  subtitle?: string;
  name?: string;
  role?: string;
  avatar?: string;
  resumeFile?: string;
  resumePassword?: string;
  location?: string;
  email?: string;
  summary?: string;
  skills?: unknown[] | string;
  experiences?: unknown[] | string;
  educations?: unknown[] | string;
  projects?: unknown[] | string;
}
