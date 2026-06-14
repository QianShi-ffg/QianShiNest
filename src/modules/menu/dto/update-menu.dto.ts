export class UpdateMenuDto {
  name?: string;
  icon?: string;
  sort?: number;
  visible?: boolean;
}

export class UpdateMenuSortDto {
  items: {
    id: number;
    sort: number;
  }[];
}
