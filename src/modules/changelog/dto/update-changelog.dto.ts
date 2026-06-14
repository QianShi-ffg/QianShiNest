import { PartialType } from '@nestjs/mapped-types';
import { CreateChangelogDto } from './create-changelog.dto';

export class UpdateChangelogDto extends PartialType(CreateChangelogDto) {}
