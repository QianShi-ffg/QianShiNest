export class CreateRoleDto {
  id?: number;
  name?: string;
  code?: string;
  permissions?: string[] | string;
}
