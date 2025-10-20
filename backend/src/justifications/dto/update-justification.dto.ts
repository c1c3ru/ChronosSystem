import { IsString, IsEnum, IsOptional, IsArray, IsUrl, IsInt, Min, IsISO8601 } from 'class-validator';
import { JustificationType, JustificationCategory } from '@prisma/client';

export class UpdateJustificationDto {
  @IsOptional()
  @IsEnum(JustificationCategory)
  category?: JustificationCategory;

  @IsOptional()
  @IsEnum(JustificationType)
  type?: JustificationType;

  @IsOptional()
  @IsString()
  reason?: string;

  // Campos específicos para atrasos
  @IsOptional()
  @IsInt()
  @Min(1)
  delayMinutes?: number;

  @IsOptional()
  @IsISO8601()
  expectedTime?: string;

  @IsOptional()
  @IsISO8601()
  actualTime?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  documentLinks?: string[];
}
