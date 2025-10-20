import { IsEnum, IsOptional, IsString } from 'class-validator';
import { JustificationStatus } from '@prisma/client';

export class ReviewJustificationDto {
  @IsEnum(JustificationStatus)
  status: JustificationStatus;

  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
