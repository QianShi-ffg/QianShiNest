export class CreateChangelogDto {
  version: string;
  date?: string;
  tag?: string;
  title: string;
  changes?: unknown[] | string;
}
