export class CreateDiaryDto {
  type: string;
  media?: string;
  poster?: string;
  content: string;
  longContent?: string;
  location?: string;
  date?: string;
  weather?: string;
  likes?: number;
  comments?: number;
}
