import { z } from 'zod';

export const MAOPInputSchema = z.object({
  OD: z.number().positive('OD debe ser mayor a 0'),
  t: z.number().positive('Espesor debe ser mayor a 0'),
  SMYS: z.number().positive('SMYS debe ser mayor a 0'),
  F: z.number().optional().default(0.72),
  E_joint: z.number().optional().default(1.0),
  T_op: z.number().optional().default(20),
});

export const SignupSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  name: z.string().min(2, 'Nombre inválido'),
  company: z.string().optional(),
  country: z.string().optional(),
  license: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const ProjectSchema = z.object({
  name: z.string().min(3, 'Nombre proyecto mínimo 3 caracteres'),
  description: z.string().optional(),
  client: z.string().optional(),
  type: z.enum(['petroleo', 'hidraulica', 'geotecnia', 'civil', 'mineria']),
});

export type MAOPInput = z.infer<typeof MAOPInputSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ProjectInput = z.infer<typeof ProjectSchema>;