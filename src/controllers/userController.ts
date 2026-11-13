import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export async function createUser(req: Request, res: Response) {
  try {
    const { name, email, age } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        age: age ? Number(age) : null,
      },
    });

    return res.status(201).json(user);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }
    return res.status(500).json({ error: error.message || 'Erro ao criar usuário' });
  }
}

export async function getUsers(_req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' },
    });
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Erro ao listar usuários' });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Erro ao buscar usuário' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const { name, email, age } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        age: age !== undefined ? (age === null ? null : Number(age)) : undefined,
      },
    });

    return res.json(user);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email já em uso por outro usuário' });
    }
    return res.status(500).json({ error: error.message || 'Erro ao atualizar usuário' });
  }
}

export async function patchUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const { name, email, age } = req.body;
    const data: { name?: string; email?: string; age?: number | null } = {};

    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (age !== undefined) data.age = age === null ? null : Number(age);

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return res.json(user);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email já em uso por outro usuário' });
    }
    return res.status(500).json({ error: error.message || 'Erro ao atualizar usuário' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    await prisma.user.delete({
      where: { id },
    });

    return res.json({ message: 'Usuário removido com sucesso' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    return res.status(500).json({ error: error.message || 'Erro ao remover usuário' });
  }
}
